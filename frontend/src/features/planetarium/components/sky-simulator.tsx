"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type {
  PlanetariumScene,
  SkyObject,
} from "@/features/planetarium/domain/planetarium";
import { AstronomyEnginePlanetarium } from "@/features/planetarium/infrastructure/astronomy-engine-planetarium";
import type { FavoriteLocation } from "@/features/location/types/favorite-location";

const DEFAULT_LATITUDE = "37.5665";
const DEFAULT_LONGITUDE = "126.9780";

export function SkySimulator({
  initialObservedAt,
  initialFavoriteLocations = [],
  favoriteLocationsEnabled = false,
  favoriteLocationsAvailable = true,
}: {
  initialObservedAt: string;
  initialFavoriteLocations?: FavoriteLocation[];
  favoriteLocationsEnabled?: boolean;
  favoriteLocationsAvailable?: boolean;
}) {
  const engine = useMemo(() => new AstronomyEnginePlanetarium(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ pointerX: number; bearing: number } | null>(null);
  const [latitude, setLatitude] = useState(DEFAULT_LATITUDE);
  const [longitude, setLongitude] = useState(DEFAULT_LONGITUDE);
  const [dateTime, setDateTime] = useState(() =>
    toUtcDateTimeValue(new Date(initialObservedAt)),
  );
  const [scene, setScene] = useState<PlanetariumScene>(() =>
    engine.calculate({
      latitude: Number(DEFAULT_LATITUDE),
      longitude: Number(DEFAULT_LONGITUDE),
      observedAt: new Date(initialObservedAt),
    }),
  );
  const [bearing, setBearing] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [canvasSupported, setCanvasSupported] = useState(true);
  const [message, setMessage] = useState(
    "서울 좌표를 기준으로 현재 하늘을 표시합니다.",
  );
  const [favoriteLocations, setFavoriteLocations] = useState(
    initialFavoriteLocations,
  );
  const [selectedFavoriteId, setSelectedFavoriteId] = useState("");
  const [favoriteName, setFavoriteName] = useState("");
  const [favoritePending, setFavoritePending] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState(
    favoriteLocationsAvailable
      ? ""
      : "저장된 위치를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const render = () => setCanvasSupported(drawScene(canvas, scene, bearing, zoom));
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [bearing, scene, zoom]);

  function updateScene(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const observedAt = new Date(`${dateTime}:00Z`);

    try {
      setScene(
        engine.calculate({
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          observedAt,
        }),
      );
      setMessage("선택한 위치와 시각의 하늘로 갱신했습니다.");
    } catch {
      setMessage("위치와 시각을 다시 확인해 주세요.");
    }
  }

  function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
      return;
    }

    setMessage("현재 위치 권한을 확인하고 있습니다.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setMessage("현재 위치를 입력했습니다. 하늘 보기를 눌러 적용해 주세요.");
      },
      () => setMessage("위치 권한이 없거나 현재 위치를 확인하지 못했습니다."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }

  function selectFavorite(locationId: string) {
    setSelectedFavoriteId(locationId);
    const location = favoriteLocations.find(({ id }) => id === locationId);
    if (!location) {
      return;
    }

    const nextLatitude = formatCoordinate(location.latitude);
    const nextLongitude = formatCoordinate(location.longitude);
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    updateSceneForCoordinates(
      location.latitude,
      location.longitude,
      `${location.name} 위치의 하늘로 이동했습니다.`,
    );
  }

  async function saveFavoriteLocation() {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const trimmedName = favoriteName.trim();
    if (!trimmedName) {
      setFavoriteMessage("저장할 위치 이름을 입력해 주세요.");
      return;
    }
    if (!validCoordinates(parsedLatitude, parsedLongitude)) {
      setFavoriteMessage("저장할 위도와 경도를 다시 확인해 주세요.");
      return;
    }

    setFavoritePending(true);
    setFavoriteMessage("이 위치를 저장하고 있습니다.");
    try {
      const response = await fetch("/api/favorite-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        }),
      });
      if (!response.ok) {
        setFavoriteMessage(favoriteErrorMessage(response.status, "저장"));
        return;
      }
      const payload: unknown = await response.json();
      if (!isFavoriteLocation(payload)) {
        setFavoriteMessage("저장된 위치 응답을 확인하지 못했습니다.");
        return;
      }

      setFavoriteLocations((current) => [...current, payload]);
      setSelectedFavoriteId(payload.id);
      setFavoriteName("");
      setFavoriteMessage(`${payload.name} 위치를 즐겨찾기에 저장했습니다.`);
    } catch {
      setFavoriteMessage("위치를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setFavoritePending(false);
    }
  }

  async function removeFavoriteLocation() {
    if (!selectedFavoriteId) {
      setFavoriteMessage("삭제할 즐겨찾기 위치를 선택해 주세요.");
      return;
    }
    const selected = favoriteLocations.find(({ id }) => id === selectedFavoriteId);
    setFavoritePending(true);
    setFavoriteMessage("선택한 위치를 삭제하고 있습니다.");
    try {
      const response = await fetch(`/api/favorite-locations/${selectedFavoriteId}`, {
        method: "DELETE",
      });
      if (response.status !== 204) {
        setFavoriteMessage(favoriteErrorMessage(response.status, "삭제"));
        return;
      }
      setFavoriteLocations((current) =>
        current.filter(({ id }) => id !== selectedFavoriteId),
      );
      setSelectedFavoriteId("");
      setFavoriteMessage(
        selected
          ? `${selected.name} 위치를 즐겨찾기에서 삭제했습니다.`
          : "선택한 위치를 즐겨찾기에서 삭제했습니다.",
      );
    } catch {
      setFavoriteMessage("위치를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setFavoritePending(false);
    }
  }

  function updateSceneForCoordinates(
    nextLatitude: number,
    nextLongitude: number,
    successMessage: string,
  ) {
    try {
      setScene(
        engine.calculate({
          latitude: nextLatitude,
          longitude: nextLongitude,
          observedAt: new Date(`${dateTime}:00Z`),
        }),
      );
      setMessage(successMessage);
    } catch {
      setMessage("위치와 시각을 다시 확인해 주세요.");
    }
  }

  function shiftTime(hours: number) {
    const shifted = new Date(new Date(scene.observedAt).getTime() + hours * 3_600_000);
    const nextScene = engine.calculate({
      latitude: scene.latitude,
      longitude: scene.longitude,
      observedAt: shifted,
    });
    setScene(nextScene);
    setDateTime(toUtcDateTimeValue(shifted));
  }

  function startDragging(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerX: event.clientX, bearing };
  }

  function dragSky(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) {
      return;
    }
    const delta = (dragRef.current.pointerX - event.clientX) * 0.35;
    setBearing(normalizeDegrees(dragRef.current.bearing + delta));
  }

  function stopDragging(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function zoomSky(event: ReactWheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    setZoom((current) => clamp(current + (event.deltaY < 0 ? 0.15 : -0.15), 1, 2.5));
  }

  const visibleObjects = scene.objects
    .filter((object) => object.altitudeDegrees >= 0)
    .sort((left, right) => right.altitudeDegrees - left.altitudeDegrees);

  return (
    <div className="sky-simulator">
      <form className="sky-control-panel" onSubmit={updateScene}>
        <div className="sky-control-heading">
          <p className="eyebrow">SKY CONTROLS</p>
          <h1>관측할 밤하늘을 미리 둘러보세요.</h1>
          <p>
            위치와 시각을 바꾸고 하늘을 드래그하거나 확대해 주요 천체를
            확인할 수 있습니다.
          </p>
        </div>

        <button className="sky-location-button" type="button" onClick={fillCurrentLocation}>
          <span aria-hidden="true">◎</span> 현재 위치 입력
        </button>

        <div className="sky-coordinate-fields">
          <label>
            <span>위도</span>
            <input
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              type="number"
              min="-90"
              max="90"
              step="any"
              required
            />
          </label>
          <label>
            <span>경도</span>
            <input
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              type="number"
              min="-180"
              max="180"
              step="any"
              required
            />
          </label>
        </div>

        <section className="sky-favorite-panel" aria-labelledby="sky-favorite-heading">
          <div className="sky-favorite-heading">
            <p className="eyebrow" id="sky-favorite-heading">FAVORITE LOCATIONS</p>
            <p>자주 보는 관측 위치를 저장하고 같은 좌표의 하늘로 바로 이동합니다.</p>
          </div>
          {favoriteLocationsEnabled ? (
            <>
              <label>
                <span>저장된 관측 위치</span>
                <select
                  value={selectedFavoriteId}
                  onChange={(event) => selectFavorite(event.target.value)}
                  disabled={favoritePending || favoriteLocations.length === 0}
                >
                  <option value="">
                    {favoriteLocations.length === 0
                      ? "저장된 위치가 없습니다"
                      : "위치를 선택하세요"}
                  </option>
                  {favoriteLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} · {location.timezone}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>새 즐겨찾기 이름</span>
                <input
                  value={favoriteName}
                  onChange={(event) => setFavoriteName(event.target.value)}
                  maxLength={100}
                  placeholder="예: 서울 천문대"
                  disabled={favoritePending}
                />
              </label>
              <div className="sky-favorite-actions">
                <button
                  type="button"
                  onClick={saveFavoriteLocation}
                  disabled={favoritePending}
                >
                  현재 좌표 저장
                </button>
                <button
                  className="danger"
                  type="button"
                  onClick={removeFavoriteLocation}
                  disabled={favoritePending || !selectedFavoriteId}
                >
                  선택 위치 삭제
                </button>
              </div>
              <p className="sky-favorite-message" role="status" aria-live="polite">
                {favoriteMessage}
              </p>
            </>
          ) : (
            <p className="sky-favorite-login-note">
              Google로 로그인하면 현재 좌표를 계정의 즐겨찾기에 저장할 수 있습니다.
            </p>
          )}
        </section>

        <label>
          <span>관측 시각 (UTC)</span>
          <input
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            type="datetime-local"
            required
          />
        </label>

        <button className="sky-submit-button" type="submit">
          <span aria-hidden="true">✦</span> 이 하늘 보기
        </button>
        <p className="sky-control-message" role="status" aria-live="polite">
          {message}
        </p>
        <p className="sky-privacy-note">
          {favoriteLocationsEnabled
            ? "좌표는 즐겨찾기 저장 버튼을 누른 경우에만 계정에 저장합니다. 관측 시각은 저장하지 않습니다."
            : "좌표와 시각은 이 시뮬레이션 계산에만 사용하며 서버에 저장하지 않습니다."}
        </p>
      </form>

      <section className="sky-view-panel" aria-labelledby="sky-view-heading">
        <div className="sky-view-heading">
          <div>
            <p className="eyebrow">LIVE SKY MAP</p>
            <h2 id="sky-view-heading">지평선 위의 하늘</h2>
          </div>
          <div className="sky-view-stats" aria-live="polite">
            <span>방향 {Math.round(bearing)}°</span>
            <span>확대 {zoom.toFixed(1)}×</span>
          </div>
        </div>

        <div className="sky-canvas-shell">
          {!canvasSupported ? (
            <p className="sky-canvas-fallback" role="alert">
              이 브라우저에서는 Canvas 2D 밤하늘 지도를 표시할 수 없습니다. 아래
              주요 천체 목록은 계속 확인할 수 있습니다.
            </p>
          ) : null}
          <canvas
            ref={canvasRef}
            className="sky-canvas"
            aria-label="선택한 위치와 시각의 천체 관측 시뮬레이션"
            onPointerDown={startDragging}
            onPointerMove={dragSky}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onWheel={zoomSky}
          />
        </div>

        <div className="sky-toolbar" aria-label="시뮬레이션 조작">
          <button type="button" onClick={() => shiftTime(-1)}>−1시간</button>
          <button type="button" onClick={() => setBearing(normalizeDegrees(bearing - 30))}>왼쪽</button>
          <button type="button" onClick={() => setBearing(normalizeDegrees(bearing + 30))}>오른쪽</button>
          <button type="button" onClick={() => setZoom((value) => clamp(value + 0.2, 1, 2.5))}>확대</button>
          <button type="button" onClick={() => setZoom((value) => clamp(value - 0.2, 1, 2.5))}>축소</button>
          <button type="button" onClick={() => shiftTime(1)}>+1시간</button>
        </div>

        <p className="sky-time-readout">
          <time dateTime={scene.observedAt}>
            {formatUtcDateTime(scene.observedAt)}
            {" UTC"}
          </time>
          <span>위도 {scene.latitude.toFixed(4)}°, 경도 {scene.longitude.toFixed(4)}°</span>
        </p>

        <details className="visible-object-list">
          <summary>현재 지평선 위 주요 천체 {visibleObjects.length}개</summary>
          <ul>
            {visibleObjects.map((object) => (
              <li key={object.id}>
                <span>{object.name}</span>
                <span>고도 {object.altitudeDegrees.toFixed(1)}° · 방위 {object.azimuthDegrees.toFixed(1)}°</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

function validCoordinates(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function formatCoordinate(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

function favoriteErrorMessage(status: number, action: "저장" | "삭제"): string {
  if (status === 401) {
    return "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.";
  }
  if (status === 400) {
    return "위치 이름과 좌표를 다시 확인해 주세요.";
  }
  return `위치를 ${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`;
}

function isFavoriteLocation(payload: unknown): payload is FavoriteLocation {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const location = payload as Partial<FavoriteLocation>;
  return (
    typeof location.id === "string" &&
    typeof location.name === "string" &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    typeof location.timezone === "string" &&
    typeof location.createdAt === "string"
  );
}

function formatUtcDateTime(value: string): string {
  const date = new Date(value);
  return `${date.getUTCFullYear()}. ${date.getUTCMonth() + 1}. ${date.getUTCDate()}. ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function drawScene(
  canvas: HTMLCanvasElement,
  scene: PlanetariumScene,
  bearing: number,
  zoom: number,
): boolean {
  const cssWidth = Math.max(canvas.clientWidth, 320);
  const cssHeight = Math.max(Math.min(cssWidth * 0.72, 680), 360);
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  canvas.style.height = `${cssHeight}px`;
  const context = canvas.getContext("2d");
  if (!context) {
    return false;
  }
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const centerX = cssWidth / 2;
  const centerY = cssHeight / 2;
  const radius = Math.min(cssWidth, cssHeight) * 0.43 * zoom;
  const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, "#15284f");
  gradient.addColorStop(0.65, "#0b1733");
  gradient.addColorStop(1, "#050914");
  context.fillStyle = "#050914";
  context.fillRect(0, 0, cssWidth, cssHeight);
  context.save();
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
  context.clip();

  drawAltitudeGrid(context, centerX, centerY, radius);
  drawConstellations(context, scene, centerX, centerY, radius, bearing);
  drawObjects(context, scene.objects, centerX, centerY, radius, bearing);
  context.restore();
  drawCardinalDirections(context, centerX, centerY, radius, bearing);
  return true;
}

function drawAltitudeGrid(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void {
  context.save();
  context.strokeStyle = "rgb(145 201 255 / 14%)";
  context.lineWidth = 1;
  for (const altitude of [30, 60]) {
    context.beginPath();
    context.arc(centerX, centerY, radius * ((90 - altitude) / 90), 0, Math.PI * 2);
    context.stroke();
  }
  for (let direction = 0; direction < 360; direction += 45) {
    const angle = degreesToRadians(direction);
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + radius * Math.sin(angle), centerY - radius * Math.cos(angle));
    context.stroke();
  }
  context.restore();
}

function drawConstellations(
  context: CanvasRenderingContext2D,
  scene: PlanetariumScene,
  centerX: number,
  centerY: number,
  radius: number,
  bearing: number,
): void {
  context.save();
  context.strokeStyle = "rgb(145 201 255 / 38%)";
  context.lineWidth = 1;
  for (const segment of scene.constellationSegments) {
    const from = projectObject(segment.from, centerX, centerY, radius, bearing);
    const to = projectObject(segment.to, centerX, centerY, radius, bearing);
    if (!from || !to) {
      continue;
    }
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  }
  context.restore();
}

function drawObjects(
  context: CanvasRenderingContext2D,
  objects: readonly SkyObject[],
  centerX: number,
  centerY: number,
  radius: number,
  bearing: number,
): void {
  for (const object of objects) {
    const point = projectObject(object, centerX, centerY, radius, bearing);
    if (!point) {
      continue;
    }
    const objectRadius = object.kind === "SUN" || object.kind === "MOON"
      ? 6
      : object.kind === "PLANET"
        ? 4
        : clamp(3.5 - (object.magnitude ?? 2) * 0.55, 1.2, 4.2);
    context.beginPath();
    context.arc(point.x, point.y, objectRadius, 0, Math.PI * 2);
    context.fillStyle = object.color;
    context.shadowBlur = objectRadius * 3;
    context.shadowColor = object.color;
    context.fill();
    context.shadowBlur = 0;

    if (object.kind !== "STAR" || (object.magnitude ?? 3) <= 1.3) {
      context.fillStyle = "rgb(244 246 255 / 82%)";
      context.font = "12px sans-serif";
      context.fillText(object.name, point.x + objectRadius + 5, point.y - 4);
    }
  }
}

function drawCardinalDirections(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  bearing: number,
): void {
  context.save();
  context.fillStyle = "rgb(200 243 106 / 82%)";
  context.font = "700 12px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const direction of [
    { azimuth: 0, label: "N" },
    { azimuth: 90, label: "E" },
    { azimuth: 180, label: "S" },
    { azimuth: 270, label: "W" },
  ]) {
    const angle = degreesToRadians(direction.azimuth - bearing);
    context.fillText(
      direction.label,
      centerX + (radius + 16) * Math.sin(angle),
      centerY - (radius + 16) * Math.cos(angle),
    );
  }
  context.restore();
}

function projectObject(
  object: SkyObject,
  centerX: number,
  centerY: number,
  radius: number,
  bearing: number,
): { x: number; y: number } | null {
  if (object.altitudeDegrees < 0) {
    return null;
  }
  const distance = radius * ((90 - object.altitudeDegrees) / 90);
  const angle = degreesToRadians(object.azimuthDegrees - bearing);
  return {
    x: centerX + distance * Math.sin(angle),
    y: centerY - distance * Math.cos(angle),
  };
}

function toUtcDateTimeValue(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
