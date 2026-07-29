import type { AuthSession } from "@/features/auth/types/auth";
import Link from "next/link";

type AccountMenuProps = {
  session: AuthSession;
};

export function AccountMenu({ session }: AccountMenuProps) {
  if (session.status === "disabled") {
    return (
      <span className="login-button disabled" aria-label="Google 로그인 준비 중">
        <GoogleMark />
        Google 로그인 준비 중
      </span>
    );
  }

  if (session.status !== "authenticated") {
    return (
      <div className="account-actions">
        {session.status === "unavailable" ? (
          <span className="auth-status">인증 서버 확인 필요</span>
        ) : null}
        <Link className="login-button" href="/auth/login">
          <GoogleMark />
          Google로 로그인
        </Link>
      </div>
    );
  }

  const label =
    session.user.name ?? session.user.email ?? "StellaAtlas 사용자";

  return (
    <div className="account-menu">
      <span className="account-avatar" aria-hidden="true">
        {label.slice(0, 1).toUpperCase()}
      </span>
      <span className="account-name" title={label}>
        {label}
      </span>
      <form action="/auth/logout" method="post">
        <button className="logout-button" type="submit">
          로그아웃
        </button>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      className="google-mark"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="currentColor"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5L18.7 4.56A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}
