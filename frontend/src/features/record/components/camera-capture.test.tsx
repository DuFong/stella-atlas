import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CameraCapture } from "./camera-capture";

const originalMediaDevices = navigator.mediaDevices;

afterEach(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
});

describe("CameraCapture", () => {
  it("explains when camera permission is denied", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<CameraCapture onCapture={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /카메라 켜기/ }));

    await waitFor(() =>
      expect(
        screen.getByText("카메라 권한이 거부되었거나 카메라를 시작하지 못했습니다."),
      ).toBeInTheDocument(),
    );
  });
});
