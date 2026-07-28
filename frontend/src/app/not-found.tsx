import Link from "next/link";
import { StatusPanel } from "@/components/feedback/status-panel";

export default function NotFound() {
  return (
    <StatusPanel
      symbol="?"
      title="이 밤하늘은 찾을 수 없어요"
      description="주소를 다시 확인하거나 홈에서 관측할 장소를 찾아보세요."
      action={
        <Link className="status-action" href="/">
          홈으로 돌아가기
        </Link>
      }
    />
  );
}
