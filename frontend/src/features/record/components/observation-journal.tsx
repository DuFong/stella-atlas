"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  JournalStorageError,
  type ObservationJournalPort,
} from "@/features/record/application/observation-journal";
import { CameraCapture } from "@/features/record/components/camera-capture";
import {
  MAX_COMMENT_LENGTH,
  validateImage,
  type FieldSource,
  type ObservationPost,
} from "@/features/record/domain/observation-post";
import { readPhotoMetadata } from "@/features/record/infrastructure/exifr-photo-metadata";
import { IndexedDbObservationJournal } from "@/features/record/infrastructure/indexeddb-observation-journal";

type FormState = {
  capturedAt: string;
  timeZone: string;
  latitude: string;
  longitude: string;
  comment: string;
  capturedAtSource: FieldSource;
  locationSource: FieldSource;
};

const EMPTY_FORM: FormState = {
  capturedAt: "",
  timeZone: "",
  latitude: "",
  longitude: "",
  comment: "",
  capturedAtSource: "none",
  locationSource: "none",
};

export function ObservationJournal({
  journal: providedJournal,
}: {
  journal?: ObservationJournalPort;
}) {
  const journal = useMemo(
    () => providedJournal ?? new IndexedDbObservationJournal(),
    [providedJournal],
  );
  const [posts, setPosts] = useState<ObservationPost[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [image, setImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [editingPost, setEditingPost] = useState<ObservationPost>();
  const [message, setMessage] = useState("로컬 관측 기록을 불러오고 있습니다.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    journal
      .list()
      .then((loadedPosts) => {
        if (!cancelled) {
          setPosts(loadedPosts);
          setMessage(
            loadedPosts.length === 0
              ? "아직 저장한 관측 기록이 없습니다. 첫 사진을 남겨보세요."
              : `${loadedPosts.length}개의 로컬 관측 기록을 불러왔습니다.`,
          );
        }
      })
      .catch((error) => !cancelled && setMessage(storageMessage(error)));
    return () => {
      cancelled = true;
    };
  }, [journal]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function selectImage(file: File, captureTime?: Date) {
    const validationError = validateImage(file);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    setBusy(true);
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (captureTime) {
      setForm((current) => ({
        ...current,
        capturedAt: toLocalDateTimeValue(captureTime.toISOString()),
        timeZone: current.timeZone || browserTimeZone(),
        capturedAtSource: "capture",
      }));
      setMessage("촬영 시각을 자동 입력했습니다. 위치를 입력하거나 현재 위치를 사용해 주세요.");
      setBusy(false);
      return;
    }

    const metadata = await readPhotoMetadata(file);
    setForm((current) => ({
      ...current,
      capturedAt: metadata.capturedAt
        ? toLocalDateTimeValue(metadata.capturedAt)
        : editingPost
          ? current.capturedAt
          : "",
      timeZone: metadata.capturedAt
        ? current.timeZone || browserTimeZone()
        : editingPost
          ? current.timeZone
          : "",
      latitude:
        metadata.latitude !== undefined
          ? String(metadata.latitude)
          : editingPost
            ? current.latitude
            : "",
      longitude:
        metadata.longitude !== undefined
          ? String(metadata.longitude)
          : editingPost
            ? current.longitude
            : "",
      capturedAtSource: metadata.capturedAt ? "exif" : editingPost ? current.capturedAtSource : "none",
      locationSource:
        metadata.latitude !== undefined && metadata.longitude !== undefined
          ? "exif"
          : editingPost
            ? current.locationSource
            : "none",
    }));
    const extracted = [metadata.capturedAt ? "촬영 시각" : "", metadata.latitude !== undefined ? "GPS" : ""]
      .filter(Boolean)
      .join("과 ");
    setMessage(
      extracted
        ? `사진 메타데이터에서 ${extracted} 값을 입력했습니다. 저장 전에 확인해 주세요.`
        : "사진에 읽을 수 있는 촬영 시각이나 GPS가 없어 입력란을 비워두었습니다.",
    );
    setBusy(false);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void selectImage(file);
    }
    event.target.value = "";
  }

  function fillCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
      return;
    }
    setMessage("현재 위치 권한을 확인하고 있습니다.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
          locationSource: "capture",
        }));
        setMessage("현재 위치를 입력했습니다. 정확한지 확인한 뒤 저장해 주세요.");
      },
      () => setMessage("위치 권한이 거부되었거나 현재 위치를 확인하지 못했습니다."),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image && !editingPost) {
      setMessage("저장할 사진을 먼저 선택하거나 촬영해 주세요.");
      return;
    }
    const latitude = optionalNumber(form.latitude);
    const longitude = optionalNumber(form.longitude);
    if (
      latitude === null ||
      longitude === null ||
      (latitude === undefined) !== (longitude === undefined)
    ) {
      setMessage("위도와 경도는 둘 다 입력하거나 둘 다 비워 주세요.");
      return;
    }
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    ) {
      setMessage("위도는 -90~90, 경도는 -180~180 범위로 입력해 주세요.");
      return;
    }
    if (form.capturedAt && !isValidTimeZone(form.timeZone || browserTimeZone())) {
      setMessage("시간대는 Asia/Seoul 같은 유효한 IANA 시간대로 입력해 주세요.");
      return;
    }
    setBusy(true);
    try {
      await journal.save({
        id: editingPost?.id,
        image: image ? { blob: image, name: image.name } : undefined,
        capturedAt: form.capturedAt
          ? new Date(form.capturedAt).toISOString()
          : undefined,
        timeZone: form.capturedAt ? form.timeZone || browserTimeZone() : undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        comment: form.comment.trim(),
        sources: {
          capturedAt: form.capturedAt ? form.capturedAtSource : "none",
          location: latitude === undefined ? "none" : form.locationSource,
        },
      });
      const loadedPosts = await journal.list();
      setPosts(loadedPosts);
      resetForm();
      setMessage(editingPost ? "관측 기록을 수정했습니다." : "이 브라우저에 관측 기록을 저장했습니다.");
    } catch (error) {
      setMessage(storageMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function edit(post: ObservationPost) {
    setEditingPost(post);
    setImage(undefined);
    setForm({
      capturedAt: post.capturedAt ? toLocalDateTimeValue(post.capturedAt) : "",
      timeZone: post.timeZone ?? "",
      latitude: post.latitude === undefined ? "" : String(post.latitude),
      longitude: post.longitude === undefined ? "" : String(post.longitude),
      comment: post.comment,
      capturedAtSource: post.sources.capturedAt,
      locationSource: post.sources.location,
    });
    const blob = await journal.get(post.image.id);
    setPreviewUrl(blob ? URL.createObjectURL(blob) : undefined);
    setMessage("저장된 값을 불러왔습니다. 수정 후 저장해 주세요.");
    document.getElementById("journal-form")?.scrollIntoView({ behavior: "smooth" });
  }

  async function remove(post: ObservationPost) {
    if (!window.confirm("이 기기에 저장된 사진과 기록을 삭제할까요?")) {
      return;
    }
    setBusy(true);
    try {
      await journal.delete(post.id);
      setPosts(await journal.list());
      if (editingPost?.id === post.id) {
        resetForm();
      }
      setMessage("사진과 관측 기록을 이 브라우저에서 삭제했습니다.");
    } catch (error) {
      setMessage(storageMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setEditingPost(undefined);
    setImage(undefined);
    setPreviewUrl(undefined);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="journal-layout">
      <section className="journal-editor" aria-labelledby="journal-heading">
        <div className="journal-heading">
          <p className="eyebrow">LOCAL OBSERVATION JOURNAL</p>
          <h1 id="journal-heading">오늘 만난 밤하늘을 기록하세요.</h1>
          <p>사진 속 촬영 시각과 GPS를 먼저 찾아 입력하고, 모든 값은 저장 전에 직접 고칠 수 있습니다.</p>
        </div>

        <form id="journal-form" className="journal-form" onSubmit={submit}>
          <fieldset disabled={busy}>
            <legend>{editingPost ? "관측 기록 수정" : "새 관측 기록"}</legend>
            <div className="photo-input-grid">
              <label className="file-picker">
                <span aria-hidden="true">＋</span>
                <strong>사진 선택</strong>
                <small>JPG, PNG 등 이미지 · 최대 20MB</small>
                <input type="file" accept="image/*" onChange={handleFile} />
              </label>
              <CameraCapture onCapture={(file, date) => void selectImage(file, date)} />
            </div>

            {previewUrl ? (
              // Blob URLs are local, short-lived previews and are not optimized by Next Image.
              // eslint-disable-next-line @next/next/no-img-element
              <img className="selected-photo" src={previewUrl} alt="저장할 관측 사진 미리보기" />
            ) : editingPost ? (
              <p className="photo-placeholder">기존 사진을 유지합니다. 다른 사진을 선택하면 교체됩니다.</p>
            ) : null}

            <div className="journal-field-grid">
              <label>
                <span>촬영 일시 <SourceBadge source={form.capturedAtSource} /></span>
                <input
                  type="datetime-local"
                  value={form.capturedAt}
                  onChange={(event) => setForm({ ...form, capturedAt: event.target.value, capturedAtSource: "user" })}
                />
              </label>
              <label>
                <span>시간대 (IANA)</span>
                <input
                  value={form.timeZone}
                  placeholder="Asia/Seoul"
                  onChange={(event) => setForm({ ...form, timeZone: event.target.value })}
                  disabled={!form.capturedAt}
                />
              </label>
              <label>
                <span>위도 <SourceBadge source={form.locationSource} /></span>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={form.latitude}
                  onChange={(event) => setForm({ ...form, latitude: event.target.value, locationSource: "user" })}
                />
              </label>
              <label>
                <span>경도 <SourceBadge source={form.locationSource} /></span>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={form.longitude}
                  onChange={(event) => setForm({ ...form, longitude: event.target.value, locationSource: "user" })}
                />
              </label>
            </div>

            <button type="button" className="location-fill-button" onClick={fillCurrentLocation}>
              ◎ 현재 위치 입력
            </button>

            <label className="comment-field">
              <span>코멘트와 해시태그</span>
              <textarea
                maxLength={MAX_COMMENT_LENGTH}
                rows={4}
                value={form.comment}
                placeholder="오늘 본 하늘을 짧게 남겨보세요. #달관측 #서울"
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
              />
              <small>{form.comment.length}/{MAX_COMMENT_LENGTH}</small>
            </label>

            <div className="journal-submit-row">
              <button className="journal-submit-button" type="submit">
                {busy ? "저장 중…" : editingPost ? "수정 내용 저장" : "이 기기에 저장"}
              </button>
              {editingPost ? <button className="text-button" type="button" onClick={resetForm}>수정 취소</button> : null}
            </div>
          </fieldset>
          <p className="journal-status" role="status" aria-live="polite">{message}</p>
          <p className="journal-privacy-note">사진과 위치는 서버로 전송되지 않고 현재 브라우저의 IndexedDB에만 저장됩니다. 브라우저 데이터를 지우거나 기기를 바꾸면 사라질 수 있습니다.</p>
        </form>
      </section>

      <section className="journal-list-section" aria-labelledby="saved-posts-heading">
        <div className="saved-posts-heading">
          <div>
            <p className="eyebrow dark">SAVED ON THIS DEVICE</p>
            <h2 id="saved-posts-heading">로컬 관측 기록</h2>
          </div>
          <span>{posts.length}개</span>
        </div>
        {posts.length === 0 ? (
          <div className="journal-empty"><span aria-hidden="true">✦</span><p>저장된 기록이 여기에 나타납니다.</p></div>
        ) : (
          <div className="journal-card-grid">
            {posts.map((post) => (
              <article className="journal-card" key={post.id}>
                <StoredPhoto journal={journal} post={post} />
                <div className="journal-card-body">
                  <time dateTime={post.capturedAt ?? post.createdAt}>{formatPostDate(post)}</time>
                  <p>{post.comment || "코멘트 없이 저장한 관측 기록입니다."}</p>
                  {post.hashtags.length > 0 ? <ul className="hashtag-list">{post.hashtags.map((tag) => <li key={tag}>#{tag}</li>)}</ul> : null}
                  <details>
                    <summary>촬영 정보</summary>
                    <dl>
                      <div><dt>위치</dt><dd>{formatLocation(post)}</dd></div>
                      <div><dt>시간대</dt><dd>{post.timeZone ?? "정보 없음"}</dd></div>
                      <div><dt>사진</dt><dd>{post.image.name}</dd></div>
                    </dl>
                  </details>
                  <div className="journal-card-actions">
                    <button type="button" onClick={() => void edit(post)}>수정</button>
                    <button type="button" className="danger" onClick={() => void remove(post)}>삭제</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StoredPhoto({ journal, post }: { journal: ObservationJournalPort; post: ObservationPost }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    journal.get(post.image.id).then((blob) => {
      if (blob && !cancelled) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    }).catch(() => !cancelled && setUrl(undefined));
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [journal, post.image.id]);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="journal-card-photo" src={url} alt="저장된 관측 사진" />
  ) : <div className="journal-card-photo missing">사진을 불러올 수 없습니다.</div>;
}

function SourceBadge({ source }: { source: FieldSource }) {
  const labels: Record<FieldSource, string> = { exif: "사진 자동입력", capture: "촬영 자동입력", user: "직접 입력", none: "정보 없음" };
  return <small className={`source-badge ${source}`}>{labels[source]}</small>;
}

function optionalNumber(value: string): number | undefined | null {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("ko-KR", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function toLocalDateTimeValue(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function storageMessage(error: unknown): string {
  if (error instanceof JournalStorageError && error.reason === "quota") return "브라우저 저장 공간이 부족합니다. 기존 기록이나 다른 사이트 데이터를 정리한 뒤 다시 시도해 주세요.";
  if (error instanceof JournalStorageError && error.reason === "unsupported") return "이 브라우저에서는 로컬 관측 기록 저장을 지원하지 않습니다.";
  return "로컬 저장소를 사용할 수 없습니다. 사생활 보호 모드나 브라우저 설정을 확인해 주세요.";
}

function formatPostDate(post: ObservationPost): string {
  if (!post.capturedAt) return "촬영 시각 정보 없음";
  return `${new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.capturedAt))}${post.timeZone ? ` · ${post.timeZone}` : ""}`;
}

function formatLocation(post: ObservationPost): string {
  return post.latitude === undefined || post.longitude === undefined
    ? "위치 정보 없음"
    : `${post.latitude.toFixed(6)}, ${post.longitude.toFixed(6)}`;
}
