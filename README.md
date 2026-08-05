# StellaAtlas

> Your Personal Atlas of the Night Sky

StellaAtlas는 날씨와 천문 데이터를 이해하기 쉬운 관측 정보로 변환하여
사용자가 오늘 밤 별을 관측하기 좋은지 판단하도록 돕는 웹 서비스입니다.

**Milestone 7 — Observation Journal and Sky Simulation**을 완료했습니다.
비로그인 관측 조회에 사진 기반 로컬 관측 기록과 대화형 밤하늘 시뮬레이션을
추가했습니다. 실제 Google OAuth 애플리케이션 등록과 즐겨찾기·최근 조회 위치
기능은 Milestone 8에서 진행합니다.

## Technology

| Area | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5.x, Gradle |
| Frontend | Node.js 22.23.1, Next.js 16.2.12, TypeScript, Tailwind CSS |
| Database | PostgreSQL 17, Flyway |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

## Repository

```text
stella-atlas/
├── .github/       # GitHub Actions와 협업 템플릿
├── backend/       # Spring Boot 애플리케이션
├── frontend/      # Next.js 애플리케이션
├── docker/        # 애플리케이션 컨테이너 구성
├── docs/          # 제품, 아키텍처, API 및 개발 문서
├── AGENTS.md      # AI 에이전트 작업 규칙
└── docker-compose.yml
```

애플리케이션 코드는 기능 중심의 모듈러 모놀리스로 구성합니다. 자세한 원칙은
[Architecture](docs/ARCHITECTURE.md)와 [Agent Instructions](AGENTS.md)를
참고합니다.

## Prerequisites

- Git
- Docker Desktop 또는 Docker Engine과 Compose 플러그인
- Java 21
- Node.js 22.23.1

## Local Development

환경변수 예시 파일을 복사한 뒤 필요한 값을 로컬 환경에 맞게 변경합니다.

```bash
cp .env.example .env
docker compose up -d
docker compose ps
```

PostgreSQL은 기본적으로 `localhost:5432`에서 실행됩니다. 종료할 때 데이터는
유지됩니다.

```bash
docker compose down
```

볼륨까지 삭제하는 `docker compose down --volumes`는 로컬 데이터가 필요하지
않을 때만 사용합니다.

백엔드를 실행하고 검증합니다.

```bash
cd backend
./gradlew bootRun
./gradlew check
```

애플리케이션 상태는 `GET http://localhost:8080/actuator/health`에서 확인할 수
있습니다. PostgreSQL 연결 정보는 루트 `.env.example`과
`backend/src/main/resources/application.yml`을 기준으로 합니다.

Milestone 6의 Google 로그인 기반은 OAuth 프로필에서만 활성화됩니다. 실제
Google Cloud Console 등록과 운영 연결은 Milestone 8 범위이며, 연동할 때 OAuth
클라이언트에 다음 로컬 redirect URI를 등록합니다.

```text
http://localhost:8080/login/oauth2/code/google
```

로컬 환경변수를 설정한 뒤 백엔드를 실행합니다. Client secret은 `.env`를 포함한
저장소 파일에 커밋하지 않습니다.

```bash
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export FRONTEND_BASE_URL="http://localhost:3000"
SPRING_PROFILES_ACTIVE=oauth ./gradlew bootRun
```

로그인은 `GET http://localhost:8080/oauth2/authorization/google`에서 시작하며
성공하면 프런트엔드로 돌아옵니다. 로그인한 사용자 정보는
`GET /api/v1/users/me`에서 확인합니다. OAuth 프로필 없이 실행해도 공개 관측
API는 사용할 수 있지만 로그인 시작 endpoint는 활성화되지 않습니다.

프런트엔드의 `Google로 로그인` 버튼은 `/auth/login` Route Handler를 통해 이
로그인 흐름을 시작합니다. 로그인 후에는 사용자 이름과 로그아웃 버튼을 표시하며,
로그아웃 Route Handler가 CSRF token과 backend session cookie를 전달합니다.
Milestone 8의 Google OAuth 등록 전에는 `AUTH_ENABLED=false`를 유지해 버튼을
준비 중 상태로 표시하고, 실제 client 설정과 callback 검증 후 `true`로
전환합니다.

통합 관측 결과는 다음 API에서 확인할 수 있습니다.

```text
GET /api/v1/observations?latitude=37.5665&longitude=126.9780&date=2026-08-01
```

요청 날짜의 로컬 정오부터 다음 날 정오까지 날씨와 천문 조건을 정렬해 시간대별
점수와 최적 관측 구간을 반환합니다.

Milestone 3의 날씨 연동은 기본적으로 Open-Meteo의 비상업용 공개 API를
사용합니다. base URL, 타임아웃과 캐시는 다음 환경변수로 조정할 수 있습니다.

```text
WEATHER_API_BASE_URL
WEATHER_API_CONNECT_TIMEOUT
WEATHER_API_READ_TIMEOUT
WEATHER_CACHE_TTL
WEATHER_CACHE_MAXIMUM_SIZE
```

공개 API는 개발·평가 용도이며 상용 배포 전에는 Open-Meteo 상용 endpoint와
API key 지원 또는 self-hosting을 결정하고 데이터 출처 표기를 적용해야 합니다.

Milestone 4의 천문 정보는 외부 API 없이 Commons SunCalc로 계산하며, 좌표의
IANA 시간대는 TimeShape의 내장 경계 데이터로 해석합니다. 별도 API key나
환경변수는 필요하지 않습니다. 정확도와 라이선스 고려사항은
[Architecture Decisions](docs/DECISIONS.md)와
[Third-Party Notices](docs/THIRD_PARTY_NOTICES.md)를 참고합니다.

프런트엔드를 실행하고 검증합니다.

```bash
nvm use
cd frontend
cp .env.example .env.local
npm ci
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
```

프런트엔드 개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.
`API_BASE_URL`은 Next.js 서버가 호출할 백엔드 주소이며 기본값은
`http://localhost:8080`입니다. 브라우저가 백엔드를 직접 호출하지 않으므로
별도 CORS 설정은 필요하지 않습니다.

Milestone 7의 첫 밤하늘 시뮬레이션은 `/sky`에서 확인할 수 있습니다. 위치와 UTC
시각을 기준으로 태양·달·주요 행성과 밝은 별의 지평 좌표를 브라우저에서 계산하고
Canvas에 표시합니다. 이 기능은 서버 API나 추가 `application.yml` 설정을
사용하지 않습니다.

로컬 관측 기록은 `/journal`에서 확인할 수 있습니다. 이미지 업로드 또는 지원
기기의 카메라 촬영, EXIF 촬영 시각·GPS 자동입력, 코멘트·해시태그, 목록·수정·
삭제를 제공합니다. 사진과 게시물은 최대 20MB 단일 이미지 기준으로 현재
브라우저의 IndexedDB에만 저장되며 서버나 PostgreSQL로 전송되지 않습니다.

## Documentation

- [Vision](docs/VISION.md)
- [Product Specification](docs/PRODUCT.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [API Guidelines](docs/API.md)
- [Observation Score](docs/OBSERVATION_SCORE.md)
- [Architecture Decisions](docs/DECISIONS.md)
- [Third-Party Notices](docs/THIRD_PARTY_NOTICES.md)
- [Contributing](CONTRIBUTING.md)

## Contribution

`main`에서 작업 브랜치를 만든 뒤 하나의 명확한 작업 단위로 변경하고 Pull
Request를 생성합니다. 브랜치명, 커밋 형식, 검증 및 PR 요구사항은
[CONTRIBUTING.md](CONTRIBUTING.md)를 따릅니다.

## License

라이선스는 아직 확정되지 않았습니다. 공개 배포 전 승인된 라이선스로
교체하거나 비공개 소프트웨어임을 명시해야 합니다.
