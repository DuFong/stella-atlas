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

## Structure

```text
src/
├── app/          # App Router 페이지와 route-level 상태
├── components/   # 범용 UI 컴포넌트
└── features/     # 기능별 UI와 로직
```

서버 데이터 조회는 향후 기능 마일스톤에서 `features` 아래에 추가하며 페이지
컴포넌트에 비즈니스 로직을 집중시키지 않습니다.
