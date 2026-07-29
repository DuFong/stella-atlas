import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AccountMenu } from "./account-menu";

afterEach(cleanup);

describe("AccountMenu", () => {
  it("shows a disabled state before OAuth registration", () => {
    render(<AccountMenu session={{ status: "disabled" }} />);

    expect(screen.getByLabelText("Google 로그인 준비 중")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Google로 로그인" }),
    ).not.toBeInTheDocument();
  });

  it("shows Google login for an anonymous user", () => {
    render(<AccountMenu session={{ status: "anonymous" }} />);

    expect(
      screen.getByRole("link", { name: "Google로 로그인" }),
    ).toHaveAttribute("href", "/auth/login");
  });

  it("shows the profile and logout action for an authenticated user", () => {
    render(
      <AccountMenu
        session={{
          status: "authenticated",
          user: {
            name: "Stella Observer",
            email: "observer@example.com",
            pictureUrl: null,
          },
        }}
      />,
    );

    expect(screen.getByText("Stella Observer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
