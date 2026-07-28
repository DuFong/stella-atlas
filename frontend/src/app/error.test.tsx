import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("explains the error and retries on request", () => {
    const reset = vi.fn();

    render(<ErrorPage error={new Error("internal details")} reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "하늘 정보를 불러오지 못했어요",
    );
    expect(screen.queryByText("internal details")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
