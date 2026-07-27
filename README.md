# Stella Atlas

> 내 위치에서 오늘 밤 별을 보기 좋은 시간과 관측 조건을 알려주는 웹 서비스

Stella Atlas는 사용자의 위치와 날짜를 기준으로 날씨, 박명, 달의 밝기, 관측 가능 시간대를 종합하여  
**“오늘 별을 보러 나가도 되는지”**를 이해하기 쉽게 안내하는 천체관측 웹 서비스입니다.

이 프로젝트는 바이브 코딩 실습에서 시작하지만, 실제 사용자가 접근할 수 있는 공개 서비스로 성장시키는 것을 목표로 합니다.

---

## 1. Project Vision

천체관측에 관심을 갖기 시작한 사람은 보통 다음 질문에서 막힙니다.

- 오늘 별이 잘 보일까?
- 몇 시에 나가야 할까?
- 구름이 조금 있는데 관측해도 될까?
- 달이 밝으면 별이 잘 안 보이나?
- 지금 내 위치에서 무엇을 볼 수 있을까?
- 초보자가 보기 쉬운 천체는 무엇일까?

일반적인 날씨 서비스는 기온과 강수 여부는 알려주지만,  
그 정보가 천체관측에 어떤 영향을 주는지는 설명하지 않습니다.

Stella Atlas는 날씨와 천문 데이터를 단순히 나열하지 않고,  
이를 **천체관측 관점에서 해석해 주는 서비스**를 지향합니다.

---

## 2. Product Statement

### 한 문장 설명

> 사용자의 위치에서 오늘 밤 별을 보기 좋은 시간과 관측 조건을 알려준다.

### 핵심 가치

1. **빠른 판단**  
   사용자가 몇 초 안에 오늘 관측 가능 여부를 판단할 수 있어야 합니다.

2. **쉬운 설명**  
   구름량, 습도, 달 밝기와 같은 수치를 초보자도 이해할 수 있게 설명합니다.

3. **투명한 점수**  
   관측 점수의 계산 요소와 감점 이유를 숨기지 않습니다.

4. **점진적 확장**  
   초기에는 관측 조건 안내에 집중하고, 이후 천체 추천과 관측 기록 기능으로 확장합니다.

---

## 3. Target Users

### Primary

- 천체관측에 관심은 있지만 전문 지식이 부족한 초보자
- 별을 보러 갈지 말지 빠르게 판단하고 싶은 사용자
- 쌍안경 또는 입문용 망원경을 가진 사용자
- 천체사진 촬영을 처음 시작하는 사용자

### Secondary

- 관측 장소별 상태를 비교하려는 아마추어 관측자
- 여행지에서 별을 볼 수 있는지 확인하려는 사용자
- 관측 기록을 남기고 싶은 사용자

---

## 4. MVP Scope

첫 번째 공개 버전의 목표는 아래 질문에 정확하고 빠르게 답하는 것입니다.

> “내 위치에서 오늘 밤 언제 별을 보는 것이 가장 좋은가?”

### MVP Features

- 현재 위치 또는 지역 검색
- 날짜 선택
- 시간대별 관측 환경 조회
  - 구름량
  - 강수 확률
  - 습도
  - 가시거리
  - 풍속
  - 기온
- 천문 기본 정보
  - 일몰
  - 시민박명 종료
  - 항해박명 종료
  - 천문박명 종료
  - 월출 및 월몰
  - 달의 위상
  - 달 밝기
- 시간대별 관측 점수
- 최적 관측 시간 추천
- 관측 조건 설명
- 모바일 반응형 UI

### MVP Non-Goals

초기 버전에서는 아래 기능을 구현하지 않습니다.

- 실시간 망원경 제어
- 천체사진 자동 판별
- 고급 천체 궤도 계산
- SNS 수준의 커뮤니티
- 실시간 채팅
- 장비 거래
- 복잡한 유료 구독
- 초기 단계의 마이크로서비스 분리

---

## 5. Recommended Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- TanStack Query
- Zod
- Playwright

### Backend

- Java 21
- Spring Boot
- Gradle
- Spring Web
- Spring Validation
- Spring Data JPA
- Spring Security
- OAuth 2.0
- WebClient
- Flyway
- Caffeine Cache
- JUnit 5
- Testcontainers

### Data

- PostgreSQL
- Redis는 실제 필요성이 확인될 때 도입

### Infrastructure

- Docker
- Docker Compose
- GitHub Actions
- Frontend: Vercel 또는 동등한 정적/서버리스 플랫폼
- Backend: 컨테이너 기반 배포 플랫폼
- Database: 관리형 PostgreSQL
- Monitoring: Sentry 및 애플리케이션 메트릭

### Optional Astronomy Engine

천문 좌표 계산이나 외부 천문 카탈로그 연동이 Java에서 과도하게 복잡해질 경우에만 추가합니다.

- Python
- FastAPI
- Astropy
- Astroquery

MVP에서는 Python 서비스를 도입하지 않습니다.

---

## 6. System Overview

```text
┌──────────────────────────┐
│        Web Browser       │
│      Next.js Client      │
└─────────────┬────────────┘
              │ HTTPS / JSON
┌─────────────▼────────────┐
│     Spring Boot API      │
│                          │
│ - Observation Scoring    │
│ - Weather Integration    │
│ - Astronomy Integration  │
│ - Location Management    │
│ - User / Record Domain   │
└───────┬──────────┬───────┘
        │          │
        │          └──────────────┐
┌───────▼────────┐       ┌────────▼────────┐
│   PostgreSQL   │       │ External APIs   │
│                │       │ Weather / Astro │
└────────────────┘       └─────────────────┘
```

---

## 7. Repository Structure

```text
stella-atlas/
├── README.md
├── AGENTS.md
├── LICENSE
├── .editorconfig
├── .gitattributes
├── .gitignore
├── docker-compose.yml
│
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DECISIONS.md
│
├── backend/
│   ├── build.gradle
│   └── src/
│
├── frontend/
│   ├── package.json
│   └── src/
│
├── docker/
│
└── .github/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    └── workflows/
```

---

## 8. Backend Package Structure

백엔드는 계층 중심 구조보다 기능 중심 구조를 사용합니다.

```text
com.example.stellaatlas
├── observation
│   ├── api
│   ├── application
│   ├── domain
│   └── infrastructure
├── weather
├── astronomy
├── location
├── user
├── record
└── common
```

### Package Responsibilities

- `observation`: 관측 점수와 추천 결과
- `weather`: 외부 날씨 API 연동 및 내부 날씨 모델
- `astronomy`: 박명, 달, 천체 관련 데이터
- `location`: 좌표, 지역 검색, 저장된 장소
- `user`: 사용자와 인증
- `record`: 관측 기록
- `common`: 공통 예외, 시간, 응답, 설정

`common`은 모든 코드를 몰아넣는 공간으로 사용하지 않습니다.

---

## 9. Local Development

### Prerequisites

- Java 21
- Node.js LTS
- Docker Desktop
- IntelliJ IDEA Ultimate
- Git

### Start Infrastructure

```bash
docker compose up -d
```

### Backend

```bash
cd backend
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Test

```bash
cd backend
./gradlew test
```

```bash
cd frontend
npm test
npm run lint
```

---

## 10. Environment Variables

실제 키와 비밀번호는 저장소에 커밋하지 않습니다.

```bash
# Backend
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
WEATHER_API_BASE_URL=
WEATHER_API_KEY=
ASTRONOMY_API_BASE_URL=

# Frontend
NEXT_PUBLIC_API_BASE_URL=
```

저장소에는 `.env.example`만 포함합니다.

---

## 11. Development Principles

1. 작은 단위로 구현합니다.
2. 외부 API 응답과 내부 도메인 모델을 분리합니다.
3. 핵심 계산 로직은 프레임워크에 의존하지 않게 작성합니다.
4. 시간과 타임존을 명시적으로 처리합니다.
5. 관측 점수의 계산 근거를 테스트합니다.
6. 새 의존성은 도입 이유가 명확해야 합니다.
7. 실제 필요성이 확인되기 전에는 마이크로서비스를 도입하지 않습니다.
8. Codex가 만든 코드도 사람이 이해하고 검증할 수 있어야 합니다.

---

## 12. Roadmap

### Milestone 0 — Foundation

- [ ] 저장소 초기화
- [ ] Spring Boot 프로젝트 생성
- [ ] Next.js 프로젝트 생성
- [ ] PostgreSQL 및 Docker Compose 구성
- [ ] CI 기본 구성
- [ ] 공통 코드 스타일 설정

### Milestone 1 — Observation Conditions

- [ ] 위치 입력
- [ ] 날씨 API 연동
- [ ] 시간대별 관측 데이터
- [ ] 관측 점수 계산
- [ ] 결과 화면

### Milestone 2 — Astronomy Information

- [ ] 일몰 및 박명 정보
- [ ] 월출 및 월몰
- [ ] 달의 위상과 밝기
- [ ] 최적 관측 시간 추천
- [ ] 기본 천체 추천

### Milestone 3 — User Features

- [ ] OAuth 로그인
- [ ] 관측 장소 저장
- [ ] 관심 천체 저장
- [ ] 관측 기록

### Milestone 4 — Public Release

- [ ] 운영 배포
- [ ] 도메인 연결
- [ ] HTTPS
- [ ] 모니터링
- [ ] 개인정보처리방침
- [ ] 이용약관
- [ ] 검색엔진 메타데이터

---

## 13. Documentation

- [Product Specification](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Guidelines](docs/API.md)
- [Architecture Decisions](docs/DECISIONS.md)
- [Codex and Agent Instructions](AGENTS.md)

---

## 14. Contribution Workflow

1. Issue 또는 작업 목표를 정의합니다.
2. 변경 범위를 작게 유지합니다.
3. 구현 전에 관련 문서를 읽습니다.
4. 테스트를 작성하거나 기존 테스트를 갱신합니다.
5. 로컬에서 테스트와 린트를 실행합니다.
6. Pull Request에 변경 이유와 검증 결과를 작성합니다.

---

## 15. License

프로젝트 공개 범위와 배포 정책을 확정한 뒤 라이선스를 선택합니다.

현재 `LICENSE` 파일은 임시 안내 문구이며,  
오픈소스로 공개할 경우 MIT, Apache-2.0 등 적절한 라이선스로 교체해야 합니다.
