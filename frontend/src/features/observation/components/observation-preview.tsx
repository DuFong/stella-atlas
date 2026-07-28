export function ObservationPreview() {
  return (
    <article className="preview-card" aria-label="관측 결과 화면 미리보기">
      <div className="preview-header">
        <div>
          <p className="preview-kicker">Tonight&apos;s sky</p>
          <p className="preview-location">서울 · 7월 28일</p>
        </div>
        <span className="preview-status">미리보기</span>
      </div>

      <div className="score-row">
        <div>
          <p className="score-label">Observation score</p>
          <p className="score-value">
            82<span>/ 100</span>
          </p>
        </div>
        <div className="moon-orbit" aria-label="초승달">
          <div className="moon" aria-hidden="true" />
        </div>
      </div>

      <div className="best-window">
        <span>가장 좋은 관측 시간</span>
        <strong>밤 10:00 — 자정</strong>
      </div>

      <div className="condition-grid" aria-label="주요 관측 조건">
        <div className="condition-item">
          <span>구름</span>
          <strong>12%</strong>
        </div>
        <div className="condition-item">
          <span>달 밝기</span>
          <strong>18%</strong>
        </div>
        <div className="condition-item">
          <span>가시거리</span>
          <strong>18 km</strong>
        </div>
      </div>
    </article>
  );
}
