import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { getAuthSession } from "@/features/auth/api/get-auth-session";
import { AccountMenu } from "@/features/auth/components/account-menu";
import type { AuthSession } from "@/features/auth/types/auth";
import { getFavoriteLocations } from "@/features/location/api/favorite-locations";
import { getRecentLocations } from "@/features/location/api/recent-locations";
import { SkySimulator } from "@/features/planetarium/components/sky-simulator";

export const metadata: Metadata = {
  title: "밤하늘 시뮬레이션",
  description:
    "선택한 위치와 시각의 주요 별과 행성을 대화형 하늘 지도에서 확인합니다.",
};

export default async function SkyPage() {
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
  const [favoriteResult, recentResult] = session.status === "authenticated"
    ? await Promise.all([
        getFavoriteLocations(cookieHeader),
        getRecentLocations(cookieHeader),
      ])
    : [undefined, undefined];

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
          <span className="milestone-badge">Milestone 9</span>
          <Link className="nav-link" href="/journal">
            관측 기록
          </Link>
          <Link className="nav-link" href="/">
            관측 조건
          </Link>
          <AccountMenu session={session} />
        </div>
      </nav>
      <SkySimulator
        initialObservedAt={initialObservedAt}
        initialFavoriteLocations={favoriteResult?.ok ? favoriteResult.data : []}
        favoriteLocationsEnabled={session.status === "authenticated"}
        favoriteLocationsAvailable={favoriteResult?.ok ?? true}
        initialRecentLocations={recentResult?.ok ? recentResult.data : []}
        recentLocationsAvailable={recentResult?.ok ?? true}
      />
    </main>
  );
}
