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

- Status: Proposed
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
