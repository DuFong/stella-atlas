import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServerObservationRecords } from "./server-observation-records";

describe("ServerObservationRecords", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("explains the metadata-only boundary when signed out", () => {
    render(
      <ServerObservationRecords
        enabled={false}
        initialObservedAt="2026-08-24T12:00:00Z"
      />,
    );

    expect(screen.getByText(/사진 없이 관측 메타데이터/)).toBeInTheDocument();
  });

  it("creates a metadata record without an image payload", async () => {
    const record = {
      id: "record-1",
      observedAt: "2026-08-24T12:00:00Z",
      timezone: "Asia/Seoul",
      latitude: null,
      longitude: null,
      comment: "맑은 하늘 #서울",
      hashtags: ["서울"],
      mediaStatus: "NOT_ATTACHED",
      createdAt: "2026-08-24T13:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(record), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <ServerObservationRecords
        enabled
        initialObservedAt="2026-08-24T12:00:00Z"
      />,
    );

    fireEvent.change(screen.getByLabelText("코멘트와 해시태그"), {
      target: { value: record.comment },
    });
    fireEvent.click(screen.getByRole("button", { name: "메타데이터 저장" }));

    await waitFor(() => {
      expect(screen.getByText(record.comment)).toBeInTheDocument();
    });
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(request.body).not.toContain("image");
    expect(screen.getByText("#서울")).toBeInTheDocument();
  });
});
