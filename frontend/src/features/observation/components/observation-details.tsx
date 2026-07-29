import {
  formatDistance,
  formatGrade,
  formatPercent,
  formatTime,
  formatTwilight,
} from "@/features/observation/lib/format-observation";
import type {
  ObservationForecast,
  SolarEvent,
} from "@/features/observation/types/observation";

type ObservationDetailsProps = {
  forecast: ObservationForecast;
};

export function ObservationDetails({ forecast }: ObservationDetailsProps) {
  const { astronomy, location, hourly, summary } = forecast;
  const bestWindow = summary.bestWindow;
  const relevantHours = bestWindow
    ? hourly.filter((hour) => isInsideWindow(hour.time, bestWindow))
    : hourly.toSorted((left, right) => right.score - left.score).slice(0, 1);
  const reasons = relevantHours
    .flatMap((hour) => hour.reasons)
    .filter(
      (reason, index, all) =>
        all.findIndex((candidate) => candidate.code === reason.code) === index,
    )
    .slice(0, 4);

  return (
    <section className="results-section" aria-labelledby="results-heading">
      <div className="results-heading">
        <div>
          <p className="eyebrow dark">OBSERVATION DETAILS</p>
          <h2 id="results-heading">오늘 밤하늘을 시간별로 읽어봤어요.</h2>
        </div>
        <p>
          정오부터 다음 날 정오까지의 날씨와 박명, 달빛을 같은 시간축에서
          비교합니다.
        </p>
      </div>

      <div className="insight-grid">
        <article className="insight-card">
          <p className="insight-label">밤하늘 시간표</p>
          <dl className="astronomy-list">
            <AstronomyTime
              label="일몰"
              event={astronomy.sunset}
              timeZone={location.timezone}
            />
            <AstronomyTime
              label="천문박명 종료"
              event={astronomy.astronomicalTwilightEnd}
              timeZone={location.timezone}
            />
            <AstronomyTime
              label="월출"
              event={{
                time: astronomy.moonrise,
                state:
                  astronomy.lunarVisibility === "ALWAYS_ABOVE"
                    ? "ALWAYS_ABOVE"
                    : astronomy.lunarVisibility === "ALWAYS_BELOW"
                      ? "ALWAYS_BELOW"
                      : "OCCURS",
              }}
              timeZone={location.timezone}
            />
            <div>
              <dt>달 밝기</dt>
              <dd>{formatPercent(astronomy.moonIllumination * 100)}</dd>
            </div>
          </dl>
        </article>

        <article className="insight-card">
          <p className="insight-label">판단 근거</p>
          {reasons.length > 0 ? (
            <ul className="reason-list">
              {reasons.map((reason) => (
                <li key={reason.code}>
                  <span>{reason.impact}점</span>
                  <p>{reason.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ideal-copy">
              뚜렷한 방해 요인이 없어 관측에 유리합니다.
            </p>
          )}
        </article>
      </div>

      <div className="hourly-heading">
        <h3>시간대별 관측 점수</h3>
        <p>추천 시간은 밝게 표시했습니다.</p>
      </div>
      <ol className="hourly-grid">
        {hourly.map((hour) => (
          <li
            className={hour.recommended ? "hour-card recommended" : "hour-card"}
            key={hour.time}
          >
            <div className="hour-card-heading">
              <time dateTime={hour.time}>
                {formatTime(hour.time, location.timezone)}
              </time>
              <span>{formatGrade(hour.grade)}</span>
            </div>
            <strong className="hour-score">{hour.score}</strong>
            <p>{formatTwilight(hour.twilightPhase)}</p>
            <dl>
              <div>
                <dt>구름</dt>
                <dd>{formatPercent(hour.weather.cloudCoverPercent)}</dd>
              </div>
              <div>
                <dt>가시거리</dt>
                <dd>{formatDistance(hour.weather.visibilityMeters)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function AstronomyTime({
  label,
  event,
  timeZone,
}: {
  label: string;
  event: SolarEvent;
  timeZone: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{formatSolarEvent(event, timeZone)}</dd>
    </div>
  );
}

function formatSolarEvent(event: SolarEvent, timeZone: string): string {
  if (event.time) {
    return formatTime(event.time, timeZone);
  }
  return event.state === "ALWAYS_ABOVE" ? "지평선 위" : "지평선 아래";
}

function isInsideWindow(
  time: string,
  window: NonNullable<ObservationForecast["summary"]["bestWindow"]>,
): boolean {
  const value = new Date(time).getTime();
  return (
    value >= new Date(window.start).getTime() &&
    value < new Date(window.end).getTime()
  );
}
