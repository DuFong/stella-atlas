import {
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
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

const STAR_VERTEX_SHADER = `
  attribute float objectSize;
  attribute float objectSelected;
  attribute vec3 objectColor;
  uniform float pixelRatio;
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    vColor = objectColor;
    vSelected = objectSelected;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = objectSize * mix(1.0, 1.7, objectSelected) * pixelRatio;
  }
`;

const STAR_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceFromCenter > 0.5) {
      discard;
    }
    float core = 1.0 - smoothstep(0.0, 0.5, distanceFromCenter);
    float alpha = smoothstep(0.5, 0.08, distanceFromCenter);
    vec3 baseColor = mix(vColor * 0.72, vColor * 1.35, core);
    vec3 highlightColor = mix(baseColor, vec3(0.78, 0.95, 0.35), 0.72);
    vec3 color = mix(baseColor, highlightColor, vSelected);
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
  private horizonLine: LineLoop<BufferGeometry, LineBasicMaterial> | null = null;
  private cardinalSprites: Sprite[] = [];
  private objectIds: string[] = [];
  private selectedObjectId: string | undefined;
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
      alpha: false,
      antialias: true,
      depth: true,
      powerPreference: "high-performance",
    });
    if (!(context instanceof WebGL2RenderingContext)) {
      throw new Error("WebGL 2 initialization failed.");
    }

    this.renderer = new WebGLRenderer({ canvas, context, antialias: true });
    if (context.isContextLost()) {
      this.renderer.dispose();
      this.renderer = null;
      throw new Error("WebGL 2 context was lost during initialization.");
    }
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x050914, 1);
    this.camera.position.set(0, 0, 0);
    this.raycaster.params.Points = { threshold: 2.5 };
    this.addHorizon();
  }

  resize(width: number, height: number, pixelRatio: number): void {
    const renderer = this.requiredRenderer();
    this.viewportWidth = Math.max(width, 1);
    this.viewportHeight = Math.max(height, 1);
    this.pixelRatio = Math.min(Math.max(pixelRatio, 1), MAX_PIXEL_RATIO);
    renderer.setPixelRatio(this.pixelRatio);
    renderer.setSize(this.viewportWidth, this.viewportHeight, false);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.updateProjectionMatrix();
    this.updatePixelRatioUniform();
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
  }

  updateView(view: PlanetariumViewState): void {
    this.requiredRenderer();
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
  }

  render(): void {
    const renderer = this.requiredRenderer();
    renderer.render(this.scene, this.camera);
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
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("objectColor", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("objectSize", new Float32BufferAttribute(sizes, 1));
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
}

export function selectionValuesFor(
  objects: readonly Pick<SkyObject, "id">[],
  selectedObjectId?: string,
): number[] {
  return objects.map(({ id }) => id === selectedObjectId ? 1 : 0);
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

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
