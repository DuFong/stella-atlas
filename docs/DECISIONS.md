# Architecture Decision Records

이 문서는 Stella Atlas의 주요 기술 및 제품 결정을 기록합니다.

각 결정은 변경될 수 있지만, 변경 시 기존 결정을 삭제하지 않고 새로운 ADR을 추가합니다.

---

## ADR-001 — Spring Boot as Main Backend

- Status: Accepted
- Date: 2026-07-27

### Context

프로젝트는 실제 공개 가능한 웹 서비스를 목표로 하며, 외부 API 연동, 사용자 기능, 데이터베이스, 보안, 테스트가 필요합니다.

### Decision

Java와 Spring Boot를 메인 백엔드로 사용합니다.

### Reasons

- 개발자의 기존 경험
- 강력한 웹 및 데이터 생태계
- 장기 운영 적합성
- 명확한 테스트와 구조
- IntelliJ Ultimate와의 좋은 통합

### Consequences

- Python 천문 라이브러리를 직접 활용하기 어렵습니다.
- 복잡한 천문 계산이 필요해질 경우 별도 Python 컴포넌트를 고려합니다.

---

## ADR-002 — Next.js as Frontend

- Status: Accepted
- Date: 2026-07-27

### Context

모바일 중심 사용자 경험, 반응형 UI, 추후 SEO와 공개 서비스 운영이 필요합니다.

### Decision

Next.js와 TypeScript를 프론트엔드로 사용합니다.

### Consequences

- 프론트엔드와 백엔드가 분리됩니다.
- API 계약과 CORS 관리가 필요합니다.
- 프론트엔드 생태계 학습 비용이 발생합니다.

---

## ADR-003 — Modular Monolith First

- Status: Accepted
- Date: 2026-07-27

### Decision

MVP는 하나의 Spring Boot 애플리케이션으로 개발합니다.

### Reasons

- 빠른 개발
- 단순한 배포
- 낮은 운영 비용
- 도메인 경계 실험 가능
- 분산 시스템 복잡성 회피

### Consequences

- 기능 간 경계를 패키지와 의존성 규칙으로 유지해야 합니다.
- 마이크로서비스 분리는 실제 필요성이 생긴 뒤 검토합니다.

---

## ADR-004 — Feature-Based Package Structure

- Status: Accepted
- Date: 2026-07-27

### Decision

`controller`, `service`, `repository` 기준의 전역 계층 구조가 아니라  
`observation`, `weather`, `astronomy`, `location` 같은 기능 중심 구조를 사용합니다.

### Reasons

- 변경 범위 파악이 쉬움
- 도메인 응집도 향상
- Codex가 기능 맥락을 이해하기 쉬움
- 서비스 확장 시 유지보수 용이

---

## ADR-005 — Rule-Based Observation Score

- Status: Accepted
- Date: 2026-07-27

### Context

초기에는 충분한 사용자 데이터가 없으며, 점수 근거를 설명할 수 있어야 합니다.

### Decision

MVP 관측 점수는 규칙 기반으로 계산합니다.

### Principles

- 범위 0~100
- 모든 영향 요소 설명 가능
- 각 규칙 독립 테스트
- 임계값 조정 가능
- 점수 이유 목록 반환

### Rejected Alternative

머신러닝 기반 점수는 초기 데이터 부족과 설명 가능성 문제로 제외합니다.

---

## ADR-006 — PostgreSQL

- Status: Accepted
- Date: 2026-07-27

### Decision

주 데이터베이스로 PostgreSQL을 사용합니다.

### Reasons

- 안정성
- 풍부한 기능
- 관리형 서비스 선택지
- 위치 데이터 확장 가능성
- Spring 생태계 호환

---

## ADR-007 — Flyway for Schema Migration

- Status: Accepted
- Date: 2026-07-27

### Decision

데이터베이스 스키마 변경은 Flyway로 관리합니다.

### Rules

- 운영 환경에서 자동 DDL 수정에 의존하지 않음
- 이미 배포된 마이그레이션 수정 금지
- 변경은 새 버전 파일로 추가

---

## ADR-008 — Python Service Deferred

- Status: Accepted
- Date: 2026-07-27

### Decision

MVP에서는 FastAPI 또는 Astropy 기반 별도 서비스를 만들지 않습니다.

### Revisit Conditions

- 복잡한 천체 좌표 계산
- Astroquery 핵심 의존
- 이미지 분석
- 독립적인 계산 확장 필요
- Java 구현 비용이 과도함

---

## ADR-009 — Public Core Without Login

- Status: Accepted
- Date: 2026-07-27

### Decision

핵심 관측 조건 조회는 로그인 없이 제공합니다.

로그인은 장소 저장과 관측 기록 기능에서 도입합니다.

### Reasons

- 초기 진입 장벽 최소화
- 핵심 가치 빠른 검증
- 인증 구현보다 서비스 유용성 우선

---

## ADR-010 — Monorepo

- Status: Accepted
- Date: 2026-07-27

### Decision

Frontend, Backend, Docs, Infrastructure를 하나의 Git 저장소에서 관리합니다.

### Reasons

- 초기 개발 단순화
- API와 문서 변경 동기화
- Codex에 전체 문맥 제공
- 통합 이슈 추적

### Consequences

- CI 작업을 경로 기반으로 분리해야 합니다.
- 저장소가 커지면 구조 재검토가 필요할 수 있습니다.

---

## ADR-011 — Frontend Foundation Versions and Dependency Auditing

- Status: Accepted
- Date: 2026-07-28

### Context

Milestone 2에는 재현 가능한 Node.js와 Next.js 버전, 테스트 및 정적 검증 기반이
필요합니다. 초기 스캐폴딩 의존성에서는 PostCSS, Sharp와 glob 처리 라이브러리에
대한 보안 경고가 확인되었습니다.

### Decision

- Node.js 22.23.1과 Next.js 16.2.12를 고정합니다.
- App Router, TypeScript strict mode와 Tailwind CSS 4를 사용합니다.
- Vitest와 Testing Library로 동기 Server Component와 Client Component의
  단위 테스트를 작성합니다.
- npm lockfile을 커밋하고 CI에서는 `npm ci`를 사용합니다.
- 직접 업그레이드할 수 없는 전이 의존성은 호환되는 보안 수정 버전으로
  `overrides`하고 lint, test와 production build로 호환성을 검증합니다.

### Consequences

- Node.js 22.x가 로컬 프런트엔드 개발의 필수 조건입니다.
- Next.js 또는 상위 도구가 수정 의존성을 직접 포함하면 `overrides`를
  재검토하고 불필요한 항목을 제거해야 합니다.
- async Server Component는 Vitest 대신 향후 E2E 테스트로 검증합니다.

---

## ADR-012 — Milestone Identifiers in Git History

- Status: Accepted
- Date: 2026-07-29

### Context

마일스톤 중심으로 개발하지만 브랜치, 커밋과 Pull Request 제목만으로는 작업이
어느 마일스톤에 속하는지 빠르게 식별하기 어렵습니다. Conventional Commits와
기존 소문자 브랜치 규칙도 계속 유지해야 합니다.

### Decision

- 마일스톤 작업 브랜치는 접두사 바로 뒤에 소문자 `m<number>`를 사용합니다.
  예: `feature/m3-weather-integration`
- 커밋과 Pull Request 제목은 Conventional Commit의 콜론 뒤에 대문자
  `[M<number>]`를 사용합니다.
  예: `feat(weather): [M3] add weather forecast provider interface`
- 여러 마일스톤에 걸친 유지보수 작업은 별도 합의가 없다면 현재 활성
  마일스톤을 사용합니다.

### Consequences

- Git 기록과 브랜치 목록에서 마일스톤 범위를 바로 확인할 수 있습니다.
- 기존 Conventional Commit type과 optional scope를 유지하므로 자동화 도구와의
  호환성을 보존합니다.
- 마일스톤 전환 시 활성 마일스톤 문서와 새 작업 식별자를 함께 갱신해야 합니다.

---

## ADR-013 — Open-Meteo as the Initial Weather Provider

- Status: Accepted
- Date: 2026-07-29

### Context

Milestone 3에는 온도, 구름량, 강수 확률, 습도, 가시거리와 풍속을 시간대별로
제공하는 첫 날씨 공급자가 필요합니다. 공급자 모델이 domain과 application
계층에 노출되지 않아야 하고, 날짜·타임존·단위를 명시적으로 처리해야 합니다.

### Decision

- 첫 날씨 공급자로 Open-Meteo Forecast API를 사용합니다.
- `WeatherProvider`를 domain port로 두고 Open-Meteo DTO와 HTTP 처리는
  infrastructure Adapter에 격리합니다.
- 공급자에는 섭씨, m/s, UNIX epoch seconds와 좌표 기반 자동 timezone을
  명시적으로 요청합니다.
- Spring `RestClient`와 설정 가능한 연결·응답 타임아웃을 사용합니다.
- 동일한 `WeatherForecastQuery` 결과는 제한된 TTL과 최대 크기를 갖는 Caffeine
  인메모리 캐시에 보관합니다.
- 공급자 연결 실패, 5xx와 호출 제한은 `WEATHER_PROVIDER_UNAVAILABLE`로,
  거부되거나 유효하지 않은 응답은 `EXTERNAL_PROVIDER_ERROR`로 변환합니다.

### Reasons

- 필수 시간대별 필드를 하나의 API에서 제공합니다.
- 전 세계 좌표를 지원하고 위치에 적합한 기상 모델을 자동 선택합니다.
- API key 없이 개발과 비상업적 평가를 시작할 수 있습니다.
- 상용 endpoint와 self-hosted 서버가 동일한 API 계약을 제공해 Adapter를
  유지한 채 운영 방식을 변경할 수 있습니다.

### Consequences

- 무료 endpoint는 비상업적 개발·평가에만 사용하고 호출 제한을 지켜야 합니다.
- 상용 배포 전 유료 endpoint와 API key 또는 self-hosting 중 하나를 결정해야
  합니다.
- Open-Meteo와 원 데이터 공급자에 필요한 출처 표기를 사용자 화면에 추가해야
  합니다.
- 무료 서비스는 가용성 보장이 없으므로 타임아웃, 오류 변환과 캐시를 유지합니다.

---

## ADR-014 — Offline Astronomy Calculation and Coordinate Timezones

- Status: Accepted
- Date: 2026-07-29

### Context

Milestone 4에는 좌표와 로컬 날짜를 기준으로 일몰, 세 종류의 박명, 월출·월몰,
달의 위상과 조도를 결정적으로 계산하는 기능이 필요합니다. 서버 기본 시간대나
공급자 API의 가용성에 의존해서는 안 되며, 극야·백야와 하루 안에 이벤트가 없는
경우를 명시적으로 표현해야 합니다.

### Decision

- 천문 계산은 `org.shredzone.commons:commons-suncalc:3.11`을 사용합니다.
- 좌표 기반 IANA 시간대 해석은 `net.iakovlev:timeshape:2026b.29`를 사용합니다.
- 두 라이브러리는 infrastructure Adapter에 격리하고 application과 domain은
  프로젝트가 정의한 `AstronomyCalculator`와 `TimeZoneResolver`만 의존합니다.
- 입력 날짜는 해석된 `ZoneId`의 실제 로컬 하루로 변환합니다. DST 전환일의
  23시간 또는 25시간 구간을 그대로 사용하며 계산 결과는 `Instant`로 보존합니다.
- 좌표가 둘 이상의 시간대 경계에 포함되면 Zone ID의 사전순 첫 항목을 선택해
  동일 입력의 결과를 결정적으로 유지합니다.
- 일몰이나 박명이 발생하지 않으면 `ALWAYS_ABOVE` 또는 `ALWAYS_BELOW`로
  표현하고 시간을 비워 둡니다. 월출·월몰이 로컬 하루에 없으면 해당 값을
  `Optional.empty()`로 보존합니다.
- 달의 위상과 조도는 관측일 로컬 정오의 위치 기반 값으로 대표합니다. 위상은
  `0.0`의 삭에서 `0.5`의 보름을 지나 다음 삭 직전 `1.0`으로 진행하는 비율이고,
  조도는 `0.0`에서 `1.0` 사이의 밝은 면 비율입니다.

### Reasons

- Commons SunCalc는 Java Time API를 직접 사용하며 필요한 태양·달 계산을 외부
  네트워크 없이 제공합니다.
- 약 1분 수준의 정확도는 관측 가능 여부와 추천 시간대를 판단하는 MVP 목적에
  충분합니다.
- TimeShape는 OpenStreetMap 기반 전 세계 시간대 경계를 애플리케이션 내부에서
  조회하며, 초기화 비용이 있으므로 Spring singleton으로 한 번만 생성합니다.

### Consequences

- 계산 결과는 정밀 천문 관측, 항법 또는 법적 증빙 용도로 사용하지 않습니다.
- 대기 굴절과 실제 지형 때문에 관측되는 일몰은 계산값과 다를 수 있습니다.
- 시간대 경계가 겹치는 위치의 사전순 선택은 결정적이지만 사용자의 행정구역
  의도와 다를 수 있어, 장소 검색 기능이 도입되면 명시적인 시간대 선택을
  우선하도록 재검토합니다.
- Commons SunCalc 코드는 Apache License 2.0, TimeShape 코드는 MIT License,
  포함된 시간대 경계 데이터는 ODbL 조건을 따릅니다.

---

## ADR-015 — Explainable Deduction-Based Observation Score

- Status: Accepted
- Date: 2026-07-29

### Context

Milestone 5에는 날씨와 천문 조건을 동일 입력에 대해 항상 같은 점수로 변환하고,
사용자가 결과의 이유를 이해할 수 있는 초기 정책이 필요합니다. 학습 데이터가
없는 상태에서 정밀도를 가장하는 복잡한 공식보다 경계와 영향을 검토할 수 있는
규칙이 우선입니다.

### Decision

- 각 시간대는 100점에서 시작하고 구름량, 강수 확률, 가시거리, 습도, 풍속,
  달빛과 박명의 독립 규칙이 감점을 적용합니다.
- 합산 결과는 0~100으로 제한하고 85/70/50을 `EXCELLENT`, `GOOD`, `FAIR`,
  `POOR` 등급 경계로 사용합니다.
- 점수가 70 이상이면서 천문박명이 끝난 `DARK` 시간만 추천합니다.
- 달빛은 달이 지평선 위에 있을 때만 조도에 따라 최대 12점을 감점합니다.
- 요청 날짜의 로컬 정오부터 다음 날 정오까지를 관측창으로 사용해 자정을 넘는
  밤을 하나의 조회로 평가합니다.
- 최적 구간은 추천 시간이 한 시간 간격으로 연속된 최대 구간입니다. 평균 점수,
  긴 지속시간, 빠른 시작 시각 순으로 결정적으로 선택합니다.
- 임계값과 영향도는 코드 상수와 `docs/OBSERVATION_SCORE.md`의 표, 경계 테스트를
  함께 변경합니다. 초기값은 운영 피드백과 실제 관측 결과가 쌓이면 재조정합니다.

### Consequences

- 점수는 기상·천문 조건의 설명 가능한 휴리스틱이며 관측 성공을 보장하지
  않습니다.
- 시작점이 100이므로 좋은 조건은 별도 가점보다 감점 없음으로 표현합니다.
- 달의 실제 고도 대신 월출·월몰로 지평선 위 여부를 판정하므로 낮은 고도의
  달빛 영향은 과대평가할 수 있습니다.
- 대기 투명도와 시상은 신뢰 가능한 입력 데이터와 검증 근거가 생길 때 별도
  규칙으로 추가합니다.

---

## ADR-016 — Google OIDC Login with Spring Security Session

- Status: Accepted
- Date: 2026-07-29

### Context

향후 저장 장소와 관측 기록에는 사용자 신원과 소유권 검증이 필요하지만, 핵심
관측 조회는 로그인 없이 유지해야 합니다. 자체 비밀번호 인증은 비밀번호 보관,
재설정과 검증 책임을 추가하며 초기 제품의 핵심 가치가 아닙니다.

### Decision

- Google OpenID Connect를 첫 로그인 provider로 선택합니다.
- Spring Security OAuth2 Client의 Authorization Code 로그인을 사용합니다.
- 인증 상태는 백엔드 HTTP session으로 유지합니다.
- Google client registration은 `oauth` Spring profile에서만 활성화하고 client
  ID와 secret은 환경변수로 주입합니다.
- `GET /api/v1/observations`는 공개로 유지하고
  `/api/v1/users/me/**`는 인증된 요청만 허용합니다.
- 상태 변경 요청의 CSRF 보호를 유지하며 token은 전용 API로 발급합니다.
- 외부 provider subject, OAuth token과 session identifier는 공개 API 응답에
  포함하지 않습니다.

### Consequences

- 사용자는 별도 StellaAtlas 비밀번호를 만들거나 관리하지 않습니다.
- 로컬 OAuth 테스트에는 Google OAuth client와 등록된 redirect URI가 필요합니다.
- 기본 세션 저장소는 단일 백엔드 인스턴스에 적합합니다. 다중 인스턴스 배포
  전에 Spring Session과 공유 저장소 또는 다른 인증 상태 전략을 결정해야 합니다.
- 프런트엔드는 로그인 redirect와 session cookie를 사용하고, 서버에서 사용자
  API를 호출할 때 요청 cookie를 전달해야 합니다.
- provider 계정을 내부 사용자 UUID에 연결하는 영속화는 저장 장소 API를
  구현하기 전에 추가합니다.
- Google Cloud OAuth 애플리케이션 등록과 실제 계정 연동은 Milestone 8에서
  진행하며, Milestone 6은 client·보안 경계와 UI 기반까지만 완료합니다.

---

## ADR-017 — Local-First Observation Posts with Replaceable Storage Ports

- Status: Accepted
- Date: 2026-08-05

### Context

Milestone 7에는 사진, 촬영 위치·시각, 코멘트와 해시태그를 담는 관측 게시물이
필요합니다. 아직 사진을 보관할 서버 object storage가 없고 실제 OAuth 사용자
영속화도 Milestone 8로 계획되어 있습니다. 사용자는 이미지의 EXIF 값으로 입력
부담을 줄이되 자동 입력값을 직접 수정할 수 있어야 합니다.

### Decision

- Milestone 7의 게시물 metadata와 이미지 Blob은 브라우저 IndexedDB에
  저장합니다. 용량과 검색에 부적합한 `localStorage`에는 이미지를 저장하지
  않습니다.
- 프런트엔드 application 계층에 게시물 repository와 media store port를 두고
  IndexedDB 코드는 infrastructure adapter에 격리합니다.
- 로컬 schema는 version을 가지며 게시물 metadata와 이미지 저장은 실패 시
  불완전한 게시물이 남지 않도록 하나의 트랜잭션 경계에서 처리합니다.
- EXIF GPS와 촬영 시각은 편집 가능한 초깃값으로만 사용합니다. 값이 없거나
  손상되었으면 비워 두고 추정하지 않습니다.
- 브라우저 카메라 캡처로 생성된 이미지에는 EXIF가 없을 수 있습니다. 촬영
  컨텍스트의 현재 시각과 별도 동의를 받은 브라우저 위치를 제안할 수 있으나
  출처를 표시하고 저장 전에 사용자가 확인할 수 있게 합니다.
- 로컬 데이터는 해당 origin과 브라우저 프로필에 종속되고 사용자가 브라우저
  데이터를 지우면 손실될 수 있음을 UI에 명시합니다.
- 서버 저장을 도입할 때 remote adapter, 미디어 업로드 계약과 명시적인 migration
  절차를 추가하며 IndexedDB schema를 서버 API 계약으로 취급하지 않습니다.

### Consequences

- 백엔드와 `application.yml` 변경 없이 로컬에서 게시물 기능을 검증할 수
  있습니다.
- 새로고침과 브라우저 재시작은 견디지만 기기 간 동기화와 백업은 제공하지
  않습니다.
- 브라우저별 quota, 사생활 보호 모드와 저장소 정리 정책 때문에 영구 보존을
  보장할 수 없습니다.
- GPS가 포함된 사진은 민감한 위치 정보를 가질 수 있으므로 저장 전에 값을
  노출하고 수정·삭제를 지원해야 합니다.
- EXIF parser는 MIT 라이선스의 `exifr:7.1.3`을 browser infrastructure adapter에
  격리했습니다. 읽을 수 없거나 손상된 metadata는 저장 실패로 취급하지 않고 빈
  초깃값으로 처리합니다.

---

## ADR-018 — Client-Side Planetarium Behind an Adapter

- Status: Superseded by ADR-019
- Date: 2026-08-05

### Context

Milestone 7에는 Stellarium 또는 Star Walk와 유사하게 선택한 위치와 시각의
밤하늘을 탐색하는 기능이 필요합니다. 현재 Commons SunCalc adapter는 태양·달과
박명 계산에는 적합하지만 별 카탈로그, 투영과 대화형 WebGL 렌더링 엔진은
제공하지 않습니다.

### Decision

- 시뮬레이션은 프런트엔드 Client Component에서 실행하고 플라네타리움 엔진을
  프로젝트가 정의한 adapter 뒤에 격리합니다.
- Milestone 7의 첫 구현 전에 짧은 기술 spike로 라이선스, 배포 방식, 번들 크기,
  원격 데이터 의존성, 모바일 성능, 접근성과 유지보수 상태를 검증합니다.
- Stellarium Web Engine은 WebGL/WASM 기반으로 웹에 임베드할 수 있는 후보지만
  AGPL-3.0 라이선스이므로 프로젝트 라이선스와 소스 제공 의무가 승인되기 전에는
  의존성이나 소스 코드를 포함하지 않습니다.
- Star Walk와 같은 상용 제품은 공개적으로 사용 가능한 embedding SDK와 이용
  조건이 확인된 경우에만 후보로 채택합니다.
- 엔진과 무관한 입력은 좌표, 명시적인 timezone의 시각, 시야 방향과 확대 수준으로
  유지합니다. UI는 WebGL 미지원과 초기화 실패의 대체 상태를 제공합니다.
- 자체 천체 카탈로그 API, 센서 기반 AR과 사진 분석은 Milestone 7에서 제외합니다.

### Consequences

- 현재 Spring Boot astronomy module과 `application.yml`을 변경하지 않고도
  시뮬레이터를 추가할 수 있습니다.
- 최종 엔진이 정해지기 전까지 구현 의존성, 정확한 asset hosting 방식과 보안
  헤더 변경은 미확정입니다.
- 엔진 교체 비용은 adapter에서 제한되지만 렌더링 기능 차이까지 완전히 숨길 수는
  없습니다.
- 선택한 엔진과 catalog의 라이선스, attribution과 네트워크 출처를
  `THIRD_PARTY_NOTICES.md`에 추가해야 합니다.

---

## ADR-019 — Astronomy Engine with a Project-Owned Canvas Renderer

- Status: Accepted
- Date: 2026-08-05

### Context

ADR-018에 따라 웹 플라네타리움 후보를 검증했습니다. Stellarium Web Engine은
AGPL-3.0 의무가 프로젝트의 미확정 배포 라이선스에 위험합니다. D3-Celestial의
코드는 BSD-3-Clause이지만 npm package가 D3 3.5.17에 고정되고 약 49MB의 source,
과거 배포본과 여러 catalog를 함께 포함합니다. 포함 데이터에는 Stellarium
sky-culture 파생 번역과 서로 다른 출처가 섞여 있어 코드 라이선스만으로 상업적
재배포 범위를 확정하기 어렵습니다.

### Decision

- D3-Celestial과 Stellarium Web Engine을 의존성으로 추가하지 않습니다.
- MIT 라이선스의 `astronomy-engine:2.1.19`를 프런트엔드 계산 엔진으로 사용합니다.
- `PlanetariumEngine` port가 위치·절대 시각을 `PlanetariumScene`으로 변환하며,
  Astronomy Engine adapter가 태양·달·주요 행성과 별의 지평 좌표를 계산합니다.
- StellaAtlas가 소유하는 Canvas 2D renderer가 scene을 화면에 투영합니다. UI는
  시간 이동, 방향 회전, 확대·축소, 현재 위치 입력과 텍스트 천체 목록을
  제공합니다.
- 초기 별 catalog는 밝은 별과 오리온자리, 큰곰자리, 여름철 대삼각형에 필요한
  작은 J2000 좌표 목록으로 제한합니다. 대규모 catalog나 sky-culture data는
  출처와 재배포 조건을 별도 승인한 뒤 추가합니다.
- 시뮬레이션 시각은 브라우저의 IANA 로컬 시간대로 표시·입력하고 절대 시각으로
  변환해 서버 설정 없이 브라우저에서 계산합니다.

### Consequences

- AGPL/GPL 코드 결합 없이 상업 서비스 가능성을 유지합니다.
- 전체 Stellarium 기능보다 작은 관측 보조용 2D 하늘 지도에 집중합니다.
- 사실적인 대기, 고해상도 행성 texture, 전체 별자리 문화와 대규모 deep-sky
  catalog는 제공하지 않습니다.
- 렌더러와 catalog의 정확도, 모바일 성능과 접근성을 프로젝트가 직접 검증하고
  유지해야 합니다.
- 백엔드와 `application.yml` 변경은 필요하지 않습니다.

---

## ADR-020 — Stable Internal Users Separated from OAuth Identities

- Status: Accepted
- Date: 2026-08-24

### Context

Milestone 8의 즐겨찾기 위치, 최근 조회 위치와 서버 관측 기록은 provider에
종속되지 않는 안정적인 소유자 식별자가 필요합니다. Google의 OIDC `sub`는 해당
provider 안에서는 안정적이지만 내부 리소스의 공개 또는 영속 식별자로 직접
사용하면 provider 교체와 계정 연결 확장이 어려워집니다.

### Decision

- 내부 사용자는 애플리케이션이 생성한 UUID로 식별합니다.
- `user_account`는 내부 UUID와 최신 표시 이름, 이메일, 사진 URL 및 생성·수정
  시각을 저장합니다.
- `oauth_identity`는 `(provider, provider_subject)`와 내부 사용자 UUID의 연결을
  저장하며 두 외부 식별자의 조합을 유일하게 제한합니다.
- Google 로그인 성공 시 identity가 없으면 내부 사용자를 생성하고, 이미 있으면
  같은 UUID를 재사용하면서 변경 가능한 프로필 claim만 갱신합니다.
- 외부 subject, 내부 UUID, access token과 session identifier는 현재 사용자 공개
  응답에 포함하지 않습니다.
- OAuth access token과 refresh token은 현재 기능에 필요하지 않으므로 데이터베이스에
  저장하지 않습니다.

### Consequences

- 사용자 소유 리소스는 Google subject 대신 내부 UUID를 foreign key로 참조할 수
  있습니다.
- 같은 provider identity가 중복 내부 사용자로 연결되는 것을 데이터베이스
  constraint가 방지합니다.
- 여러 provider 계정 연결, 계정 병합과 탈퇴·보존 정책은 별도 사용자 흐름과
  정책이 승인될 때 추가해야 합니다.

---

## ADR-021 — Opt-In Recent Locations and Metadata-Only Server Records

- Status: Accepted
- Date: 2026-08-24

### Context

Milestone 8은 로그인 사용자가 위치와 관측 기록을 기기 밖에서도 다시 사용할 수
있어야 합니다. 하지만 조회 좌표는 민감한 위치정보이고, Milestone 7 사진을
서버에 올리려면 object storage, 파일 검사, 삭제와 로컬 이전 정책이 먼저
필요합니다.

### Decision

- 관측 조회는 기본적으로 위치를 저장하지 않고, 인증 사용자가
  `rememberLocation=true`에 명시적으로 동의한 성공 조회만 최근 위치로 기록합니다.
- 최근 좌표는 소수점 이하 4자리로 반올림하고 동일 좌표를 갱신하며 사용자별
  최신 10개만 유지합니다. 목록에 내부 ID를 노출하지 않고 전체 삭제를 제공합니다.
- 즐겨찾기는 사용자가 이름과 저장 동작을 명시한 정확한 6자리 좌표를 유지합니다.
- 서버 관측 기록은 관측 시각, IANA timezone, 선택적 6자리 좌표와 최대 500자
  코멘트만 저장합니다. 해시태그는 코멘트에서 결정적으로 파싱합니다.
- 서버 response의 `mediaStatus`는 `NOT_ATTACHED`로 고정합니다. 사진 업로드와
  로컬 IndexedDB 게시물 자동 이전은 구현하지 않습니다.
- 최근 위치와 관측 기록의 모든 persistence query는 내부 owner UUID를 조건으로
  사용하며 다른 사용자의 리소스 존재 여부를 숨깁니다.

### Consequences

- 로그인하지 않거나 체크하지 않은 관측 조회는 서버에 새 위치정보를 남기지
  않습니다.
- 최근 위치는 재사용성보다 데이터 최소화를 우선해 약 11m 수준으로 축소됩니다.
- 사용자는 최근 위치 전체와 개별 서버 기록을 직접 삭제할 수 있습니다.
- 계정 관측 메타데이터는 기기 간 사용할 수 있지만 로컬 사진의 백업이나 동기화로
  오해하면 안 됩니다.
- 서버 미디어 도입 시 별도의 API, object storage, 검증·보존·삭제와 명시적인
  migration 결정을 추가해야 합니다.

---

## ADR-022 — Immersive Planetarium Before Deployment

- Status: Accepted
- Date: 2026-08-24

### Context

Milestone 7의 Canvas 2D 천구 지도는 좌표와 시각에 따른 천체 위치를 정확하고
결정적으로 표시하지만, 별·달·행성을 실제 하늘처럼 구분하고 원하는 천체를
찾기에는 시각적 단서와 상호작용이 부족합니다. 운영 배포보다 핵심 관측 경험의
식별성을 먼저 개선할 필요가 있습니다.

Stellarium Web Engine은 WebGL renderer, 대기, Gaia 별 catalog, HiPS, 행성
texture, 별자리와 landscape를 제공해 목표 경험에 가깝지만 AGPL-3.0입니다.
WorldWide Telescope의 WebGL engine은 MIT 기반이지만 연구 영상과 Vue/Pinia를
포함한 넓은 생태계여서 StellaAtlas의 Next.js UI에 필요한 통합 범위를 검증해야
합니다. Three.js는 MIT 기반의 범용 renderer여서 기존 domain port를 보존하기
쉽지만 천문 투영과 모든 시각 asset·최적화를 프로젝트가 책임져야 합니다.

### Decision

- 기존 Deployment 마일스톤을 Milestone 10으로 이동하고 Milestone 9를
  `Immersive Planetarium`으로 정의합니다.
- Milestone 9는 dependency를 먼저 선택하지 않고 동일 시나리오의 작은 prototype
  세 개를 비교하는 technology spike로 시작합니다.
- 후보는 Stellarium Web Engine, WorldWide Telescope WebGL engine, Three.js 기반
  프로젝트 renderer입니다.
- 비교 기준은 천체 식별성, observer-centered navigation, 번들·network data,
  초기 로딩, 지속 frame time, memory, mobile input, 접근성 fallback, Next.js
  통합 비용, 유지보수와 전체 asset license입니다.
- `PlanetariumEngine`과 Astronomy Engine adapter는 천체 계산의 source of truth로
  유지합니다. renderer가 천체 위치를 독립적으로 다시 계산하지 않습니다.
- AGPL renderer는 프로젝트 라이선스, network 사용 시 source 제공 의무와 배포
  방식을 명시적으로 승인하기 전에는 제품 dependency로 채택하지 않습니다.
- 최종 renderer 선택, 성능 예산과 catalog·texture 배포 방식은 spike 결과를 담은
  후속 ADR에서 확정합니다.

### Consequences

- 운영 배포는 한 마일스톤 늦어지지만 핵심 사용 경험을 배포 전에 검증할 수
  있습니다.
- 현재 Canvas 2D renderer는 spike와 fallback의 비교 기준으로 유지됩니다.
- 계산 port와 renderer lifecycle을 분리하므로 후보를 교체해도 관측 위치·시각
  계약과 기존 결정성 테스트를 재사용할 수 있습니다.
- 사실적인 표현에는 catalog와 texture가 필요하므로 코드 라이선스만이 아니라
  데이터 출처, attribution, CDN·self-hosting과 offline 동작까지 검토해야 합니다.
- 성능 수치는 임의로 정하지 않고 대표 desktop·mobile prototype 측정 후
  확정합니다.

### Primary References

- Stellarium Web Engine repository and AGPL-3.0 license:
  <https://github.com/Stellarium/stellarium-web-engine>
- WorldWide Telescope WebGL engine and MIT license:
  <https://github.com/WorldWideTelescope/wwt-webgl-engine>
- Three.js WebGL documentation and MIT license:
  <https://threejs.org/docs/pages/WebGL.html>
  <https://github.com/mrdoob/three.js/blob/dev/LICENSE>

---

## ADR-023 — Project-Owned Three.js Planetarium Renderer

- Status: Accepted
- Date: 2026-09-15

### Context

ADR-022는 M9 renderer 후보로 Stellarium Web Engine, WorldWide Telescope와
Three.js 기반 프로젝트 renderer를 제시했습니다. Stellarium Web Engine의
AGPL-3.0 source 제공 의무는 현재 프로젝트 배포 정책과 맞지 않습니다.
WorldWide Telescope는 MIT이지만 survey imagery, 연구 data layer와 자체
ephemeris를 포함한 범용 천문 시각화 플랫폼입니다. React/Next.js에서 저수준
singleton engine 또는 Vue/Pinia wrapper를 통합해야 하고, 기존 Astronomy Engine을
천체 위치의 source of truth로 유지하기 어렵습니다.

### Decision

- M9 renderer는 MIT 라이선스의 `three:0.186.0`을 WebGL 2 기반으로 사용하고
  플라네타리움 scene, interaction과 shader는 StellaAtlas가 소유합니다.
- React Three Fiber는 도입하지 않습니다. imperative renderer adapter가 Three.js
  scene, GPU resource와 lifecycle을 관리하고 React는 입력과 접근 가능한 UI
  state만 관리합니다.
- 기존 `PlanetariumEngine`과 Astronomy Engine adapter가 천체 위치 계산의 유일한
  기준입니다. renderer는 고도·방위를 observer-space vector로 투영만 합니다.
- 별과 태양계 천체는 하나의 point buffer와 shader에서 크기·색상을 표현하고,
  별자리와 지평선은 별도의 line buffer로 렌더링합니다.
- WebGL 2 초기화 또는 context 유지에 실패하면 기존 Canvas 2D renderer와 텍스트
  천체 목록을 fallback으로 유지합니다.
- 모바일 방향 센서는 renderer와 분리한 interaction adapter에서만 처리합니다.
  전체화면의 사용자 조작으로 권한을 요청하고 첫 자세를 현재 view의 상대 기준으로
  사용하며, 전체화면 종료 시 센서 listener를 해제합니다.
- catalog, texture와 landscape는 renderer dependency와 별도로 출처·재배포 조건을
  승인한 뒤 추가합니다.

### Consequences

- WorldWide Telescope와 Stellarium Web Engine의 UI, catalog, asset과 천문 계산에
  결합되지 않고 현재 domain 계약을 유지할 수 있습니다.
- 투영, label 배치, picking, shader, mobile 최적화와 GPU resource 해제는 프로젝트가
  직접 구현하고 검증해야 합니다.
- Three.js의 현재 `WebGLRenderer`가 WebGL 2만 지원하므로 Canvas fallback은 제품
  기능으로 계속 유지합니다.
- 방향 센서 탐색에는 HTTPS와 사용자 권한이 필요하고 절대 나침반의 환경별 오차에
  의존하지 않도록 사용자가 재보정할 수 있는 상대 방향 추적을 기본으로 합니다.
- WebGPU는 M9의 초기 renderer 범위에 포함하지 않고 WebGL 2 성능 측정 후 별도
  결정합니다.

### Primary References

- Three.js `WebGLRenderer`: <https://threejs.org/docs/pages/WebGLRenderer.html>
- Three.js license: <https://github.com/mrdoob/three.js/blob/dev/LICENSE>

---

## ADR-024 — Frontend Security Patch Versions During M9

- Status: Accepted
- Date: 2026-09-15

### Context

Three.js 설치 후 전체 dependency audit에서 기존 Next.js 16.2.12와 Sharp 0.35.3에
critical/high advisory가 확인됐고 js-yaml 4.3.1과 Vitest 4.1.10에도 수정 가능한
advisory가 확인됐습니다. Three.js 자체에서는 알려진 취약점이 보고되지 않았습니다.

### Decision

- Next.js와 `eslint-config-next`를 16.3.5, Vitest를 4.1.11로 갱신합니다.
- 기존 transitive override의 Sharp를 0.35.4, js-yaml을 4.3.2로 갱신합니다.
- Next.js가 route module export를 엄격하게 검증하므로 `HomeContent`를 `page.tsx`의
  named export에서 observation feature component로 이동합니다.

### Consequences

- `npm audit --audit-level=high`가 알려진 취약점 없이 통과합니다.
- 홈 route는 data orchestration만 담당하고 표현 component는 feature package에
  위치해 App Router 계약과도 일치합니다.
- 다음 dependency 변경에서도 audit 결과와 production build를 함께 검증합니다.

---

## ADR-025 — Procedural Planetarium Assets and Adaptive Quality

- Status: Accepted
- Date: 2026-09-17

### Context

M9 완료에는 은하수, 대기·박명, 지상 단서, 천체 label과 구분 가능한 태양계
표현이 필요합니다. 외부 texture와 landscape를 추가하면 network 비용과 배포
라이선스가 늘어나며, 작은 bright-object catalog에서 고해상도 asset은 초기
경험에 비해 비용이 큽니다. 모바일에서는 device pixel ratio와 label draw call이
GPU·memory 비용을 크게 좌우합니다.

### Decision

- 별·태양·달·행성은 하나의 point shader에서 magnitude, project color, kind와
  body style attribute를 사용해 표현합니다. 태양계 천체는 밝은 별보다 약
  3–4배 크게 그리고, 달 표면과 행성의 띠·대적점·고리·색상을 procedural
  shape로 구분합니다.
- 은하수는 Galactic equator의 72개 표본을 ICRS와 관측자 지평 좌표로 변환한
  반투명 ribbon으로 렌더링합니다. 외부 bitmap texture를 사용하지 않습니다.
- 대기·박명은 태양 고도에 따른 CSS gradient로, 지상 실루엣은 고도 0도를
  둘러싼 프로젝트 소유 구면 geometry로 표시합니다.
- 태양계 천체는 형상만으로 식별하도록 scene label을 표시하지 않습니다. 항성,
  심원천체와 별자리 label은 viewport 사각형 충돌을 제거하고 확대 수준과 품질
  모드에 따라 밀도를 조정합니다.
- reduced motion, 4GB 이하 device memory 또는 4개 이하 logical processor에서는
  pixel ratio를 1로 제한하고 label 밀도를 낮춥니다.
- production `/sky` client JavaScript 예산과 대표 기기 runtime 예산은
  `docs/PLANETARIUM_PERFORMANCE.md`에서 관리합니다.

### Consequences

- texture·landscape 다운로드와 별도 시각 asset 라이선스 없이 M9 시각 단서를
  제공합니다.
- 사실적인 천체 표면보다 식별성과 성능을 우선하며, 고해상도 texture는 출처와
  실제 성능을 별도 승인한 뒤 추가해야 합니다.
- 채택한 catalog snapshot의 출처, 라이선스와 attribution을
  `THIRD_PARTY_NOTICES.md`에 유지해야 합니다.
- 실제 release 후보는 자동 bundle 예산 외에도 대표 desktop/mobile runtime
  측정을 반복해야 합니다.

---

## ADR-026 — Generated Naked-Eye and Deep-Sky Catalog

- Status: Accepted
- Date: 2026-09-17

### Context

M9의 초기 30개 항성과 3개 별자리 연결선은 renderer와 interaction 검증에는
충분하지만 실제 하늘 탐색과 검색에는 부족합니다. 전체 Gaia/OpenNGC를 client에
포함하거나 원격 catalog를 runtime에 조회하면 bundle, 계산 비용과 장애 의존성이
과도합니다. catalog 확대는 ADR-019와 ADR-023에 따라 출처, 재배포 조건과 성능
검증이 선행되어야 합니다.

### Decision

- HYG Database 4.1에서 겉보기 등급 6.5 이하 항성 8,920개를 추출합니다.
- OpenNGC에서 은하·성운·성단 유형 중 Messier나 일반 이름이 있거나 V등급 10
  이하인 610개를 추출합니다.
- Stellarium Western sky-culture의 HIP 연결선으로 88개 별자리 674개 segment를
  생성하되 삽화, 설명과 AGPL code는 포함하지 않습니다.
- 원본 commit과 SHA-256을 고정하고 프로젝트 generator로 compact JSON을 만듭니다.
  생성 데이터의 CC BY-SA attribution과 조건을 제3자 고지에 기록합니다.
- J2000 좌표는 Astronomy Engine의 EQJ-to-EQD rotation으로 관측일 세차를 보정한
  다음 지평 좌표로 변환합니다.
- 전체 catalog는 GPU point buffer와 검색에 제공하지만 label과 접근 가능한 화면
  목록은 중요 천체로 제한합니다.

### Consequences

- 네트워크 연결 없이 육안 별과 대표 심원천체를 검색·선택하고 88개 별자리 선을
  볼 수 있습니다.
- 약 9,500개 천체를 매 scene 계산하므로 route bundle과 대표 기기 frame/memory
  예산을 계속 측정해야 합니다.
- HYG/OpenNGC에서 파생한 JSON과 Stellarium 연결선에는 각 upstream의 CC BY-SA
  조건과 attribution이 적용됩니다.
- 고유운동은 현재 배율에서 생략합니다. 고배율 정밀 천문 기능을 추가할 때 HYG의
  proper-motion 값을 포함하고 검증해야 합니다.
