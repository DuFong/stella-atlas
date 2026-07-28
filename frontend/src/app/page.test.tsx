import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("introduces the core observation value", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /오늘 밤,\s*별을 만나기 좋은 시간을 찾으세요/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("관측 조건 조회 기능을 준비하고 있습니다"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "관측 결과 화면 미리보기" }),
    ).toBeInTheDocument();
  });
});
