import { StatusPanel } from "@/components/feedback/status-panel";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <StatusPanel
        symbol="✦"
        title="밤하늘을 읽고 있어요"
        description="날씨와 천문 정보를 한데 모으는 중입니다."
      >
        <div className="loading-line" aria-hidden="true" />
      </StatusPanel>
    </div>
  );
}
