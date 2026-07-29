import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("explains when no observation result is available", () => {
    render(
      <EmptyState
        title="추천할 시간이 없어요"
        description="이 날짜에는 관측 가능한 시간대가 없습니다."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "추천할 시간이 없어요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("이 날짜에는 관측 가능한 시간대가 없습니다."),
    ).toBeInTheDocument();
  });
});
