# StellaAtlas Frontend

StellaAtlas의 모바일 우선 Next.js 프런트엔드입니다.

## Requirements

- Node.js 22.x
- npm 10.x

nvm을 사용하는 경우 저장소 루트의 `.nvmrc`를 기준으로 버전을 선택합니다.

## Commands

```bash
npm ci
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
```

로컬 개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

백엔드 API 주소가 기본값 `http://localhost:8080`과 다르면 환경 파일을
준비합니다.

```bash
cp .env.example .env.local
```

`API_BASE_URL`은 Server Component에서만 읽으며 브라우저 번들에 포함하지
않습니다.

## Structure

```text
src/
├── app/          # App Router 페이지와 route-level 상태
├── components/   # 범용 UI 컴포넌트
└── features/     # 기능별 UI와 로직
```

관측 API 타입, 조회 로직과 UI는 `features/observation`에 모으고 페이지는 URL
검색 조건을 해당 기능에 전달합니다.
