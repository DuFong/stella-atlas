import { ObservationPreview } from "@/features/observation/components/observation-preview";
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

export default function Home() {
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
          <span className="milestone-badge">Milestone 2</span>
        </nav>

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

            <div className="coming-soon" role="note">
              <span className="pulse-dot" aria-hidden="true" />
              관측 조건 조회 기능을 준비하고 있습니다
            </div>
          </div>

          <ObservationPreview />
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
