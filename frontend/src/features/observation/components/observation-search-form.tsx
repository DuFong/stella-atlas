import type { ObservationQuery } from "@/features/observation/types/observation";

type ObservationSearchFormProps = {
  query: ObservationQuery;
};

export function ObservationSearchForm({
  query,
}: ObservationSearchFormProps) {
  return (
    <form className="observation-form" action="/" method="get">
      <div className="coordinate-fields">
        <label>
          <span>위도</span>
          <input
            name="latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
            defaultValue={query.latitude}
            placeholder="37.5665"
            required
          />
        </label>
        <label>
          <span>경도</span>
          <input
            name="longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
            defaultValue={query.longitude}
            placeholder="126.9780"
            required
          />
        </label>
      </div>
      <label>
        <span>관측 날짜</span>
        <input name="date" type="date" defaultValue={query.date} required />
      </label>
      <button type="submit">
        <span aria-hidden="true">✦</span>
        관측 조건 확인
      </button>
      <p className="form-hint">
        입력한 좌표는 결과 조회에만 사용하며 저장하지 않습니다.
      </p>
    </form>
  );
}
