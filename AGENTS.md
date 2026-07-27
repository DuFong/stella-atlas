# AGENTS.md

이 문서는 Codex 및 기타 AI 코딩 에이전트가 Stella Atlas 저장소에서 작업할 때 따라야 하는 최상위 지침입니다.

AI 에이전트는 작업을 시작하기 전에 반드시 이 문서와 관련 문서를 읽어야 합니다.

---

## 1. Project Context

Stella Atlas는 사용자의 위치와 날짜를 기준으로 날씨와 천문 데이터를 해석하여  
별 관측 가능 여부와 최적 관측 시간을 안내하는 웹 서비스입니다.

이 프로젝트의 목표는 단순 데모가 아니라 실제 공개 가능한 서비스를 만드는 것입니다.

---

## 2. Required Reading Order

작업 전 아래 문서를 순서대로 확인합니다.

1. `README.md`
2. `docs/PRODUCT.md`
3. `docs/ARCHITECTURE.md`
4. `docs/API.md`
5. `docs/DECISIONS.md`
6. 현재 작업과 관련된 코드 및 테스트

문서와 코드가 충돌할 경우 임의로 판단하지 말고, 충돌 내용을 명확히 보고합니다.

---

## 3. Default Workflow

모든 작업은 다음 순서를 따릅니다.

1. 요구사항을 요약합니다.
2. 영향받는 파일을 조사합니다.
3. 변경 계획을 짧게 제시합니다.
4. 최소 범위로 구현합니다.
5. 테스트를 작성하거나 갱신합니다.
6. 테스트와 정적 검사를 실행합니다.
7. 변경 파일과 검증 결과를 보고합니다.

대규모 리팩터링은 요청 없이 수행하지 않습니다.

---

## 4. Architecture Rules

### General

- 모놀리식 구조로 시작합니다.
- 실제 필요성이 입증되기 전에는 마이크로서비스를 만들지 않습니다.
- 기능 중심 패키지 구조를 사용합니다.
- 도메인 로직은 Controller, 외부 API DTO, JPA Entity에 직접 넣지 않습니다.
- 외부 API 모델과 내부 도메인 모델을 분리합니다.
- 핵심 계산 로직은 가능한 한 순수 함수 또는 독립 도메인 서비스로 작성합니다.

### Backend Dependency Direction

```text
api -> application -> domain
infrastructure -> application/domain
domain -> no framework dependency where practical
```

금지 예시:

- Domain이 Controller DTO를 참조
- 외부 API DTO를 그대로 API 응답으로 반환
- Entity를 Controller 응답으로 직접 노출
- 하나의 Service 클래스에 모든 기능 집중
- `common` 패키지에 도메인별 로직 저장

---

## 5. Backend Coding Rules

- Java 21 문법을 사용합니다.
- Spring Boot 공식 관례를 우선합니다.
- 생성자 주입을 사용합니다.
- 필드 주입을 사용하지 않습니다.
- DTO는 역할이 드러나는 이름을 사용합니다.
- `Request`, `Response`, `Command`, `Result`를 구분합니다.
- 입력 검증은 경계에서 수행합니다.
- 예외를 삼키지 않습니다.
- 외부 API 호출에는 타임아웃을 설정합니다.
- 외부 호출 실패를 도메인 오류와 구분합니다.
- 시간은 `Instant`, `LocalDate`, `ZonedDateTime`을 의도에 맞게 사용합니다.
- 서버 기본 타임존에 의존하지 않습니다.
- 위도와 경도는 유효 범위를 검증합니다.
- 관측 점수는 테스트 가능한 규칙 객체 또는 정책으로 분리합니다.

---

## 6. Frontend Coding Rules

- TypeScript strict mode를 유지합니다.
- `any` 사용을 피합니다.
- 서버 데이터와 UI 상태를 구분합니다.
- API 응답은 런타임 검증을 고려합니다.
- 페이지 컴포넌트에 비즈니스 로직을 집중시키지 않습니다.
- 모바일 화면을 기본으로 설계합니다.
- 로딩, 빈 상태, 오류 상태를 구현합니다.
- 접근 가능한 HTML과 키보드 탐색을 고려합니다.
- 날씨 수치만 표시하지 말고 사용자가 이해할 수 있는 설명을 제공합니다.

---

## 7. Observation Score Rules

관측 점수는 서비스 핵심 도메인입니다.

다음 원칙을 지킵니다.

- 점수 범위는 0~100입니다.
- 모든 감점 또는 가점 요소는 설명 가능해야 합니다.
- 규칙은 하드코딩된 거대한 조건문 하나로 만들지 않습니다.
- 동일 입력에 동일 결과를 반환해야 합니다.
- 시간대별 점수를 계산할 수 있어야 합니다.
- 최소값과 최대값을 항상 보장합니다.
- 점수와 별도로 이유 목록을 반환합니다.
- 임계값 변경 시 테스트도 함께 수정합니다.

예시 결과:

```json
{
  "score": 82,
  "grade": "GOOD",
  "reasons": [
    {
      "code": "LOW_CLOUD_COVER",
      "impact": 8,
      "message": "구름이 적어 관측에 유리합니다."
    },
    {
      "code": "BRIGHT_MOON",
      "impact": -12,
      "message": "달이 밝아 어두운 천체 관측에는 불리합니다."
    }
  ]
}
```

---

## 8. External API Rules

- API 클라이언트를 도메인 서비스와 분리합니다.
- 재시도는 멱등성과 실패 원인을 고려하여 제한적으로 사용합니다.
- 무조건적인 재시도를 금지합니다.
- 응답 누락과 예상하지 못한 값에 대비합니다.
- 외부 API DTO에 nullable 가능성을 반영합니다.
- 외부 API 응답을 캐싱할 경우 캐시 키와 TTL 근거를 문서화합니다.
- 외부 서비스 장애 시 사용자에게 이해 가능한 오류를 제공합니다.
- 테스트에서는 실제 외부 API를 호출하지 않습니다.

---

## 9. Database Rules

- 스키마 변경은 Flyway로 관리합니다.
- 운영 DB를 자동 DDL 변경에 의존하지 않습니다.
- 마이그레이션 파일은 수정하지 않고 새 버전을 추가합니다.
- 시간 데이터의 저장 기준을 명확히 합니다.
- 좌표 데이터 정밀도를 임의로 낮추지 않습니다.
- 개인 위치 정보는 최소한으로 저장합니다.
- N+1 문제를 검토합니다.
- 인덱스는 실제 조회 패턴을 기준으로 추가합니다.

---

## 10. Testing Policy

### Backend

필수 테스트 대상:

- 관측 점수 규칙
- 점수 경계값
- 날짜 및 타임존 변환
- 외부 API 응답 변환
- 유효성 검증
- 예외 매핑
- Repository 통합 동작

권장 도구:

- JUnit 5
- AssertJ
- MockWebServer 또는 WireMock
- Testcontainers

### Frontend

필수 테스트 대상:

- 관측 결과 핵심 표현
- 로딩 상태
- API 오류 상태
- 위치 입력 검증
- 주요 사용자 흐름

### Test Naming

테스트 이름은 행동과 기대 결과가 드러나게 작성합니다.

---

## 11. Security Rules

- 비밀 키를 코드 또는 문서에 기록하지 않습니다.
- `.env` 파일을 커밋하지 않습니다.
- 사용자 입력을 신뢰하지 않습니다.
- 위치 정보는 민감한 데이터로 취급합니다.
- 로그에 액세스 토큰, 비밀번호, 정확한 위치를 남기지 않습니다.
- 공개 API에는 호출 제한과 남용 방지를 고려합니다.
- 인증 도입 전에도 권한 경계를 고려한 구조를 유지합니다.

---

## 12. Dependency Policy

새로운 라이브러리를 추가하기 전에 다음을 확인합니다.

- 표준 라이브러리 또는 기존 의존성으로 해결 가능한가?
- 유지보수가 활발한가?
- 라이선스 문제가 없는가?
- 번들 또는 런타임 비용이 적절한가?
- 도입 이유를 설명할 수 있는가?

단순 편의를 위한 중복 라이브러리 추가를 금지합니다.

---

## 13. Git and Commit Rules

권장 커밋 형식:

```text
type(scope): summary
```

예시:

```text
feat(weather): add hourly forecast client
fix(observation): clamp score to valid range
test(astronomy): add twilight boundary cases
docs(api): define error response format
refactor(location): separate coordinate validation
```

권장 type:

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `build`
- `ci`
- `chore`

하나의 커밋에는 하나의 논리적 변경을 담습니다.

---

## 14. Pull Request Requirements

PR 설명에는 아래 내용을 포함합니다.

- 변경 목적
- 주요 변경 사항
- 설계 판단
- 테스트 결과
- 위험 요소
- 화면 변경 시 스크린샷

테스트를 실행하지 못했다면 그 사실과 이유를 명시합니다.

---

## 15. Prohibited Actions

AI 에이전트는 명시적인 요청 없이 다음을 수행하지 않습니다.

- 전체 구조 재작성
- 대규모 파일 이동
- 프레임워크 교체
- 데이터베이스 교체
- 인증 방식 교체
- 기존 마이그레이션 수정
- 공개 API 스펙 파괴
- 테스트 삭제
- 보안 검증 우회
- 환경 변수에 실제 비밀값 작성
- 무관한 코드 스타일 변경
- 새로운 마이크로서비스 생성

---

## 16. Definition of Done

작업은 다음 조건을 만족해야 완료된 것으로 간주합니다.

- 요구사항이 구현되었습니다.
- 관련 테스트가 추가되거나 갱신되었습니다.
- 테스트가 통과합니다.
- 린트 또는 정적 검사가 통과합니다.
- 외부 API와 도메인 모델이 분리되었습니다.
- 오류 상황이 처리되었습니다.
- 관련 문서가 필요한 경우 갱신되었습니다.
- 변경 범위가 요청과 일치합니다.

---

## 17. Agent Response Format

작업 완료 후 아래 형식으로 보고합니다.

```text
Summary
- 무엇을 구현했는지

Changed Files
- 파일별 주요 변경

Validation
- 실행한 테스트 및 결과

Notes
- 남은 위험 또는 후속 작업
```
