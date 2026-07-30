# Architecture

## 1. Architecture Goals

Stella Atlas의 아키텍처는 다음 목표를 가집니다.

- 빠른 MVP 개발
- 실제 운영 가능한 안정성
- 외부 API 장애 격리
- 천문 계산 기능의 점진적 확장
- 테스트 가능한 관측 점수 도메인
- Codex가 이해하기 쉬운 명확한 구조
- 불필요한 분산 시스템 회피

---

## 2. Initial Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│     Next.js / TypeScript     │
└──────────────┬───────────────┘
               │ HTTPS
┌──────────────▼───────────────┐
│          Backend             │
│     Spring Boot / Java       │
│                              │
│  ┌────────────────────────┐  │
│  │ Observation Domain     │  │
│  ├────────────────────────┤  │
│  │ Weather Integration    │  │
│  ├────────────────────────┤  │
│  │ Astronomy Integration  │  │
│  ├────────────────────────┤  │
│  │ Location / User / Log  │  │
│  └────────────────────────┘  │
└───────┬───────────────┬──────┘
        │               │
┌───────▼──────┐  ┌─────▼───────────────┐
│ PostgreSQL   │  │ External Providers  │
└──────────────┘  └─────────────────────┘
```

---

## 3. Why Spring Boot

Spring Boot를 메인 백엔드로 선택하는 이유:

- 프로젝트 개발자의 기존 경험 활용
- 명확한 계층 및 도메인 구조
- 외부 API 통합
- 검증, 보안, 데이터베이스, 테스트 생태계
- 장기 운영과 기능 확장
- Java 기반 정적 타입 안정성

천문 계산이 복잡해진다고 해서 전체 백엔드를 Python으로 교체하지 않습니다.

---

## 4. Optional Python Service

다음 조건이 실제로 발생할 때만 Python 서비스를 고려합니다.

- Astropy 의존성이 핵심 기능이 됨
- 천체 좌표 변환이 Java 구현보다 현저히 복잡함
- 대규모 천문 카탈로그 처리
- 이미지 분석 또는 머신러닝
- 독립적인 계산 확장이 필요함

도입 전 ADR을 작성해야 합니다.

```text
Spring Boot
    │
    └── FastAPI Astronomy Engine
            ├── Astropy
            └── Astroquery
```

---

## 4.1 Frontend Integration

Next.js App Router 페이지는 좌표와 날짜를 URL query string으로 받아 Server
Component에서 Spring Boot의 `GET /api/v1/observations`를 호출합니다. API 접근은
`features/observation/api`에 중앙화하며 `API_BASE_URL`은 서버 런타임에서만
읽습니다.

브라우저가 백엔드를 직접 호출하지 않으므로 현재 조회 흐름에는 CORS가 필요하지
않습니다. 예상 가능한 공급자·검증 오류는 API 오류 계약을 사용자용 상태 카드로
변환하고, 예상하지 못한 렌더링 오류는 App Router의 `error.tsx` 경계가
처리합니다.

인증 UI도 브라우저에 백엔드 base URL을 노출하지 않습니다. `/auth/login` Route
Handler가 Google 로그인 시작 endpoint로 redirect하고, `/auth/logout` Route
Handler가 현재 session cookie를 전달해 CSRF token 발급과 백엔드 로그아웃을
완료합니다. Server Component는 브라우저 요청의 session cookie를
`GET /api/v1/users/me`에 전달해 로그인 상태를 렌더링합니다. 로컬 개발에서는
프런트엔드와 백엔드가 같은 `localhost` hostname을 사용하며, 운영에서 hostname을
분리하면 공통 cookie domain 또는 인증 proxy 전략을 배포 설계에 포함해야 합니다.
Google Cloud 등록과 실제 계정 callback 검증은 Milestone 7에서 진행합니다.
그 전에는 프런트 서버의 `AUTH_ENABLED`를 `false`로 유지해 로그인 진입점을
준비 중 상태로 표시합니다. 등록과 비밀값 설정이 완료된 환경에서만 `true`로
전환합니다.

---

## 5. Backend Modules

### observation

관측 조건을 종합하고 결과를 생성합니다.

주요 책임:

- 관측 점수 계산
- 등급 계산
- 최적 시간 선택
- 결과 이유 생성
- 날씨와 천문 데이터 조합

`ObservationForecastService`는 요청 날짜의 로컬 정오부터 다음 날 정오까지의
날씨를 두 날짜의 천문 상태와 정렬합니다. 각 규칙은 하나의 요인만 평가하고
`DefaultObservationScorePolicy`가 감점을 합산합니다. 추천 가능한 연속 시간대는
`BestObservationWindowSelector`가 평균 점수, 길이, 시작 시각 순으로 선택합니다.

### weather

날씨 공급자와 통신합니다.

주요 책임:

- 시간대별 날씨 조회
- 외부 DTO 변환
- 공급자 오류 처리
- 캐시 전략
- 내부 WeatherCondition 생성

### astronomy

천문 정보를 제공합니다.

주요 책임:

- 위치와 로컬 날짜를 명시적인 타임존의 계산 구간으로 변환
- 일몰
- 박명
- 월출과 월몰
- 달의 위상
- 달 밝기
- 향후 천체 위치

`AstronomyCalculator`는 domain port이며 Commons SunCalc 구현은 infrastructure에
격리합니다. 계산 결과의 절대 시각은 `Instant`로 보존하고, 극야·백야 또는
하루 안에 이벤트가 없는 경우 시간을 만들어내지 않고 상태와 `Optional`로
표현합니다.

### location

사용자 입력 위치를 처리합니다.

주요 책임:

- 위도 및 경도 검증
- 지역명 검색
- 타임존 해석
- 즐겨찾기 관측 장소
- 최근 조회 위치

Milestone 7에서 즐겨찾기 위치와 최근 조회 위치를 인증된 내부 사용자 UUID에
귀속합니다. 모든 조회는 소유자 범위로 제한하고, 정확한 좌표는 사용자가
명시적으로 즐겨찾기를 저장하거나 최근 위치 기록에 동의한 경우에만
영구 저장합니다. 최근 위치에는 개수 또는 보존 기간 제한을 둡니다.

### user

사용자 및 인증을 담당합니다.

핵심 관측 조회는 비로그인으로 유지합니다. Milestone 6에서는 Google OIDC
Authorization Code client와 Spring Security 서버 세션 기반을 구현했으며
`/api/v1/users/me/**` 리소스에 인증을 요구합니다. OAuth access token, provider
subject와 session identifier는 공개 API에 노출하지 않습니다.

OAuth profile이 활성화되지 않은 로컬 실행에서는 Google client registration을
만들지 않지만 사용자 API의 인증 경계는 유지합니다. 상태 변경 요청에는 CSRF
보호를 적용하고, 단일 인스턴스 메모리 세션을 다중 인스턴스 운영으로 확장하기
전 공유 세션 저장소를 다시 결정합니다.

Google Cloud OAuth 애플리케이션 등록, 실제 로그인 callback 검증과 provider
계정을 내부 사용자 UUID에 연결하는 영속화는 Milestone 7에서 진행합니다.

### record

관측 기록을 저장합니다.

MVP 1차 범위에는 포함하지 않을 수 있습니다.

---

## 6. Recommended Internal Structure

```text
observation/
├── api/
│   ├── ObservationController
│   ├── ObservationRequest
│   └── ObservationResponse
├── application/
│   ├── GetObservationForecastUseCase
│   └── ObservationFacade
├── domain/
│   ├── ObservationScore
│   ├── ObservationGrade
│   ├── ObservationReason
│   ├── ObservationScorePolicy
│   └── BestObservationWindowSelector
└── infrastructure/
    └── persistence/
```

각 기능 패키지 안에서 필요한 계층만 만듭니다.

불필요한 빈 디렉터리나 인터페이스를 미리 생성하지 않습니다.

---

## 7. Domain Model Draft

### Coordinate

```text
latitude
longitude
```

규칙:

- latitude: -90 ~ 90
- longitude: -180 ~ 180

### ObservationRequest

```text
coordinate
localDate
timezone
```

### WeatherCondition

```text
observedAt
temperature
cloudCover
precipitationProbability
humidity
visibility
windSpeed
```

### AstronomyCondition

```text
sunrise
sunset
civilTwilightStart
civilTwilightEnd
nauticalTwilightStart
nauticalTwilightEnd
astronomicalTwilightStart
astronomicalTwilightEnd
moonrise
moonset
moonPhase
moonIllumination
```

### ObservationEvaluation

```text
score
grade
reasons
recommended
```

---

## 8. Data Flow

```text
1. Browser submits coordinate and date as Next.js URL search parameters
2. Next.js Server Component requests the observation API
3. Backend validates input
4. Location module resolves timezone
5. Weather module fetches hourly forecast
6. Astronomy module calculates astronomy data
7. Observation module aligns data by local time
8. Score policy evaluates each time slot
9. Best window selector chooses recommendation
10. API maps the domain result and Next.js renders the user-facing response
```

---

## 9. Time and Timezone Policy

천체관측 서비스에서 시간은 핵심 도메인입니다.

### Rules

- API 입력 날짜는 조회 위치의 로컬 날짜로 해석
- 하나의 관측일은 해당 로컬 날짜 정오부터 다음 날 정오 직전까지로 정의
- 외부 API 시간은 원본 타임존을 확인
- 내부 저장이 필요한 절대 시각은 `Instant`
- 사용자 표현은 `ZonedDateTime`
- 서버 OS 기본 타임존 사용 금지
- UTC와 로컬 시각 변환 테스트 필수
- 자정을 넘는 관측 시간 구간 지원

---

## 10. External API Integration

각 공급자는 Adapter로 격리합니다.

```text
WeatherProvider
  └── OpenMeteoWeatherAdapter (Milestone 3)

AstronomyCalculator
  └── CommonsSuncalcAstronomyCalculator (Milestone 4)

TimeZoneResolver
  └── TimeshapeTimeZoneResolver (Milestone 4)
```

내부 애플리케이션은 특정 공급자의 DTO를 알지 못해야 합니다.

Open-Meteo Adapter는 공급자 응답을 `WeatherForecast`와
`HourlyWeatherCondition`으로 변환합니다. 공급자 시각은 UNIX epoch seconds로
요청해 `Instant`로 보존하고, 응답의 IANA timezone은 별도 `ZoneId`로 유지합니다.

천문 계산은 외부 네트워크 호출 없이 Commons SunCalc로 수행합니다. location
모듈은 TimeShape의 내장 경계 데이터로 좌표를 IANA `ZoneId`로 해석하고,
astronomy 애플리케이션은 공급자 모델이 아닌 domain port만 의존합니다.
온도는 섭씨, 바람은 m/s, 가시거리는 m로 명시해 단위 변환을 Adapter 경계에서
고정합니다.

### Required Protections

- 연결 타임아웃
- 응답 타임아웃
- 오류 매핑
- 데이터 누락 처리
- 제한적인 재시도
- 모니터링
- 캐싱

---

## 11. Caching Strategy

날씨와 천문 데이터는 동일 좌표와 시간 범위에서 반복 조회될 가능성이 높습니다.

Milestone 3에서는 Caffeine 인메모리 캐시를 사용합니다. 캐시 TTL과 최대 항목
수는 환경별 설정으로 제한하며, 동일한 `WeatherForecastQuery`만 재사용합니다.

### Example Cache Key

```text
provider + rounded-coordinate + date + timezone
```

### Coordinate Rounding

정밀도와 캐시 효율 사이의 균형이 필요합니다.

임의로 결정하지 않고 ADR로 기록합니다.

Redis는 다중 인스턴스 운영 또는 공유 캐시 필요성이 확인된 후 도입합니다.

---

## 12. Database Design Principles

초기 데이터 후보:

- user
- saved_location
- observation_record
- favorite_object
- provider_request_log 또는 집계 메트릭

### Rules

- Flyway 사용
- UUID 또는 명확한 식별자 전략
- 생성 및 수정 시각 저장
- 정확한 위치 저장 최소화
- 개인정보 보존 정책 고려
- 외부 API 원본 응답의 무분별한 영구 저장 금지

---

## 13. Error Architecture

공통 오류 응답:

```json
{
  "code": "WEATHER_PROVIDER_UNAVAILABLE",
  "message": "현재 날씨 정보를 불러올 수 없습니다.",
  "timestamp": "2026-08-01T10:02:15Z",
  "path": "/api/v1/observations",
  "details": []
}
```

요청 추적 기능을 도입하면 실제 추적 컨텍스트의 `traceId`를 추가할 수 있습니다.
추적 시스템 없이 오류 응답 전용 식별자를 임의로 생성하지 않습니다.

오류 유형:

- Validation Error
- Resource Not Found
- External Provider Error
- Domain Rule Error
- Authentication Error
- Internal Error

사용자 메시지와 내부 디버깅 정보를 분리합니다.

---

## 14. Security Architecture

### MVP

- 공개 조회 API
- 입력 검증
- Rate Limiting 검토
- CORS 제한
- 보안 헤더
- 비밀값 환경변수 관리

### Later

- 추가 OIDC provider
- 사용자별 리소스 권한
- 세션 또는 토큰 전략
- 계정 삭제
- 위치 정보 보호

---

## 15. Observability

최소 운영 관측 항목:

- API 응답 시간
- 외부 API 응답 시간
- 외부 API 실패율
- 캐시 적중률
- HTTP 상태 코드 분포
- 예외 발생 수
- 추천 생성 실패율

로그에는 다음을 남기지 않습니다.

- 비밀번호
- 액세스 토큰
- API 키
- 사용자의 정확한 위치
- 불필요한 외부 API 전체 응답

---

## 16. Deployment Architecture

### Initial

```text
Frontend → Vercel
Backend → Container Platform
Database → Managed PostgreSQL
```

### Production Requirements

- HTTPS
- 환경별 설정 분리
- 자동 배포
- DB 백업
- 헬스 체크
- 로그 수집
- 롤백 가능성
- 운영 비밀 관리

---

## 17. Architecture Review Triggers

다음 상황에서는 아키텍처 결정을 다시 검토합니다.

- 외부 API 비용 증가
- 응답 속도 목표 미달
- 다중 인스턴스 필요
- 천문 계산 부하 증가
- Python 생태계 의존 기능 등장
- 사용자 위치 데이터 저장 확대
- 알림과 배치 처리 도입
- 모바일 앱 API 제공
