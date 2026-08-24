"use client";

import { useState, type FormEvent } from "react";
import type { ServerObservationRecord } from "@/features/record/types/server-observation-record";

export function ServerObservationRecords({
  enabled,
  initialObservedAt,
  initialRecords = [],
  available = true,
}: {
  enabled: boolean;
  initialObservedAt: string;
  initialRecords?: ServerObservationRecord[];
  available?: boolean;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [observedAt, setObservedAt] = useState(() =>
    toLocalDateTimeValue(new Date(initialObservedAt)),
  );
  const [timezone, setTimezone] = useState(() => browserTimeZone());
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    available ? "" : "서버 관측 기록을 불러오지 못했습니다.",
  );

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const coordinates = parseCoordinates(latitude, longitude);
    if (!coordinates.ok) {
      setMessage(coordinates.message);
      return;
    }
    setBusy(true);
    setMessage("관측 메타데이터를 계정에 저장하고 있습니다.");
    try {
      const response = await fetch("/api/observation-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observedAt: new Date(observedAt).toISOString(),
          timezone,
          ...coordinates.value,
          comment: comment.trim(),
        }),
      });
      if (!response.ok) {
        setMessage(recordErrorMessage(response.status, "저장"));
        return;
      }
      const payload = (await response.json()) as ServerObservationRecord;
      setRecords((current) => [payload, ...current]);
      setComment("");
      setMessage("관측 메타데이터를 계정에 저장했습니다. 사진은 업로드하지 않았습니다.");
    } catch {
      setMessage("서버 관측 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(record: ServerObservationRecord) {
    if (!window.confirm("계정에 저장된 이 관측 메타데이터를 삭제할까요?")) {
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/observation-records/${record.id}`, {
        method: "DELETE",
      });
      if (response.status !== 204) {
        setMessage(recordErrorMessage(response.status, "삭제"));
        return;
      }
      setRecords((current) => current.filter(({ id }) => id !== record.id));
      setMessage("계정의 관측 메타데이터를 삭제했습니다.");
    } catch {
      setMessage("서버 관측 기록을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) {
    return (
      <section className="server-records" aria-labelledby="server-records-heading">
        <div className="server-records-heading">
          <p className="eyebrow">ACCOUNT RECORDS</p>
          <h1 id="server-records-heading">계정에서도 관측 메모를 이어가세요.</h1>
          <p>Google로 로그인하면 사진 없이 관측 메타데이터를 계정에 저장할 수 있습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="server-records" aria-labelledby="server-records-heading">
      <div className="server-records-heading">
        <p className="eyebrow">ACCOUNT RECORDS</p>
        <h1 id="server-records-heading">계정에 관측 메타데이터를 남기세요.</h1>
        <p>관측 시각, 선택 좌표, 코멘트와 해시태그만 저장합니다. 사진 업로드와 로컬 기록 이전은 아직 지원하지 않습니다.</p>
      </div>

      <form className="server-record-form" onSubmit={save}>
        <fieldset disabled={busy}>
          <legend>새 서버 관측 기록</legend>
          <div className="journal-field-grid">
            <label>
              <span>관측 일시</span>
              <input
                type="datetime-local"
                value={observedAt}
                onChange={(event) => setObservedAt(event.target.value)}
                required
              />
            </label>
            <label>
              <span>시간대 (IANA)</span>
              <input
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="Asia/Seoul"
                maxLength={63}
                required
              />
            </label>
            <label>
              <span>위도 (선택)</span>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.000001"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
              />
            </label>
            <label>
              <span>경도 (선택)</span>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.000001"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
              />
            </label>
          </div>
          <label className="comment-field">
            <span>코멘트와 해시태그</span>
            <textarea
              aria-label="코멘트와 해시태그"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={500}
              placeholder="예: 구름 사이로 목성을 관측했다. #목성 #서울"
            />
            <small>{comment.length}/500</small>
          </label>
          <button className="journal-submit-button" type="submit">메타데이터 저장</button>
        </fieldset>
      </form>

      <p className="server-record-message" role="status" aria-live="polite">{message}</p>

      <div className="server-record-list">
        {records.length === 0 ? (
          <p className="server-record-empty">계정에 저장한 관측 기록이 없습니다.</p>
        ) : records.map((record) => (
          <article className="server-record-card" key={record.id}>
            <div>
              <time dateTime={record.observedAt}>{formatDateTime(record.observedAt, record.timezone)}</time>
              <p>{record.comment || "코멘트 없음"}</p>
              {record.latitude !== null && record.longitude !== null ? (
                <small>위도 {record.latitude}, 경도 {record.longitude} · {record.timezone}</small>
              ) : <small>{record.timezone} · 위치 미저장</small>}
              {record.hashtags.length > 0 ? (
                <div className="server-record-tags">
                  {record.hashtags.map((tag) => <span key={tag}>#{tag}</span>)}
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => void remove(record)} disabled={busy}>삭제</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function parseCoordinates(latitude: string, longitude: string):
  | { ok: true; value: { latitude?: number; longitude?: number } }
  | { ok: false; message: string } {
  if (!latitude && !longitude) {
    return { ok: true, value: {} };
  }
  if (!latitude || !longitude) {
    return { ok: false, message: "위도와 경도는 둘 다 입력하거나 둘 다 비워 주세요." };
  }
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  if (
    !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 ||
    !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180
  ) {
    return { ok: false, message: "위도와 경도의 범위를 다시 확인해 주세요." };
  }
  return { ok: true, value: { latitude: parsedLatitude, longitude: parsedLongitude } };
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function toLocalDateTimeValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDateTime(value: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function recordErrorMessage(status: number, action: "저장" | "삭제"): string {
  if (status === 401) {
    return "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.";
  }
  if (status === 400) {
    return "관측 시각, 시간대와 좌표를 다시 확인해 주세요.";
  }
  return `서버 관측 기록을 ${action}하지 못했습니다. 잠시 후 다시 시도해 주세요.`;
}
