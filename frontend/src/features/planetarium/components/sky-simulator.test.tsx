import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanetariumRenderer } from "../infrastructure/planetarium-renderer";
import type {
  OrientationController,
  OrientationView,
} from "../infrastructure/device-orientation-controller";
import { SkySimulator } from "./sky-simulator";

describe("SkySimulator", () => {
  beforeEach(() => {
    const gradient = { addColorStop: vi.fn() };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      setTransform: vi.fn(),
      createRadialGradient: vi.fn(() => gradient),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders deterministic controls and an accessible sky summary", () => {
    const initialObservedAt = "2026-08-05T13:00:00Z";
    const initialDate = new Date(initialObservedAt);
    const expectedLocalValue = `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, "0")}-${String(initialDate.getDate()).padStart(2, "0")}T${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}`;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    render(<SkySimulator initialObservedAt={initialObservedAt} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "관측할 밤하늘을 미리 둘러보세요.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(`관측 시각 (${timeZone})`)).toHaveValue(
      expectedLocalValue,
    );
    expect(
      screen.getByText(
        `${initialDate.getFullYear()}. ${initialDate.getMonth() + 1}. ${initialDate.getDate()}. ${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")} ${timeZone}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/현재 지평선 위 주요 천체/)).toBeInTheDocument();
    const canvas = screen.getByLabelText(
      "선택한 위치와 시각의 관측자 중심 천체 시뮬레이션",
    );
    expect(canvas).toBeInTheDocument();

    fireEvent.keyDown(canvas, { key: "ArrowRight" });
    fireEvent.keyDown(canvas, { key: "ArrowUp" });

    expect(screen.getByText("방향 5°")).toBeInTheDocument();
    expect(screen.getByText("고도 33°")).toBeInTheDocument();
  });

  it("uses deterministic UTC text for the server-rendered time", () => {
    const markup = renderToString(
      <SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />,
    );
    const container = document.createElement("div");
    container.innerHTML = markup;

    expect(container.querySelector("time")).toHaveTextContent(
      "2026. 8. 5. 13:00 UTC",
    );
  });

  it("selects a visible object from the accessible object list", () => {
    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);

    const objectButton = screen.getByRole("button", { name: /베가/ });
    fireEvent.click(objectButton);

    expect(objectButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 3, name: "베가" })).toBeInTheDocument();
    expect(screen.getByText(/별 · 고도 .* · 방위/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "선택 해제" }));
    expect(screen.queryByRole("heading", { level: 3, name: "베가" })).not.toBeInTheDocument();
  });

  it("selects a WebGL object through renderer hit testing", async () => {
    const renderer: PlanetariumRenderer = {
      initialize: vi.fn(),
      resize: vi.fn(),
      updateScene: vi.fn(),
      updateView: vi.fn(),
      render: vi.fn(),
      hitTest: vi.fn(() => "vega"),
      dispose: vi.fn(),
    };
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        createRenderer={() => renderer}
      />,
    );
    const canvas = screen.getByLabelText(
      "선택한 위치와 시각의 관측자 중심 천체 시뮬레이션",
    );
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      bottom: 400,
      height: 400,
      left: 0,
      right: 600,
      top: 0,
      width: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperties(canvas, {
      hasPointerCapture: { configurable: true, value: () => false },
      setPointerCapture: { configurable: true, value: vi.fn() },
    });

    fireEvent.pointerDown(canvas, { clientX: 240, clientY: 160, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 240, clientY: 160, pointerId: 1 });

    expect(renderer.hitTest).toHaveBeenCalledWith(240, 160);
    expect(screen.getByRole("heading", { level: 3, name: "베가" })).toBeInTheDocument();
    await waitFor(() => {
      expect(renderer.updateView).toHaveBeenLastCalledWith(
        expect.objectContaining({ selectedObjectId: "vega" }),
      );
    });
  });

  it("reveals the sky after applying controls on a narrow screen", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    vi.stubGlobal("innerWidth", 390);

    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);
    fireEvent.click(screen.getByRole("button", { name: "이 하늘 보기" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("keeps sky controls available in viewport fullscreen and exits by button or Escape", async () => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });
    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);

    const skyView = screen.getByRole("region", { name: "지평선 위의 하늘" });
    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));

    expect(await screen.findByRole("button", { name: "전체화면 해제" })).toBeInTheDocument();
    expect(skyView).toHaveClass("sky-view-panel--viewport");
    expect(
      screen.queryByRole("heading", { name: "지평선 위의 하늘" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("LIVE SKY MAP")).not.toBeInTheDocument();
    expect(screen.getByText("방향 0°")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "−1시간" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "현재" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확대" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "축소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "모션 보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "왼쪽" })).toHaveAttribute(
      "title",
      "왼쪽",
    );

    fireEvent.click(screen.getByRole("button", { name: "전체화면 해제" }));
    await waitFor(() => expect(skyView).not.toHaveClass("sky-view-panel--fullscreen"));
    expect(
      screen.getByRole("heading", { name: "지평선 위의 하늘" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(skyView).not.toHaveClass("sky-view-panel--fullscreen"));
  });

  it("uses device orientation in fullscreen and stops it when fullscreen closes", async () => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });
    let publishView: ((view: OrientationView) => void) | undefined;
    const controller: OrientationController = {
      start: vi.fn(async (_initialView, onViewChange) => {
        publishView = onViewChange;
        return "started" as const;
      }),
      recalibrate: vi.fn(),
      stop: vi.fn(),
    };
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        createOrientationController={() => controller}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));
    fireEvent.click(await screen.findByRole("button", { name: "모션 보기" }));

    expect(await screen.findByRole("button", { name: "모션 보기 끄기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    act(() => publishView?.({ bearingDegrees: 42, altitudeDegrees: 51 }));
    expect(screen.getByText("방향 42°")).toBeInTheDocument();
    expect(screen.getByText("고도 51°")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "모션 방향 재보정" }));
    expect(controller.recalibrate).toHaveBeenCalledWith({
      bearingDegrees: 42,
      altitudeDegrees: 51,
    });

    fireEvent.click(screen.getByRole("button", { name: "전체화면 해제" }));
    await waitFor(() => expect(controller.stop).toHaveBeenCalled());
  });

  it("explains that motion controls require HTTPS", async () => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: undefined,
    });
    const controller: OrientationController = {
      start: vi.fn(async () => "insecure" as const),
      recalibrate: vi.fn(),
      stop: vi.fn(),
    };
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        createOrientationController={() => controller}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "전체화면" }));
    fireEvent.click(await screen.findByRole("button", { name: "모션 보기" }));

    expect(
      await screen.findByText("모션 보기는 HTTPS 연결에서만 사용할 수 있습니다."),
    ).toBeInTheDocument();
  });

  it("shows an accessible fallback when Canvas 2D is unavailable", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);

    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);

    expect(
      await screen.findByText(/Canvas 2D 밤하늘 지도를 표시할 수 없습니다/),
    ).toBeInTheDocument();
  });

  it("falls back when WebGL context is lost during initialization", async () => {
    const renderer: PlanetariumRenderer = {
      initialize: (canvas) => {
        canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
      },
      resize: vi.fn(),
      updateScene: vi.fn(),
      updateView: vi.fn(),
      render: vi.fn(),
      hitTest: vi.fn(() => null),
      dispose: vi.fn(),
    };

    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        createRenderer={() => renderer}
      />,
    );

    expect(
      await screen.findByText(/Canvas 2D 지도로 전환했습니다/),
    ).toBeInTheDocument();
    expect(renderer.dispose).toHaveBeenCalled();
  });

  it("loads a saved location into the sky controls", () => {
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        favoriteLocationsEnabled
        initialFavoriteLocations={[
          {
            id: "location-1",
            name: "부산 관측지",
            latitude: 35.1796,
            longitude: 129.0756,
            timezone: "Asia/Seoul",
            createdAt: "2026-08-24T04:00:00Z",
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("저장된 관측 위치"), {
      target: { value: "location-1" },
    });

    expect(screen.getByLabelText("위도")).toHaveValue(35.1796);
    expect(screen.getByLabelText("경도")).toHaveValue(129.0756);
    expect(screen.getByText("부산 관측지 위치의 하늘로 이동했습니다.")).toBeInTheDocument();
  });

  it("saves the current coordinates as a favorite location", async () => {
    const savedLocation = {
      id: "location-2",
      name: "서울 천문대",
      latitude: 37.5665,
      longitude: 126.978,
      timezone: "Asia/Seoul",
      createdAt: "2026-08-24T04:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(savedLocation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        favoriteLocationsEnabled
      />,
    );

    fireEvent.change(screen.getByLabelText("새 즐겨찾기 이름"), {
      target: { value: "서울 천문대" },
    });
    fireEvent.click(screen.getByRole("button", { name: "현재 좌표 저장" }));

    await waitFor(() => {
      expect(screen.getByText("서울 천문대 위치를 즐겨찾기에 저장했습니다.")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/favorite-locations",
      expect.objectContaining({ method: "POST" }),
    );
    expect(screen.getByRole("option", { name: "서울 천문대 · Asia/Seoul" })).toBeInTheDocument();
  });

  it("loads and clears recent queried locations", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    render(
      <SkySimulator
        initialObservedAt="2026-08-05T13:00:00Z"
        favoriteLocationsEnabled
        initialRecentLocations={[{
          latitude: 35.1796,
          longitude: 129.0756,
          timezone: "Asia/Seoul",
          lastQueriedAt: "2026-08-24T04:00:00Z",
        }]}
      />,
    );

    fireEvent.change(screen.getByLabelText("최근 조회 위치"), {
      target: { value: "0" },
    });
    expect(screen.getByLabelText("위도")).toHaveValue(35.1796);

    fireEvent.click(screen.getByRole("button", { name: "최근 위치 모두 삭제" }));
    await waitFor(() => {
      expect(screen.getByText("최근 조회 위치를 모두 삭제했습니다.")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/recent-locations",
      { method: "DELETE" },
    );
  });
});
