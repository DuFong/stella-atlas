import { getAuthSession } from "@/features/auth/api/get-auth-session";
import { AccountMenu } from "@/features/auth/components/account-menu";
import type { AuthSession } from "@/features/auth/types/auth";
import { getObservation } from "@/features/observation/api/get-observation";
import { ObservationDetails } from "@/features/observation/components/observation-details";
import { ObservationSearchForm } from "@/features/observation/components/observation-search-form";
import {
  ObservationErrorCard,
  ObservationPromptCard,
} from "@/features/observation/components/observation-state-card";
import { ObservationSummaryCard } from "@/features/observation/components/observation-summary-card";
import type {
  ObservationApiResult,
  ObservationQuery,
} from "@/features/observation/types/observation";
import { cookies } from "next/headers";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "장소를 알려주세요",
    description: "현재 위치나 지역 검색으로 보고 싶은 밤하늘을 선택합니다.",
  },
  {
    number: "02",
    title: "하늘을 함께 읽어요",
    description: "날씨, 박명, 달빛을 천체관측의 관점으로 해석합니다.",
  },
  {
    number: "03",
    title: "좋은 시간을 찾으세요",
    description: "시간대별 조건과 가장 좋은 관측 시간을 이유와 함께 안내합니다.",
  },
] as const;

type HomeSearchParams = Promise<{
  latitude?: string | string[];
  longitude?: string | string[];
  date?: string | string[];
  auth?: string | string[];
}>;

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const params = await searchParams;
  const query = toQuery(params);
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const [session, result] = await Promise.all([
    authEnabled
      ? getAuthSession(cookieHeader)
      : Promise.resolve<AuthSession>({ status: "disabled" }),
    isCompleteQuery(query) ? getObservation(query) : undefined,
  ]);

  return (
    <HomeContent
      query={query}
      result={result}
      session={session}
      authNotice={toAuthNotice(firstValue(params.auth))}
    />
  );
}

export function HomeContent({
  query,
  result,
  session = { status: "disabled" },
  authNotice,
}: {
  query: ObservationQuery;
  result?: ObservationApiResult;
  session?: AuthSession;
  authNotice?: "logout-error" | "oauth-pending";
}) {
  return (
    <main>
      <section className="hero-shell">
        <div className="star-field" aria-hidden="true" />
        <nav className="site-nav" aria-label="주요 탐색">
          <Link className="brand" href="/" aria-label="StellaAtlas 홈">
            <span className="brand-mark" aria-hidden="true">
              ✦
            </span>
            <span>StellaAtlas</span>
          </Link>
          <div className="nav-actions">
            <Link className="nav-link" href="/journal">
              관측 기록
            </Link>
            <Link className="nav-link" href="/sky">
              밤하늘 시뮬레이션
            </Link>
            <span className="milestone-badge">Milestone 8</span>
            <AccountMenu session={session} />
          </div>
        </nav>

        {authNotice ? (
          <p className="auth-notice" role="alert">
            {authNotice === "logout-error"
              ? "로그아웃을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요."
              : "Google 로그인은 Milestone 8에서 OAuth 등록 후 활성화됩니다."}
          </p>
        ) : null}

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">YOUR PERSONAL ATLAS OF THE NIGHT SKY</p>
            <h1>
              오늘 밤,
              <br />
              <span>별을 만나기 좋은 시간</span>을 찾으세요.
            </h1>
            <p className="hero-description">
              복잡한 날씨와 천문 데이터를 한눈에 이해할 수 있는 관측 안내로
              바꿔드립니다.
            </p>

            <ObservationSearchForm query={query} />
          </div>

          {result?.ok ? (
            <ObservationSummaryCard forecast={result.data} />
          ) : result ? (
            <ObservationErrorCard error={result.error} />
          ) : (
            <ObservationPromptCard />
          )}
        </div>
      </section>

      {result?.ok ? <ObservationDetails forecast={result.data} /> : null}

      <section className="explore-section" aria-labelledby="explore-heading">
        <div className="section-heading explore-heading">
          <p className="eyebrow dark">EXPLORE &amp; REMEMBER</p>
          <h2 id="explore-heading">관측 전에는 미리 보고, 관측 후에는 남겨보세요.</h2>
          <p>
            관측 조건을 확인한 다음 밤하늘을 탐색하거나, 직접 만난 순간을 사진과
            함께 이 기기에 기록할 수 있습니다.
          </p>
        </div>

        <div className="feature-entry-grid">
          <Link className="feature-entry-card sky-entry-card" href="/sky">
            <div className="feature-entry-visual sky-entry-visual" aria-hidden="true">
              <span className="sky-entry-moon" />
              <span className="sky-entry-orbit orbit-one" />
              <span className="sky-entry-orbit orbit-two" />
              <span className="sky-entry-star star-one">✦</span>
              <span className="sky-entry-star star-two">·</span>
              <span className="sky-entry-direction">N</span>
            </div>
            <div className="feature-entry-copy">
              <p>INTERACTIVE SKY</p>
              <h3>오늘 밤하늘을 먼저 둘러보세요.</h3>
              <span>
                위치와 시각을 바꾸며 별과 행성 찾기
                <strong aria-hidden="true">→</strong>
              </span>
            </div>
          </Link>

          <Link className="feature-entry-card journal-entry-card" href="/journal">
            <div className="feature-entry-visual journal-entry-visual" aria-hidden="true">
              <span className="journal-photo-back" />
              <span className="journal-photo-front">
                <i>✦</i>
              </span>
              <span className="journal-entry-tag">#오늘의하늘</span>
            </div>
            <div className="feature-entry-copy">
              <p>LOCAL JOURNAL</p>
              <h3>관측의 순간을 사진으로 남겨보세요.</h3>
              <span>
                사진과 코멘트를 이 브라우저에 기록하기
                <strong aria-hidden="true">→</strong>
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-heading">
        <div className="section-heading">
          <p className="eyebrow dark">HOW IT WORKS</p>
          <h2 id="process-heading">숫자보다 먼저, 의미를 전합니다.</h2>
          <p>
            관측에 익숙하지 않아도 오늘 나가야 할지 몇 초 안에 판단할 수
            있습니다.
          </p>
        </div>

        <ol className="step-grid">
          {steps.map((step) => (
            <li key={step.number} className="step-card">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>StellaAtlas</span>
        </Link>
        <p>좋은 밤하늘을 만나는 가장 쉬운 방법.</p>
      </footer>
    </main>
  );
}

function toQuery(params: Awaited<HomeSearchParams>): ObservationQuery {
  return {
    latitude: firstValue(params.latitude) ?? "",
    longitude: firstValue(params.longitude) ?? "",
    date: firstValue(params.date) ?? currentDate(),
  };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isCompleteQuery(query: ObservationQuery): boolean {
  return Boolean(query.latitude && query.longitude && query.date);
}

function toAuthNotice(
  value: string | undefined,
): "logout-error" | "oauth-pending" | undefined {
  return value === "logout-error" || value === "oauth-pending"
    ? value
    : undefined;
}
