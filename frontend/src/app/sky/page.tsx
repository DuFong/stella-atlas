import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SkySimulator } from "@/features/planetarium/components/sky-simulator";

export const metadata: Metadata = {
  title: "밤하늘 시뮬레이션",
  description:
    "선택한 위치와 시각의 주요 별과 행성을 대화형 하늘 지도에서 확인합니다.",
};

export default async function SkyPage() {
  await connection();
  const initialObservedAt = new Date().toISOString();

  return (
    <main className="sky-page">
      <nav className="site-nav sky-nav" aria-label="주요 탐색">
        <Link className="brand" href="/" aria-label="StellaAtlas 홈">
          <span className="brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>StellaAtlas</span>
        </Link>
        <div className="nav-actions">
          <span className="milestone-badge">Milestone 7</span>
          <Link className="nav-link" href="/journal">
            관측 기록
          </Link>
          <Link className="nav-link" href="/">
            관측 조건
          </Link>
        </div>
      </nav>
      <SkySimulator initialObservedAt={initialObservedAt} />
    </main>
  );
}
