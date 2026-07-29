import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeContent } from "./page";

describe("Home", () => {
  it("shows the observation query form before a search", () => {
    render(
      <HomeContent
        query={{
          latitude: "",
          longitude: "",
          date: "2026-08-01",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /오늘 밤,\s*별을 만나기 좋은 시간을 찾으세요/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("위도")).toBeRequired();
    expect(screen.getByLabelText("경도")).toBeRequired();
    expect(screen.getByLabelText("관측 날짜")).toHaveValue("2026-08-01");
    expect(
      screen.getByRole("button", { name: /관측 조건 확인/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "관측 조건 조회 안내" }),
    ).toBeInTheDocument();
  });
});
