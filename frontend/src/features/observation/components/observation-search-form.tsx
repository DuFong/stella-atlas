"use client";

import { useRef, useState } from "react";
import type { FavoriteLocation } from "@/features/location/types/favorite-location";
import type { RecentLocation } from "@/features/location/types/recent-location";
import type { ObservationQuery } from "@/features/observation/types/observation";

type ObservationSearchFormProps = {
  query: ObservationQuery;
  favoriteLocations?: FavoriteLocation[];
  recentLocations?: RecentLocation[];
  locationLibraryEnabled?: boolean;
  rememberLocation?: boolean;
};

type LocationStatus =
  | { state: "idle" }
  | { state: "loading"; message: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function ObservationSearchForm({
  query,
  favoriteLocations = [],
  recentLocations = [],
  locationLibraryEnabled = false,
  rememberLocation = false,
}: ObservationSearchFormProps) {
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    state: "idle",
  });

  function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus({
        state: "error",
        message: "이 브라우저에서는 현재 위치를 사용할 수 없습니다.",
      });
      return;
    }

    setLocationStatus({
      state: "loading",
      message: "현재 위치를 확인하고 있습니다.",
    });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (latitudeRef.current && longitudeRef.current) {
          latitudeRef.current.value = coords.latitude.toFixed(6);
          longitudeRef.current.value = coords.longitude.toFixed(6);
        }

        setLocationStatus({
          state: "success",
          message:
            "현재 위치를 입력했습니다. 관측 조건 확인을 눌러 조회해 주세요.",
        });
      },
      (error) => {
        setLocationStatus({
          state: "error",
          message: locationErrorMessage(error.code),
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    );
  }

  const isLocating = locationStatus.state === "loading";

  function fillCoordinates(latitude: number, longitude: number, label: string) {
    if (latitudeRef.current && longitudeRef.current) {
      latitudeRef.current.value = String(latitude);
      longitudeRef.current.value = String(longitude);
    }
    setLocationStatus({
      state: "success",
      message: `${label} 좌표를 입력했습니다. 관측 조건 확인을 눌러 조회해 주세요.`,
    });
  }

  return (
    <form className="observation-form" action="/" method="get">
      <button
        className="location-button"
        type="button"
        onClick={fillCurrentLocation}
        disabled={isLocating}
        aria-describedby={
          locationStatus.state === "idle" ? undefined : "location-status"
        }
      >
        <span aria-hidden="true">◎</span>
        {isLocating ? "현재 위치 확인 중..." : "현재 위치 가져오기"}
      </button>
      {locationStatus.state !== "idle" ? (
        <p
          id="location-status"
          className={`location-status ${locationStatus.state}`}
          role="status"
          aria-live="polite"
        >
          {locationStatus.message}
        </p>
      ) : null}
      {locationLibraryEnabled ? (
        <div className="observation-location-library">
          <label>
            <span>즐겨찾기 위치</span>
            <select
              aria-label="즐겨찾기 관측 위치"
              defaultValue=""
              onChange={(event) => {
                const location = favoriteLocations.find(
                  ({ id }) => id === event.target.value,
                );
                if (location) {
                  fillCoordinates(location.latitude, location.longitude, location.name);
                }
              }}
            >
              <option value="">선택하지 않음</option>
              {favoriteLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} · {location.timezone}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>최근 조회 위치</span>
            <select
              aria-label="최근 조회한 관측 위치"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value === "") {
                  return;
                }
                const index = Number(event.target.value);
                const location = recentLocations[index];
                if (location) {
                  fillCoordinates(
                    location.latitude,
                    location.longitude,
                    `최근 위치 (${location.timezone})`,
                  );
                }
              }}
            >
              <option value="">선택하지 않음</option>
              {recentLocations.map((location, index) => (
                <option key={`${location.latitude}:${location.longitude}`} value={index}>
                  {location.latitude}, {location.longitude} · {location.timezone}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      <div className="coordinate-fields">
        <label>
          <span>위도</span>
          <input
            ref={latitudeRef}
            name="latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
            defaultValue={query.latitude}
            placeholder="37.5665"
            required
          />
        </label>
        <label>
          <span>경도</span>
          <input
            ref={longitudeRef}
            name="longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
            defaultValue={query.longitude}
            placeholder="126.9780"
            required
          />
        </label>
      </div>
      <label>
        <span>관측 날짜</span>
        <input name="date" type="date" defaultValue={query.date} required />
      </label>
      <button className="submit-button" type="submit">
        <span aria-hidden="true">✦</span>
        관측 조건 확인
      </button>
      {locationLibraryEnabled ? (
        <label className="remember-location-option">
          <input
            name="rememberLocation"
            type="checkbox"
            value="true"
            defaultChecked={rememberLocation}
          />
          <span>이 조회 위치를 최근 위치에 저장</span>
        </label>
      ) : null}
      <p className="form-hint">
        {locationLibraryEnabled
          ? "동의한 조회만 좌표를 소수점 4자리로 줄여 최근 10개까지 계정에 저장합니다."
          : "입력한 좌표는 결과 조회에만 사용하며 저장하지 않습니다."}
      </p>
    </form>
  );
}

function locationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.";
    case 2:
      return "현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    case 3:
      return "위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.";
    default:
      return "현재 위치를 가져오지 못했습니다. 좌표를 직접 입력해 주세요.";
  }
}
