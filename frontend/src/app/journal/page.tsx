import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getAuthSession } from "@/features/auth/api/get-auth-session";
import { AccountMenu } from "@/features/auth/components/account-menu";
import type { AuthSession } from "@/features/auth/types/auth";
import { getServerObservationRecords } from "@/features/record/api/server-observation-records";
import { ObservationJournal } from "@/features/record/components/observation-journal";
import { ServerObservationRecords } from "@/features/record/components/server-observation-records";

export const metadata: Metadata = {
  title: "관측 기록",
  description: "로컬 사진 기록과 계정 기반 관측 메타데이터를 관리합니다.",
};

export default async function JournalPage() {
  await connection();
  const initialObservedAt = new Date().toISOString();
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const session = authEnabled
    ? await getAuthSession(cookieHeader)
    : ({ status: "disabled" } satisfies AuthSession);
  const recordResult = session.status === "authenticated"
    ? await getServerObservationRecords(cookieHeader)
    : undefined;

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
          <AccountMenu session={session} />
        </div>
      </nav>
      <ServerObservationRecords
        enabled={session.status === "authenticated"}
        initialObservedAt={initialObservedAt}
        initialRecords={recordResult?.ok ? recordResult.data : []}
        available={recordResult?.ok ?? true}
      />
      <ObservationJournal />
    </main>
  );
}
