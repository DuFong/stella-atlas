import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
});
