# StellaAtlas

> Your Personal Atlas of the Night Sky

StellaAtlas는 날씨와 천문 데이터를 이해하기 쉬운 관측 정보로 변환하여
사용자가 오늘 밤 별을 관측하기 좋은지 판단하도록 돕는 웹 서비스입니다.

현재 저장소는 **Milestone 5 — Observation Score** 단계입니다. 날씨와 천문
계산 기반을 완료했으며, 시간대별 조건을 설명 가능한 점수·등급·이유로 평가하고
최적 관측 시간을 선택하는 기능과 통합 관측 API를 구현했습니다. Milestone 종료
전 GitHub Actions 검증이 남아 있습니다.

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
