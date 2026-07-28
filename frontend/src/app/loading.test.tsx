import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("Loading", () => {
  it("announces that observation data is loading", () => {
    render(<Loading />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "밤하늘을 읽고 있어요",
    );
  });
});
