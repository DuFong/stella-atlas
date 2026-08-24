import type { Metadata } from "next";
import Link from "next/link";
import { ObservationJournal } from "@/features/record/components/observation-journal";

export const metadata: Metadata = {
  title: "로컬 관측 기록",
  description: "사진과 촬영 정보를 현재 브라우저에만 저장하는 개인 관측 기록입니다.",
};

export default function JournalPage() {
  return (
    <main className="journal-page">
      <nav className="site-nav journal-nav" aria-label="주요 탐색">
        <Link className="brand" href="/" aria-label="StellaAtlas 홈">
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span>StellaAtlas</span>
        </Link>
        <div className="nav-actions">
          <span className="milestone-badge">Milestone 8</span>
          <Link className="nav-link" href="/sky">밤하늘 시뮬레이션</Link>
          <Link className="nav-link" href="/">관측 조건</Link>
        </div>
      </nav>
      <ObservationJournal />
    </main>
  );
}
