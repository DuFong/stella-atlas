import type { ObservationApiError } from "@/features/observation/types/observation";

export function ObservationPromptCard() {
  return (
    <article className="prompt-card" aria-label="관측 조건 조회 안내">
      <span className="prompt-symbol" aria-hidden="true">
        ✦
      </span>
      <p className="preview-kicker">Ready when you are</p>
      <h2>보고 싶은 밤하늘의 좌표와 날짜를 입력해 주세요.</h2>
      <p>
        시간대별 날씨와 박명, 달빛을 비교해 가장 좋은 관측 시간을
        찾아드립니다.
      </p>
      <ul>
        <li>0–100 관측 점수</li>
        <li>가장 좋은 연속 시간대</li>
        <li>조건별 감점 이유</li>
      </ul>
    </article>
  );
}

export function ObservationErrorCard({
  error,
}: {
  error: ObservationApiError;
}) {
  return (
    <article className="prompt-card error-card" role="alert">
      <span className="prompt-symbol" aria-hidden="true">
        !
      </span>
      <p className="preview-kicker">Unable to read the sky</p>
      <h2>관측 결과를 불러오지 못했어요.</h2>
      <p>{error.message}</p>
      <small>오류 코드: {error.code}</small>
    </article>
  );
}
