# StellaAtlas

> Your Personal Atlas of the Night Sky

StellaAtlas는 날씨와 천문 데이터를 이해하기 쉬운 관측 정보로 변환하여
사용자가 오늘 밤 별을 관측하기 좋은지 판단하도록 돕는 웹 서비스입니다.

현재 저장소는 **Milestone 1 — Backend Foundation** 단계입니다. Spring Boot
백엔드 기반은 구현되었으며 제품 기능은 아직 구현하지 않았습니다.

## Technology

| Area | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5.x, Gradle |
| Frontend | Node.js 22 LTS, Next.js, TypeScript, Tailwind CSS |
| Database | PostgreSQL 17, Flyway |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

## Repository

```text
stella-atlas/
├── .github/       # GitHub Actions와 협업 템플릿
├── backend/       # Spring Boot 애플리케이션
├── frontend/      # Milestone 2에서 초기화할 Next.js 애플리케이션
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
- Node.js 22 LTS (Milestone 2부터 필요)

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

프런트엔드 실행·검증 명령은 Milestone 2에서 모듈을 초기화할 때 추가합니다.
존재하지 않는 스크립트는 실행하지 않습니다.

## Documentation

- [Vision](docs/VISION.md)
- [Product Specification](docs/PRODUCT.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Coding Standards](docs/CODING_STANDARDS.md)
- [API Guidelines](docs/API.md)
- [Observation Score](docs/OBSERVATION_SCORE.md)
- [Architecture Decisions](docs/DECISIONS.md)
- [Contributing](CONTRIBUTING.md)

## Contribution

`main`에서 작업 브랜치를 만든 뒤 하나의 명확한 작업 단위로 변경하고 Pull
Request를 생성합니다. 브랜치명, 커밋 형식, 검증 및 PR 요구사항은
[CONTRIBUTING.md](CONTRIBUTING.md)를 따릅니다.

## License

라이선스는 아직 확정되지 않았습니다. 공개 배포 전 승인된 라이선스로
교체하거나 비공개 소프트웨어임을 명시해야 합니다.
