import {
  formatDistance,
  formatGrade,
  formatObservationDate,
  formatPercent,
  formatWindow,
} from "@/features/observation/lib/format-observation";
import type { ObservationForecast } from "@/features/observation/types/observation";

type ObservationSummaryCardProps = {
  forecast: ObservationForecast;
};

export function ObservationSummaryCard({
  forecast,
}: ObservationSummaryCardProps) {
  const { summary, location, astronomy, hourly } = forecast;
  const representativeHour =
    hourly.find((hour) => hour.recommended) ?? hourly[0];

  return (
    <article
      className={`result-card grade-${summary.grade.toLowerCase()}`}
      aria-label="관측 결과 요약"
    >
      <div className="result-card-header">
        <div>
          <p className="preview-kicker">Tonight&apos;s sky</p>
          <p className="preview-location">
            {formatObservationDate(forecast.date)} · {location.timezone}
          </p>
        </div>
        <span className="result-status">{formatGrade(summary.grade)}</span>
      </div>

      <div className="score-row">
        <div>
          <p className="score-label">Observation score</p>
          <p className="score-value">
            {summary.score}
            <span>/ 100</span>
          </p>
        </div>
        <div className="moon-stat" aria-label={`달 밝기 ${formatPercent(astronomy.moonIllumination * 100)}`}>
          <span aria-hidden="true">◐</span>
          <strong>{formatPercent(astronomy.moonIllumination * 100)}</strong>
        </div>
      </div>

      <p className="result-message">{summary.message}</p>

      <div className="best-window">
        <span>가장 좋은 관측 시간</span>
        {summary.bestWindow ? (
          <>
            <strong>
              {formatWindow(
                summary.bestWindow.start,
                summary.bestWindow.end,
                location.timezone,
              )}
            </strong>
            <small>평균 {summary.bestWindow.averageScore}점</small>
          </>
        ) : (
          <strong>추천 가능한 시간 없음</strong>
        )}
      </div>

      {representativeHour ? (
        <div className="condition-grid" aria-label="주요 관측 조건">
          <div className="condition-item">
            <span>구름</span>
            <strong>
              {formatPercent(representativeHour.weather.cloudCoverPercent)}
            </strong>
          </div>
          <div className="condition-item">
            <span>강수</span>
            <strong>
              {formatPercent(
                representativeHour.weather.precipitationProbabilityPercent,
              )}
            </strong>
          </div>
          <div className="condition-item">
            <span>가시거리</span>
            <strong>
              {formatDistance(representativeHour.weather.visibilityMeters)}
            </strong>
          </div>
        </div>
      ) : null}
    </article>
  );
}
