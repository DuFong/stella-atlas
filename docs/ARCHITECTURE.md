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
Google Cloud 등록과 실제 계정 callback 검증은 Milestone 8에서 진행합니다.
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

Milestone 8에서 즐겨찾기 위치와 최근 조회 위치를 인증된 내부 사용자 UUID에
귀속합니다. 모든 조회는 소유자 범위로 제한하고, 정확한 좌표는 사용자가
명시적으로 즐겨찾기를 저장하거나 최근 위치 기록에 동의한 경우에만
영구 저장합니다. 최근 위치는 소수점 이하 4자리로 반올림하고 사용자별 최신
10개만 유지하며, 클라이언트에는 내부 ID를 노출하지 않습니다. 사용자는 최근
위치 전체를 삭제할 수 있습니다.

즐겨찾기 위치는 `favorite_location`에 내부 사용자 UUID, 사용자 지정 이름,
소수점 이하 최대 6자리 좌표, 서버가 해석한 IANA timezone과 생성시각을
저장합니다. 상세 조회와 삭제는 항상 location ID와 owner UUID를 함께 조건으로
사용해 다른 사용자의 위치 존재 여부를 노출하지 않습니다.

프런트엔드 홈과 `/sky`는 서버 렌더링 시 현재 session cookie를 backend에 전달해
초기 즐겨찾기·최근 위치 목록을 가져옵니다. 브라우저의 저장·삭제 요청은 같은 origin의 Next.js
Route Handler를 거치며 handler가 backend CSRF token과 session cookie를
전달합니다. 사용자가 저장을 명시한 좌표만 서버로 보내고 시뮬레이션 시각은
즐겨찾기 payload에 포함하지 않습니다.

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

Milestone 8에서 Google Cloud OAuth 애플리케이션의 로컬 callback을 검증했습니다.
로그인 시 `(provider, subject)` identity를 내부 사용자 UUID에 연결하고, 외부
identity와 사용자 프로필을 분리된 PostgreSQL 테이블에 저장합니다. 재로그인 시
내부 UUID는 유지하고 표시 이름, 이메일과 사진 URL만 최신 OIDC claim으로
갱신합니다.

### record

사진과 코멘트가 포함된 관측 게시물을 관리합니다.

Milestone 7의 사진 게시물은 프런트엔드 로컬 기능으로 유지합니다. 게시물 metadata와 이미지
Blob은 IndexedDB에 저장하고, `ObservationPostRepository`와 `MediaStore`
애플리케이션 port가 브라우저 API를 직접 감쌉니다. UI와 도메인 모델은 IndexedDB
key나 object store 구조를 알지 않습니다. Milestone 8은 별도의
`observation_record`에 관측 시각, IANA timezone, 선택적 좌표와 최대 500자
코멘트만 저장합니다. 해시태그는 응답 시 코멘트에서 결정적으로 추출하며
`mediaStatus`는 `NOT_ATTACHED`로 고정합니다. 현재
`IndexedDbObservationJournal` adapter가 metadata와 Blob 변경을 하나의
read-write transaction으로 처리합니다.

서버 기록과 로컬 게시물은 자동 연결하지 않습니다. 서버 미디어를 도입하려면
object storage, 업로드·검사·삭제 정책과 명시적인 local-to-remote migration을
먼저 승인하고 remote 또는 동기화 adapter를 추가해야 합니다.

주요 책임:

- 이미지 선택과 카메라 촬영 결과 수신
- EXIF 촬영 시각·GPS 추출과 출처 표시
- 사용자 수정이 가능한 촬영 위치·시각, 코멘트와 해시태그
- 로컬 게시물의 생성·조회·수정·삭제
- 저장 용량, 권한, 손상 파일과 누락 metadata 오류 처리

사진 입력과 저장은 브라우저 상호작용이 필요하므로 Client Component에 둡니다.
카메라 stream은 사용이 끝나거나 화면을 벗어날 때 모든 track을 중지합니다.
서버 렌더링 중 IndexedDB에 접근하지 않으며 hydration 이후에만 로컬 목록을
불러옵니다.

### planetarium

선택한 좌표와 시각의 밤하늘을 대화형으로 렌더링합니다. 플라네타리움 엔진과
별 카탈로그는 프런트엔드 infrastructure adapter로 격리하고, 페이지는 위치,
절대 시각, 시야 방향과 확대 수준을 프로젝트가 정의한 입력 모델로 전달합니다.

기술 spike 결과 D3-Celestial은 BSD-3-Clause 코드임에도 D3 3.x 고정, 큰 npm
package와 혼합된 catalog 출처 때문에 채택하지 않았습니다. Stellarium Web
Engine도 AGPL-3.0 공개 의무 때문에 제외합니다. 초기 구현은 MIT 라이선스의
Astronomy Engine으로 태양·달·행성 및 지평 좌표를 계산하고 StellaAtlas의 Canvas
2D adapter가 직접 렌더링합니다. 초기 소규모 catalog는 M9 안정화에서 HYG 4.1의
6.5등급 이하 항성, OpenNGC의 대표 은하·성운·성단과 Stellarium Western의 88개
별자리 연결선으로 교체했습니다. 생성 결과와 원본 snapshot은
`docs/PLANETARIUM_CATALOGS.md`에서 관리합니다.

Milestone 7의 최소 범위는 시간 이동, 방향 전환, 확대·축소, 주요 천체와 별자리
표시입니다. 센서 기반 AR, 사진 plate solving, 망원경 제어와 자체 대규모 천체
카탈로그 서버는 제외합니다.

Milestone 9는 계산 계층을 교체하지 않고 renderer와 interaction 계층을
고도화합니다. `PlanetariumEngine`은 위치와 절대 시각을 결정적인
`PlanetariumScene`으로 변환하고, 새 renderer는 scene과 별도로 관리되는 view
state를 입력받습니다.

```text
PlanetariumInput ──> Astronomy Engine adapter ──> PlanetariumScene
                                                     │
                                                     ▼
                                       Renderer adapter + ViewState
                                                     │
                                                     ▼
                                      WebGL sky / accessible text fallback
```

`ViewState`에는 카메라 방향, field of view, label 밀도, 선택 천체와 시간 재생
상태처럼 화면에만 필요한 값을 둡니다. 천체의 위치나 관측 시각을 renderer가 다시
계산하지 않으며 React state와 GPU resource lifecycle을 분리합니다. renderer는
초기화·resize·render·hit-test·dispose 경계를 제공하고 화면 이탈 시 animation
frame, texture, buffer와 event listener를 해제해야 합니다.

모바일 전체화면의 방향 센서 입력은 renderer가 아니라 별도
`DeviceOrientationController` adapter가 소유합니다. 첫 유효 센서 자세를 현재
`ViewState`의 기준으로 잡고 quaternion으로 화면 방향을 투영한 뒤 보간된 방위와
고도만 React state에 전달합니다. 권한 요청은 사용자 조작 안에서 수행하고 HTTPS,
권한 거부와 미지원 상태를 UI로 설명합니다. 전체화면 종료나 component unmount 시
센서 listener와 animation frame을 해제하며, 카메라 영상 합성 AR은 포함하지
않습니다.

ADR-023은 Three.js 기반 프로젝트 소유 renderer를 선택했습니다. Stellarium Web
Engine은 AGPL source 제공 의무, WorldWide Telescope는 연구 data visualization
중심의 넓은 기능 범위, 자체 ephemeris와 React가 아닌 고수준 통합 모델 때문에
채택하지 않습니다.

`ThreePlanetariumRenderer`는 Three.js scene, camera, buffer, shader와 GPU resource
lifecycle을 직접 소유합니다. React component는 renderer 내부 object를 state로
보관하지 않고 `PlanetariumScene`과 `ViewState` 변경만 전달합니다. 초기 별과
태양계 천체는 procedural point sprite buffer, 별자리는 line buffer, 지평선의
산 능선은 고도 0도를 감싸는 mesh로 묶어 draw call을 제한합니다. 따라서 산
능선은 화면 하단이 아니라 관측자 지평 좌표에 고정됩니다. WebGL 2 초기화나
context 유지에 실패하면 별도 Canvas element에서
기존 2D renderer를 다시 초기화하고 텍스트 천체 목록을 계속 제공합니다. 전체
항성·심원천체는 하나의 point buffer에 유지하고 label sprite와 화면 밖 텍스트
목록은 중요 천체로 제한해 catalog 크기가 DOM과 texture 수로 확산되지 않게 합니다.

평가는 실제 desktop·mobile에서 초기 로딩, 지속 frame time, 메모리, bundle,
input latency와 접근성 fallback을 측정합니다. 최종 성능 예산은 WebGL foundation
측정 뒤 확정합니다.

M9의 완성 renderer는 외부 texture 없이 별·태양·달·행성을 point shader로
구분하고, Galactic-to-ICRS 회전으로 만든 72개 은하수 표본을 반투명 ribbon으로
표시합니다. 대기·박명과 지상 실루엣은 CSS gradient와 프로젝트 geometry로
제공합니다. 천체와 별자리 label은 선택 천체, 태양계 천체, 밝은 별 순으로
우선순위를 계산하고 screen-space 사각형 충돌을 피합니다.

브라우저가 reduced motion을 요청하거나 device memory/logical processor가 낮으면
pixel ratio와 label 밀도를 낮춥니다. 정적 bundle 예산과 대표 기기 runtime 예산,
측정 절차는 `docs/PLANETARIUM_PERFORMANCE.md`를 기준으로 합니다.

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

### ObservationPost

```text
localId
image: blob reference
capturedAt: zoned date-time or empty
coordinate: latitude/longitude or empty
comment
hashtags
metadataSources: user/exif/capture-context
createdAt
updatedAt
```

EXIF 값은 신뢰된 사실이 아니라 편집 가능한 초깃값입니다. 카메라로 새로 만든
이미지 Blob에는 EXIF가 없을 수 있으므로 촬영 컨텍스트의 현재 시각과, 별도
동의를 받은 경우에만 브라우저 위치를 제안합니다. 제안값과 EXIF 값은 출처를
구분하고 저장 전에 사용자가 확인할 수 있어야 합니다.

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

### Local observation post flow

```text
1. User selects an image or explicitly grants camera access and captures one
2. Browser validates the file and attempts EXIF extraction
3. Form proposes available time and coordinate values with their source
4. User reviews or edits every field and submits the post
5. Application port stores metadata and the image Blob in IndexedDB atomically
6. Client-side list reads local posts after hydration
```

이 흐름은 Milestone 7에서 백엔드 API를 호출하지 않습니다. 브라우저 저장소
삭제, 사생활 보호 모드, origin 변경 또는 기기 변경 시 데이터가 유지된다고
보장하지 않습니다.

### Sky simulation flow

```text
1. User selects coordinate and local date-time
2. Frontend converts the input to an explicit absolute instant and timezone
3. Planetarium adapter calculates horizontal coordinates on the client
4. Engine renders sky state and handles time, direction and zoom controls
5. Canvas adapter renders the scene and UI exposes an accessible object list
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

Milestone 8의 첫 사용자 schema는 `user_account`와 `oauth_identity`를 분리합니다.
`oauth_identity(provider, provider_subject)`가 외부 계정의 유일 키이며 내부
리소스 소유권은 provider subject가 아니라 `user_account.id` UUID를 참조합니다.

Milestone 7의 관측 게시물은 PostgreSQL이 아니라 현재 브라우저의 IndexedDB에만
저장합니다. 이 저장소는 임시·기기 종속 저장소이며 서버 백업으로 간주하지
않습니다. 서버 저장을 도입할 때 `observation_record` schema, object storage,
소유권, 업로드 제한, 악성 파일 검사와 로컬 데이터 이전 정책을 별도로 결정합니다.

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
- 사진과 정확한 촬영 위치의 서버 저장 또는 공유 기능 도입
- 플라네타리움 엔진이나 천체 카탈로그의 라이선스·비용 변경
- 알림과 배치 처리 도입
- 모바일 앱 API 제공
