"use client";

import { useEffect, useRef, useState } from "react";

export function CameraCapture({
  onCapture,
}: {
  onCapture: (file: File, capturedAt: Date) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState<string>();

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    },
    [],
  );

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("이 브라우저에서는 카메라 촬영을 지원하지 않습니다.");
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      setActive(true);
      setMessage("촬영 화면을 확인한 뒤 사진 찍기를 눌러주세요.");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setActive(false);
      setMessage("카메라 권한이 거부되었거나 카메라를 시작하지 못했습니다.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("카메라 화면이 준비된 후 다시 촬영해 주세요.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setMessage("사진을 생성하지 못했습니다. 다시 촬영해 주세요.");
          return;
        }
        const capturedAt = new Date();
        onCapture(
          new File([blob], `stella-${capturedAt.getTime()}.jpg`, {
            type: "image/jpeg",
            lastModified: capturedAt.getTime(),
          }),
          capturedAt,
        );
        stopCamera();
        setMessage("사진을 촬영했습니다. 촬영 시각과 위치를 확인해 주세요.");
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <div className="camera-capture">
      <div className="camera-actions">
        {!active ? (
          <button type="button" className="secondary-button" onClick={startCamera}>
            <span aria-hidden="true">◉</span> 카메라 켜기
          </button>
        ) : (
          <>
            <button type="button" className="primary-button" onClick={takePhoto}>
              사진 찍기
            </button>
            <button type="button" className="text-button" onClick={stopCamera}>
              카메라 닫기
            </button>
          </>
        )}
      </div>
      <video
        ref={videoRef}
        className={active ? "camera-preview active" : "camera-preview"}
        aria-label="카메라 미리보기"
        playsInline
        muted
      />
      {message ? <p className="field-message" role="status">{message}</p> : null}
    </div>
  );
}
