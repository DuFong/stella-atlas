"use client";

import { StatusPanel } from "@/components/feedback/status-panel";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <StatusPanel
        symbol="!"
        title="하늘 정보를 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요. 문제가 계속되면 다른 시간을 확인해 보세요."
        action={
          <button className="status-action" type="button" onClick={reset}>
            다시 시도
          </button>
        }
      />
    </div>
  );
}
