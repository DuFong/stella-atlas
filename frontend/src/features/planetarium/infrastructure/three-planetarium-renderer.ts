import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type {
  PlanetariumScene,
  PlanetariumViewState,
  SkyObject,
} from "@/features/planetarium/domain/planetarium";
import type { PlanetariumRenderer } from "./planetarium-renderer";

const SKY_RADIUS = 100;
const MAX_PIXEL_RATIO = 2;

type LabelEntry = {
  sprite: Sprite;
  text: string;
  object?: SkyObject;
  constellation: boolean;
};

const STAR_VERTEX_SHADER = `
  attribute float objectSize;
  attribute float objectSelected;
  attribute float objectKind;
  attribute vec3 objectColor;
  uniform float pixelRatio;
  varying vec3 vColor;
  varying float vSelected;
  varying float vKind;

  void main() {
    vColor = objectColor;
    vSelected = objectSelected;
    vKind = objectKind;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = objectSize * mix(1.0, 1.7, objectSelected) * pixelRatio;
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vSelected;
  varying float vKind;

  void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceFromCenter > 0.5) {
      discard;
    }
    if (vKind > 1.5 && vKind < 2.5 && distance(gl_PointCoord, vec2(0.65, 0.42)) < 0.32) {
      discard;
    }
    float core = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
    float alpha = smoothstep(0.5, 0.08, distanceFromCenter);
    vec3 baseColor = mix(vColor * 0.72, vColor * 1.35, core);
    vec3 highlightColor = mix(baseColor, vec3(0.78, 0.95, 0.35), 0.72);
    vec3 color = mix(baseColor, highlightColor, vSelected);
    if (vKind > 2.5 && distanceFromCenter > 0.36) {
      color = mix(color, vec3(1.0), 0.45);
    }
    gl_FragColor = vec4(color, alpha);
  }
`;

export class ThreePlanetariumRenderer implements PlanetariumRenderer {
  private renderer: WebGLRenderer | null = null;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(75, 1, 0.1, 500);
  private readonly raycaster = new Raycaster();
  private pointCloud: Points<BufferGeometry, ShaderMaterial> | null = null;
  private constellationLines: LineSegments<BufferGeometry, LineBasicMaterial> | null = null;
  private milkyWayRibbon: Mesh<BufferGeometry, MeshBasicMaterial> | null = null;
  private horizonLine: LineLoop<BufferGeometry, LineBasicMaterial> | null = null;
  private cardinalSprites: Sprite[] = [];
  private objectLabels: LabelEntry[] = [];
  private objectIds: string[] = [];
  private selectedObjectId: string | undefined;
  private quality: PlanetariumViewState["quality"] = "full";
  private autoReduced = false;
  private readonly renderDurations: number[] = [];
  private viewportWidth = 1;
  private viewportHeight = 1;
  private pixelRatio = 1;

  initialize(canvas: HTMLCanvasElement): void {
    if (this.renderer) {
      throw new Error("Planetarium renderer is already initialized.");
    }
    if (typeof WebGL2RenderingContext === "undefined") {
      throw new Error("WebGL 2 is not available.");
    }

    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      powerPreference: "high-performance",
    });
    if (!(context instanceof WebGL2RenderingContext)) {
      throw new Error("WebGL 2 initialization failed.");
    }

    this.renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true });
    if (context.isContextLost()) {
      this.renderer.dispose();
      this.renderer = null;
      throw new Error("WebGL 2 context was lost during initialization.");
    }
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x050914, 0);
    this.camera.position.set(0, 0, 0);
    this.raycaster.params.Points = { threshold: 2.5 };
    this.addHorizon();
  }

  resize(width: number, height: number, pixelRatio: number): void {
    const renderer = this.requiredRenderer();
    this.viewportWidth = Math.max(width, 1);
    this.viewportHeight = Math.max(height, 1);
    this.pixelRatio = this.autoReduced
      ? 1
      : Math.min(Math.max(pixelRatio, 1), MAX_PIXEL_RATIO);
    renderer.setPixelRatio(this.pixelRatio);
    renderer.setSize(this.viewportWidth, this.viewportHeight, false);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.updateProjectionMatrix();
    this.updatePixelRatioUniform();
    this.updateLabelVisibility(this.quality);
  }

  updateScene(scene: PlanetariumScene): void {
    this.requiredRenderer();
    this.removeSceneObjects();

    const visibleObjects = scene.objects.filter(
      (object) => object.altitudeDegrees >= 0,
    );
    this.objectIds = visibleObjects.map(({ id }) => id);
    this.pointCloud = this.createPointCloud(visibleObjects);
    this.scene.add(this.pointCloud);

    const linePositions: number[] = [];
    for (const segment of scene.constellationSegments) {
      if (segment.from.altitudeDegrees < 0 || segment.to.altitudeDegrees < 0) {
        continue;
      }
      linePositions.push(
        ...horizontalToCartesian(
          segment.from.altitudeDegrees,
          segment.from.azimuthDegrees,
          SKY_RADIUS - 1,
        ).toArray(),
        ...horizontalToCartesian(
          segment.to.altitudeDegrees,
          segment.to.azimuthDegrees,
          SKY_RADIUS - 1,
        ).toArray(),
      );
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(linePositions, 3));
    this.constellationLines = new LineSegments(
      geometry,
      new LineBasicMaterial({ color: 0x91c9ff, opacity: 0.34, transparent: true }),
    );
    this.constellationLines.frustumCulled = false;
    this.scene.add(this.constellationLines);

    this.milkyWayRibbon = createMilkyWayRibbon(scene.milkyWayPoints);
    this.milkyWayRibbon.material.opacity = milkyWayOpacity(
      scene.objects.find(({ kind }) => kind === "SUN")?.altitudeDegrees,
    );
    this.scene.add(this.milkyWayRibbon);
    this.addObjectLabels(visibleObjects);
    this.addConstellationLabels(scene);
    this.updateLabelVisibility("full");
  }

  updateView(view: PlanetariumViewState): void {
    this.requiredRenderer();
    this.quality = this.autoReduced ? "reduced" : view.quality;
    if (this.selectedObjectId !== view.selectedObjectId) {
      this.selectedObjectId = view.selectedObjectId;
      this.updateSelectionAttribute();
    }
    this.camera.fov = clamp(view.fieldOfViewDegrees, 24, 90);
    this.camera.updateProjectionMatrix();
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(
      horizontalToCartesian(
        clamp(view.altitudeDegrees, 0, 85),
        normalizeDegrees(view.bearingDegrees),
        1,
      ),
    );
    this.camera.updateMatrixWorld();
    this.updateLabelVisibility(view.quality);
  }

  render(): void {
    const renderer = this.requiredRenderer();
    const startedAt = performance.now();
    renderer.render(this.scene, this.camera);
    this.renderDurations.push(performance.now() - startedAt);
    if (this.renderDurations.length > 60) {
      this.renderDurations.shift();
    }
    if (!this.autoReduced && shouldUseReducedQuality(
      this.renderDurations,
      this.viewportWidth,
    )) {
      this.autoReduced = true;
      this.quality = "reduced";
      this.pixelRatio = 1;
      renderer.setPixelRatio(1);
      this.updatePixelRatioUniform();
      this.updateLabelVisibility("reduced");
    }
    if (renderer.getContext().isContextLost()) {
      throw new Error("WebGL 2 context was lost while rendering.");
    }
  }

  hitTest(x: number, y: number): string | null {
    if (!this.pointCloud || this.viewportWidth <= 0 || this.viewportHeight <= 0) {
      return null;
    }
    const normalized = new Vector2(
      (x / this.viewportWidth) * 2 - 1,
      -(y / this.viewportHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(normalized, this.camera);
    const intersection = this.raycaster.intersectObject(this.pointCloud, false)[0];
    if (!intersection || intersection.index === undefined) {
      return null;
    }
    return this.objectIds[intersection.index] ?? null;
  }

  dispose(): void {
    this.removeSceneObjects();
    if (this.horizonLine) {
      this.scene.remove(this.horizonLine);
      this.horizonLine.geometry.dispose();
      this.horizonLine.material.dispose();
      this.horizonLine = null;
    }
    for (const sprite of this.cardinalSprites) {
      this.scene.remove(sprite);
      sprite.material.map?.dispose();
      sprite.material.dispose();
    }
    this.cardinalSprites = [];
    this.renderer?.dispose();
    this.renderer = null;
  }

  private createPointCloud(
    objects: readonly SkyObject[],
  ): Points<BufferGeometry, ShaderMaterial> {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const kinds: number[] = [];

    for (const object of objects) {
      positions.push(
        ...horizontalToCartesian(
          object.altitudeDegrees,
          object.azimuthDegrees,
          SKY_RADIUS,
        ).toArray(),
      );
      const color = new Color(object.color);
      colors.push(color.r, color.g, color.b);
      sizes.push(pointSizeFor(object));
      kinds.push(objectKindValue(object));
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("objectColor", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("objectSize", new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute("objectKind", new Float32BufferAttribute(kinds, 1));
    geometry.setAttribute(
      "objectSelected",
      new Float32BufferAttribute(
        selectionValuesFor(objects, this.selectedObjectId),
        1,
      ),
    );
    const material = new ShaderMaterial({
      depthTest: false,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      uniforms: { pixelRatio: { value: this.pixelRatio } },
      vertexColors: true,
      vertexShader: STAR_VERTEX_SHADER,
    });
    return new Points(geometry, material);
  }

  private addHorizon(): void {
    const positions: number[] = [];
    for (let azimuth = 0; azimuth < 360; azimuth += 2) {
      positions.push(...horizontalToCartesian(0, azimuth, SKY_RADIUS).toArray());
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    this.horizonLine = new LineLoop(
      geometry,
      new LineBasicMaterial({ color: 0xc8f36a, opacity: 0.5, transparent: true }),
    );
    this.horizonLine.frustumCulled = false;
    this.scene.add(this.horizonLine);

    for (const direction of [
      { azimuth: 0, label: "N" },
      { azimuth: 90, label: "E" },
      { azimuth: 180, label: "S" },
      { azimuth: 270, label: "W" },
    ]) {
      const sprite = createDirectionSprite(direction.label);
      sprite.position.copy(horizontalToCartesian(3, direction.azimuth, SKY_RADIUS - 2));
      this.cardinalSprites.push(sprite);
      this.scene.add(sprite);
    }
  }

  private removeSceneObjects(): void {
    if (this.pointCloud) {
      this.scene.remove(this.pointCloud);
      this.pointCloud.geometry.dispose();
      this.pointCloud.material.dispose();
      this.pointCloud = null;
    }
    if (this.constellationLines) {
      this.scene.remove(this.constellationLines);
      this.constellationLines.geometry.dispose();
      this.constellationLines.material.dispose();
      this.constellationLines = null;
    }
    if (this.milkyWayRibbon) {
      this.scene.remove(this.milkyWayRibbon);
      this.milkyWayRibbon.geometry.dispose();
      this.milkyWayRibbon.material.dispose();
      this.milkyWayRibbon = null;
    }
    for (const label of this.objectLabels) {
      this.scene.remove(label.sprite);
      label.sprite.material.map?.dispose();
      label.sprite.material.dispose();
    }
    this.objectLabels = [];
    this.objectIds = [];
  }

  private requiredRenderer(): WebGLRenderer {
    if (!this.renderer) {
      throw new Error("Planetarium renderer has not been initialized.");
    }
    return this.renderer;
  }

  private updatePixelRatioUniform(): void {
    if (!this.pointCloud || !this.renderer) {
      return;
    }
    this.pointCloud.material.uniforms.pixelRatio.value = this.renderer.getPixelRatio();
  }

  private updateSelectionAttribute(): void {
    if (!this.pointCloud) {
      return;
    }
    const selection = this.pointCloud.geometry.getAttribute("objectSelected");
    for (let index = 0; index < this.objectIds.length; index += 1) {
      selection.setX(index, this.objectIds[index] === this.selectedObjectId ? 1 : 0);
    }
    selection.needsUpdate = true;
  }

  private addObjectLabels(objects: readonly SkyObject[]): void {
    for (const object of objects) {
      const sprite = createTextSprite(object.name, object.kind !== "STAR");
      sprite.position.copy(
        horizontalToCartesian(
          object.altitudeDegrees,
          object.azimuthDegrees,
          SKY_RADIUS - 3,
        ),
      );
      this.objectLabels.push({
        sprite,
        text: object.name,
        object,
        constellation: false,
      });
      this.scene.add(sprite);
    }
  }

  private addConstellationLabels(scene: PlanetariumScene): void {
    const positions = new Map<string, { name: string; vectors: Vector3[] }>();
    for (const segment of scene.constellationSegments) {
      if (segment.from.altitudeDegrees < 0 || segment.to.altitudeDegrees < 0) {
        continue;
      }
      const entry = positions.get(segment.constellationId) ?? {
        name: segment.constellationName,
        vectors: [],
      };
      entry.vectors.push(
        horizontalToCartesian(
          segment.from.altitudeDegrees,
          segment.from.azimuthDegrees,
        ),
        horizontalToCartesian(
          segment.to.altitudeDegrees,
          segment.to.azimuthDegrees,
        ),
      );
      positions.set(segment.constellationId, entry);
    }
    for (const { name, vectors } of positions.values()) {
      const position = vectors
        .reduce((sum, vector) => sum.add(vector), new Vector3())
        .normalize()
        .multiplyScalar(SKY_RADIUS - 5);
      const sprite = createTextSprite(name, false, true);
      sprite.position.copy(position);
      this.objectLabels.push({
        sprite,
        text: name,
        constellation: true,
      });
      this.scene.add(sprite);
    }
  }

  private updateLabelVisibility(quality: PlanetariumViewState["quality"]): void {
    if (this.viewportWidth <= 1 || this.viewportHeight <= 1) {
      return;
    }
    const candidates = this.objectLabels
      .map((entry) => ({
        entry,
        priority: labelPriority(entry, this.selectedObjectId),
        screen: entry.sprite.position.clone().project(this.camera),
      }))
      .filter(({ entry, screen }) =>
        labelAllowed(entry, this.camera.fov, quality, this.selectedObjectId) &&
        screen.z >= -1 &&
        screen.z <= 1 &&
        Math.abs(screen.x) <= 1.08 &&
        Math.abs(screen.y) <= 1.08
      )
      .sort((left, right) => right.priority - left.priority);
    const occupied: Array<{ left: number; right: number; top: number; bottom: number }> = [];
    for (const label of this.objectLabels) {
      label.sprite.visible = false;
    }
    for (const { entry, screen } of candidates) {
      const centerX = ((screen.x + 1) / 2) * this.viewportWidth;
      const centerY = ((1 - screen.y) / 2) * this.viewportHeight;
      const width = Math.max(54, entry.text.length * 13 + 22);
      const bounds = {
        left: centerX - width / 2,
        right: centerX + width / 2,
        top: centerY - 13,
        bottom: centerY + 13,
      };
      if (occupied.some((other) => rectanglesOverlap(bounds, other))) {
        continue;
      }
      entry.sprite.visible = true;
      occupied.push(bounds);
    }
  }
}

export function selectionValuesFor(
  objects: readonly Pick<SkyObject, "id">[],
  selectedObjectId?: string,
): number[] {
  return objects.map(({ id }) => id === selectedObjectId ? 1 : 0);
}

export function shouldUseReducedQuality(
  renderDurations: readonly number[],
  viewportWidth: number,
): boolean {
  if (renderDurations.length < 20) {
    return false;
  }
  const sorted = [...renderDurations].sort((left, right) => left - right);
  const percentileIndex = Math.ceil(sorted.length * 0.95) - 1;
  const budget = viewportWidth < 640 ? 33.3 : 16.7;
  return sorted[percentileIndex] > budget;
}

function createDirectionSprite(label: string): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Direction label canvas is not available.");
  }
  context.fillStyle = "rgb(5 9 20 / 82%)";
  context.beginPath();
  context.roundRect(32, 8, 64, 48, 22);
  context.fill();
  context.fillStyle = "#c8f36a";
  context.font = "700 30px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, 64, 33);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(
    new SpriteMaterial({ map: texture, depthTest: false, transparent: true }),
  );
  sprite.scale.set(9, 4.5, 1);
  return sprite;
}

function createTextSprite(
  text: string,
  prominent: boolean,
  constellation = false,
): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Object label canvas is not available.");
  }
  context.font = `${prominent ? 700 : 600} ${constellation ? 20 : 23}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const measuredWidth = Math.min(context.measureText(text).width + 32, 246);
  context.fillStyle = constellation
    ? "rgb(20 33 56 / 58%)"
    : "rgb(5 9 20 / 78%)";
  context.beginPath();
  context.roundRect((256 - measuredWidth) / 2, 9, measuredWidth, 46, 18);
  context.fill();
  context.fillStyle = constellation
    ? "rgb(145 201 255 / 78%)"
    : prominent
      ? "#c8f36a"
      : "rgb(255 255 255 / 88%)";
  context.fillText(text, 128, 33, 220);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(
    new SpriteMaterial({ map: texture, depthTest: false, transparent: true }),
  );
  const worldWidth = clamp(measuredWidth / 15, 6, 16);
  sprite.scale.set(worldWidth, 4, 1);
  sprite.renderOrder = prominent ? 5 : 4;
  return sprite;
}

function createMilkyWayRibbon(
  points: PlanetariumScene["milkyWayPoints"],
): Mesh<BufferGeometry, MeshBasicMaterial> {
  const positions: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    if (current.altitudeDegrees < -8 || next.altitudeDegrees < -8) {
      continue;
    }
    const currentUpper = horizontalToCartesian(
      current.altitudeDegrees + 4,
      current.azimuthDegrees,
      SKY_RADIUS - 7,
    );
    const currentLower = horizontalToCartesian(
      current.altitudeDegrees - 4,
      current.azimuthDegrees,
      SKY_RADIUS - 7,
    );
    const nextUpper = horizontalToCartesian(
      next.altitudeDegrees + 4,
      next.azimuthDegrees,
      SKY_RADIUS - 7,
    );
    const nextLower = horizontalToCartesian(
      next.altitudeDegrees - 4,
      next.azimuthDegrees,
      SKY_RADIUS - 7,
    );
    positions.push(
      ...currentUpper.toArray(),
      ...currentLower.toArray(),
      ...nextUpper.toArray(),
      ...nextUpper.toArray(),
      ...currentLower.toArray(),
      ...nextLower.toArray(),
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const ribbon = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color: 0x91b8ff,
      depthTest: false,
      opacity: 0.075,
      side: DoubleSide,
      transparent: true,
    }),
  );
  ribbon.frustumCulled = false;
  ribbon.renderOrder = -1;
  return ribbon;
}

function milkyWayOpacity(sunAltitudeDegrees: number | undefined): number {
  if (sunAltitudeDegrees === undefined || sunAltitudeDegrees <= -18) {
    return 0.075;
  }
  if (sunAltitudeDegrees <= -12) {
    return 0.045;
  }
  if (sunAltitudeDegrees <= -6) {
    return 0.018;
  }
  return 0;
}

function labelPriority(entry: LabelEntry, selectedObjectId?: string): number {
  if (entry.object?.id === selectedObjectId) {
    return 1_000;
  }
  if (entry.constellation) {
    return 30;
  }
  if (entry.object?.kind === "SUN" || entry.object?.kind === "MOON") {
    return 900;
  }
  if (entry.object?.kind === "PLANET") {
    return 800;
  }
  return 700 - (entry.object?.magnitude ?? 5) * 20;
}

function labelAllowed(
  entry: LabelEntry,
  fieldOfView: number,
  quality: PlanetariumViewState["quality"],
  selectedObjectId?: string,
): boolean {
  return labelDensityAllows({
    constellation: entry.constellation,
    fieldOfView,
    kind: entry.object?.kind,
    magnitude: entry.object?.magnitude,
    quality,
    selected: entry.object?.id === selectedObjectId,
  });
}

export function labelDensityAllows({
  constellation,
  fieldOfView,
  kind,
  magnitude = 5,
  quality,
  selected,
}: {
  constellation: boolean;
  fieldOfView: number;
  kind?: SkyObject["kind"];
  magnitude?: number;
  quality: PlanetariumViewState["quality"];
  selected: boolean;
}): boolean {
  if (selected) {
    return true;
  }
  if (constellation) {
    return quality === "full" && fieldOfView <= 65;
  }
  if (kind !== "STAR") {
    return true;
  }
  if (quality === "reduced") {
    return fieldOfView <= 50 && magnitude <= 0.5;
  }
  if (fieldOfView <= 40) {
    return magnitude <= 3.5;
  }
  if (fieldOfView <= 65) {
    return magnitude <= 1.5;
  }
  return magnitude <= 0.5;
}

function rectanglesOverlap(
  left: { left: number; right: number; top: number; bottom: number },
  right: { left: number; right: number; top: number; bottom: number },
): boolean {
  const padding = 5;
  return !(
    left.right + padding < right.left ||
    left.left - padding > right.right ||
    left.bottom + padding < right.top ||
    left.top - padding > right.bottom
  );
}

export function horizontalToCartesian(
  altitudeDegrees: number,
  azimuthDegrees: number,
  radius = 1,
): Vector3 {
  const altitude = (altitudeDegrees * Math.PI) / 180;
  const azimuth = (azimuthDegrees * Math.PI) / 180;
  const horizontal = Math.cos(altitude) * radius;
  return new Vector3(
    horizontal * Math.sin(azimuth),
    Math.sin(altitude) * radius,
    -horizontal * Math.cos(azimuth),
  );
}

function pointSizeFor(object: SkyObject): number {
  if (object.kind === "SUN") {
    return 13;
  }
  if (object.kind === "MOON") {
    return 12;
  }
  if (object.kind === "PLANET") {
    return 7;
  }
  return clamp(6.2 - (object.magnitude ?? 2) * 0.85, 2, 7.5);
}

function objectKindValue(object: SkyObject): number {
  switch (object.kind) {
    case "STAR":
      return 0;
    case "SUN":
      return 1;
    case "MOON":
      return 2;
    case "PLANET":
      return 3;
  }
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
