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

  it("reuses saved coordinates and keeps recent storage opt-in", () => {
    render(
      <ObservationSearchForm
        query={{ latitude: "", longitude: "", date: "2026-08-01" }}
        locationLibraryEnabled
        favoriteLocations={[{
          id: "location-1",
          name: "부산 관측지",
          latitude: 35.1796,
          longitude: 129.0756,
          timezone: "Asia/Seoul",
          createdAt: "2026-08-24T04:00:00Z",
        }]}
      />,
    );

    fireEvent.change(screen.getByLabelText("즐겨찾기 관측 위치"), {
      target: { value: "location-1" },
    });

    expect(screen.getByLabelText("위도")).toHaveValue(35.1796);
    expect(screen.getByLabelText("경도")).toHaveValue(129.0756);
    expect(screen.getByRole("checkbox", { name: "이 조회 위치를 최근 위치에 저장" }))
      .not.toBeChecked();
  });
});

function renderForm() {
  render(
    <ObservationSearchForm
      query={{ latitude: "", longitude: "", date: "2026-08-01" }}
    />,
  );
}
