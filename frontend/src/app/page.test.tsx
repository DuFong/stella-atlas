import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeContent } from "@/features/observation/components/home-content";

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
      screen.getByText("Google 로그인 준비 중"),
    ).toBeInTheDocument();
    expect(screen.getByText("Milestone 9")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "관측 기록" }),
    ).toHaveAttribute("href", "/journal");
    expect(
      screen.getByRole("link", { name: "밤하늘 시뮬레이션" }),
    ).toHaveAttribute("href", "/sky");
    expect(
      screen.getByRole("link", {
        name: /오늘 밤하늘을 먼저 둘러보세요/,
      }),
    ).toHaveAttribute("href", "/sky");
    expect(
      screen.getByRole("link", {
        name: /관측의 순간을 사진으로 남겨보세요/,
      }),
    ).toHaveAttribute("href", "/journal");
    expect(
      screen.getByRole("article", { name: "관측 조건 조회 안내" }),
    ).toBeInTheDocument();
  });
});
