import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "관측할 밤하늘을 미리 둘러보세요.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("관측 시각 (UTC)")).toHaveValue(
      "2026-08-05T13:00",
    );
    expect(screen.getByText(/현재 지평선 위 주요 천체/)).toBeInTheDocument();
    expect(
      screen.getByLabelText("선택한 위치와 시각의 천체 관측 시뮬레이션"),
    ).toBeInTheDocument();
  });

  it("shows an accessible fallback when Canvas 2D is unavailable", async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);

    render(<SkySimulator initialObservedAt="2026-08-05T13:00:00Z" />);

    expect(
      await screen.findByText(/Canvas 2D 밤하늘 지도를 표시할 수 없습니다/),
    ).toBeInTheDocument();
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
});
