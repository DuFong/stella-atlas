# API Guidelines

## 1. General Principles

- REST 스타일 JSON API를 사용합니다.
- URL은 리소스를 표현합니다.
- 동작은 HTTP 메서드로 표현합니다.
- API 응답에 JPA Entity를 직접 노출하지 않습니다.
- 모든 날짜와 시각 형식을 명시합니다.
- 오류 응답 형식을 통일합니다.
- 공개 API 변경은 하위 호환성을 고려합니다.

---

## 2. API Inventory and Status

제품 API의 기본 경로는 `/api/v1`입니다. Actuator 운영 엔드포인트는 제품 API에
포함하지 않습니다.

| Status | Milestone | Method and Path | Purpose |
|---|---:|---|---|
| Implemented | 1 | `GET /actuator/health` | 애플리케이션과 의존 서비스 상태 |
| Implemented | 1 | `GET /actuator/info` | 빌드 및 애플리케이션 정보 확장 지점 |
| Implemented | 5 | `GET /api/v1/observations` | 위치와 날짜의 통합 관측 예보 |
| Foundation | 6 | `GET /oauth2/authorization/google` | OAuth profile의 Google OIDC 로그인 시작 |
| Implemented | 6 | `GET /api/v1/auth/csrf` | 상태 변경 요청용 CSRF token 발급 |
| Implemented | 6 | `GET /api/v1/users/me` | 로그인한 사용자 프로필 조회 |
| Implemented | 6 | `POST /api/v1/auth/logout` | 현재 세션 로그아웃 |
| Planned support | TBD | `GET /api/v1/locations/search` | 지역명 검색과 좌표·타임존 확인 |
| Planned user | 7 | `GET /api/v1/users/me/locations` | 즐겨찾기 관측 장소 목록 |
| Planned user | 7 | `GET /api/v1/users/me/locations/{locationId}` | 즐겨찾기 관측 장소 조회 |
| Planned user | 7 | `POST /api/v1/users/me/locations` | 관측 장소 즐겨찾기 등록 |
| Planned user | 7 | `DELETE /api/v1/users/me/locations/{locationId}` | 관측 장소 즐겨찾기 삭제 |
| Planned user | 7 | `GET /api/v1/users/me/recent-locations` | 최근 조회 위치 목록 |
| Planned user | 7 | `GET /api/v1/users/me/records` | 관측 기록 목록 |
| Planned user | 7 | `POST /api/v1/users/me/records` | 관측 기록 생성 |

`Planned` API는 구현된 계약이 아니며 해당 마일스톤에서 요청·응답, 인증과 오류
처리를 확정합니다. 날씨와 천문 공급자는 내부 Adapter이므로
`/api/v1/weather/forecast` 같은 공급자 중심 API를 기본 공개 표면으로 만들지
않습니다.

---

## 3. Authentication and Current User API

Status: Authentication foundation implemented in Milestone 6.

Google OIDC Authorization Code 로그인과 Spring Security의 서버 세션을
사용합니다. 로그인 시작 endpoint는 브라우저를 Google로 redirect하고, callback
성공 후 설정된 프런트엔드 주소로 돌아옵니다.

Milestone 6은 client와 보안 경계를 구현한 단계입니다. 실제 Google Cloud OAuth
애플리케이션 등록, 동의 화면, 운영 redirect URI와 내부 사용자 연결은 Milestone
7에서 완료합니다. 그 전에는 프런트의 `AUTH_ENABLED`를 `false`로 유지하며 로그인
진입 UI를 활성화하지 않습니다.

```http
GET /oauth2/authorization/google
```

공개 관측 조회는 인증 없이 사용할 수 있습니다. `/api/v1/users/me/**`의 사용자
리소스는 인증이 필요하며, 미인증 요청에는 `401 UNAUTHORIZED` 오류 계약을
반환합니다.

### Current user

```http
GET /api/v1/users/me
```

```json
{
  "name": "Stella Observer",
  "email": "observer@example.com",
  "pictureUrl": "https://example.com/profile.png"
}
```

외부 provider subject, OAuth access token과 session identifier는 응답에
포함하지 않습니다.

### Logout

상태를 변경하기 전에 CSRF token을 가져옵니다.

```http
GET /api/v1/auth/csrf
```

```json
{
  "headerName": "X-CSRF-TOKEN",
  "token": "..."
}
```

```http
POST /api/v1/auth/logout
```

성공 시 `204 No Content`를 반환합니다. 세션을 사용하는 상태 변경 요청에는 CSRF
토큰이 필요하며 클라이언트는 발급 응답의 header 이름과 token 값을 그대로
전달합니다.

---

## 4. Observation Forecast API

Status: Implemented in Milestone 5.

### Request

```http
GET /api/v1/observations?latitude=37.5665&longitude=126.9780&date=2026-08-01
```

### Parameters

| Name | Type | Required | Description |
|---|---|---:|---|
| latitude | decimal | yes | -90 ~ 90 |
| longitude | decimal | yes | -180 ~ 180 |
| date | ISO date | yes | 조회 위치 기준 로컬 날짜 |

타임존은 서버가 좌표를 기반으로 판별하는 것을 우선합니다.

### Response

```json
{
  "location": {
    "latitude": 37.5665,
    "longitude": 126.978,
    "timezone": "Asia/Seoul"
  },
  "date": "2026-08-01",
  "summary": {
    "score": 90,
    "grade": "EXCELLENT",
    "recommended": true,
    "bestWindow": {
      "start": "2026-08-01T22:00:00+09:00",
      "end": "2026-08-02T00:00:00+09:00",
      "averageScore": 90
    },
    "message": "별을 관측하기 매우 좋은 조건입니다."
  },
  "astronomy": {
    "sunrise": {
      "time": "2026-08-01T05:35:00+09:00",
      "state": "OCCURS"
    },
    "sunset": {
      "time": "2026-08-01T19:40:00+09:00",
      "state": "OCCURS"
    },
    "civilTwilightStart": {
      "time": "2026-08-01T05:07:00+09:00",
      "state": "OCCURS"
    },
    "civilTwilightEnd": {
      "time": "2026-08-01T20:08:00+09:00",
      "state": "OCCURS"
    },
    "nauticalTwilightStart": {
      "time": "2026-08-01T04:33:00+09:00",
      "state": "OCCURS"
    },
    "nauticalTwilightEnd": {
      "time": "2026-08-01T20:42:00+09:00",
      "state": "OCCURS"
    },
    "astronomicalTwilightStart": {
      "time": "2026-08-01T03:56:00+09:00",
      "state": "OCCURS"
    },
    "astronomicalTwilightEnd": {
      "time": "2026-08-01T21:18:00+09:00",
      "state": "OCCURS"
    },
    "moonrise": "2026-08-01T22:31:00+09:00",
    "moonset": null,
    "lunarVisibility": "NORMAL",
    "moonPhase": 0.62,
    "moonIllumination": 0.18
  },
  "hourly": [
    {
      "time": "2026-08-01T22:00:00+09:00",
      "score": 90,
      "grade": "EXCELLENT",
      "recommended": true,
      "twilightPhase": "DARK",
      "moonAboveHorizon": false,
      "weather": {
        "temperatureCelsius": 24.1,
        "cloudCoverPercent": 12,
        "precipitationProbabilityPercent": 0,
        "humidityPercent": 62,
        "visibilityMeters": 18000,
        "windSpeedMetersPerSecond": 2.1
      },
      "reasons": [
        {
          "code": "MODERATE_CLOUD_COVER",
          "impact": -10,
          "message": "구름이 조금 예상됩니다."
        }
      ]
    }
  ],
  "generatedAt": "2026-08-01T10:02:15Z"
}
```

관측 시간 범위는 요청 위치의 로컬 시간으로 요청 날짜 정오부터 다음 날 정오
직전까지입니다. `bestWindow`는 추천 가능한 연속 시간대가 없으면 `null`입니다.
태양 이벤트가 발생하지 않는 극지방에서는 `time`이 `null`이고 `state`가
`ALWAYS_ABOVE` 또는 `ALWAYS_BELOW`입니다.

---

## 5. Data Conventions

### Date

```text
YYYY-MM-DD
```

### Date-Time

RFC 3339 형식과 타임존 오프셋을 사용합니다.

```text
2026-08-01T22:00:00+09:00
```

### Percentage

퍼센트는 0~100 정수 또는 소수로 표현합니다.

필드명에 `Percent`를 포함합니다.

### Ratio

0~1 비율은 필드명으로 의미를 명확히 합니다.

예:

```text
moonIllumination: 0.18
```

### Units

단위를 필드명에 포함합니다.

- `temperatureCelsius`
- `visibilityMeters`
- `windSpeedMetersPerSecond`

---

## 6. Error Response

```json
{
  "code": "INVALID_COORDINATE",
  "message": "위도 또는 경도 값이 올바르지 않습니다.",
  "timestamp": "2026-08-01T10:02:15Z",
  "path": "/api/v1/observations",
  "details": [
    {
      "field": "latitude",
      "reason": "must be between -90 and 90"
    }
  ]
}
```

### Error Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `code` | string | yes | 클라이언트가 분기할 수 있는 안정적인 오류 코드 |
| `message` | string | yes | 내부 구현을 노출하지 않는 사용자용 메시지 |
| `timestamp` | UTC date-time | yes | 오류 응답 생성 시각 |
| `path` | string | yes | 오류가 발생한 요청 경로, query string 제외 |
| `details` | array | yes | 필드별 오류 목록, 해당 사항이 없으면 빈 배열 |

`traceId`는 실제 요청 추적 기능이 도입되고 추적 컨텍스트에서 값을 얻을 수 있을
때 추가합니다. 임의의 UUID를 오류 응답에서 생성하지 않습니다.

### Standard Error Codes

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | INVALID_REQUEST | 요청 형식 오류 |
| 400 | INVALID_COORDINATE | 좌표 검증 오류 |
| 400 | UNSUPPORTED_DATE | 지원하지 않는 날짜 |
| 401 | UNAUTHORIZED | 인증 필요 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | RESOURCE_NOT_FOUND | 리소스 없음 |
| 429 | RATE_LIMIT_EXCEEDED | 호출 제한 초과 |
| 502 | EXTERNAL_PROVIDER_ERROR | 외부 공급자 오류 |
| 503 | WEATHER_PROVIDER_UNAVAILABLE | 날씨 공급자 사용 불가 |
| 503 | OBSERVATION_DATA_UNAVAILABLE | 점수 계산에 필요한 데이터 부족 또는 불일치 |
| 500 | INTERNAL_ERROR | 내부 오류 |

내부 예외 메시지와 스택 트레이스를 응답에 노출하지 않습니다.

---

## 7. HTTP Status Rules

- `200 OK`: 정상 조회
- `201 Created`: 리소스 생성
- `204 No Content`: 삭제 또는 본문 없는 성공
- `400 Bad Request`: 검증 실패
- `401 Unauthorized`: 인증되지 않음
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 상태 충돌
- `429 Too Many Requests`: 호출 제한
- `502 Bad Gateway`: 외부 응답 오류
- `503 Service Unavailable`: 일시적 이용 불가
- `500 Internal Server Error`: 예상하지 못한 오류

---

## 8. Pagination

Milestone 7의 기록 및 최근 위치 목록에는 커서 기반 페이지네이션을 우선
검토합니다. 아래
계약은 아직 확정되지 않은 예시입니다.

```http
GET /api/v1/users/me/records?cursor=...&size=20
```

응답 예시:

```json
{
  "items": [],
  "nextCursor": null,
  "hasNext": false
}
```

---

## 9. Idempotency

결제와 같은 기능이 도입되기 전에는 필수는 아니지만,  
중복 생성 가능성이 있는 API는 멱등성을 고려합니다.

관측 기록 생성 시 클라이언트 요청 ID를 사용할 수 있습니다.

---

## 10. Versioning

초기에는 URL 버전을 사용합니다.

```text
/api/v1
```

기존 클라이언트를 깨뜨리는 변경은 새 버전 또는 명시적인 마이그레이션 절차가 필요합니다.

---

## 11. API Documentation

Springdoc OpenAPI 도입 여부는 첫 제품 API를 구현할 때 의존성 정책에 따라
결정합니다.

도입하는 경우 구현에서 기계적인 명세를 생성하고, 도메인 의미와 예시는 이
문서에서 관리합니다.

---

## 12. API Review Checklist

- 입력 검증이 있는가?
- 타임존이 명확한가?
- 단위가 필드명에 포함되는가?
- 외부 API 모델이 노출되지 않는가?
- 오류 코드가 일관적인가?
- 민감 정보가 노출되지 않는가?
- 캐싱 가능 여부가 검토되었는가?
- API 변경이 기존 클라이언트를 깨뜨리지 않는가?
