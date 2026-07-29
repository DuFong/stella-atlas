import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ObservationSearchForm } from "./observation-search-form";

const originalGeolocation = navigator.geolocation;

afterEach(() => {
  cleanup();
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: originalGeolocation,
  });
});

describe("ObservationSearchForm", () => {
  it("fills latitude and longitude with the current position", () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 37.566535,
          longitude: 126.977969,
        },
      } as GeolocationPosition);
    });

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition },
    });

    renderForm();
    fireEvent.click(
      screen.getByRole("button", { name: "현재 위치 가져오기" }),
    );

    expect(screen.getByLabelText("위도")).toHaveValue(37.566535);
    expect(screen.getByLabelText("경도")).toHaveValue(126.977969);
    expect(
      screen.getByText(
        "현재 위치를 입력했습니다. 관측 조건 확인을 눌러 조회해 주세요.",
      ),
    ).toBeInTheDocument();
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    );
  });

  it("explains when geolocation is unavailable", () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: undefined,
    });

    renderForm();
    fireEvent.click(
      screen.getByRole("button", { name: "현재 위치 가져오기" }),
    );

    expect(
      screen.getByText("이 브라우저에서는 현재 위치를 사용할 수 없습니다."),
    ).toBeInTheDocument();
  });
});

function renderForm() {
  render(
    <ObservationSearchForm
      query={{ latitude: "", longitude: "", date: "2026-08-01" }}
    />,
  );
}
