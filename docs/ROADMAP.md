# Roadmap

개발은 아래 마일스톤 순서로 진행합니다. 다음 마일스톤은 이전 마일스톤의
완료 조건을 확인하고 명시적으로 시작합니다.

## Milestone 0 — Foundation

목표: 누구나 저장소를 복제하고 개발 방식과 시작 방법을 이해할 수 있습니다.

- 저장소와 기본 디렉터리 구성
- 브랜치, 커밋 및 Pull Request 규칙
- Issue와 Pull Request 템플릿
- 개발 도구 버전과 로컬 환경 문서
- PostgreSQL 17 Docker Compose 기반
- 저장소 구성 검증 CI

상태: 완료

## Milestone 1 — Backend Foundation

목표: Java 21과 Spring Boot 3.5.x 기반 백엔드를 로컬과 CI에서 검증할 수
있습니다.

- Gradle 프로젝트와 Wrapper
- 기본 애플리케이션 구성
- PostgreSQL과 Flyway 연결
- 오류 응답과 헬스 체크 기반
- 테스트 및 정적 검증

상태: 완료

## Milestone 2 — Frontend Foundation

목표: Node.js 22 LTS와 Next.js 기반 프런트엔드를 로컬과 CI에서 검증할 수
있습니다.

- TypeScript strict mode
- Tailwind CSS와 기본 레이아웃
- 테스트, 린트와 타입 검사
- 로딩, 빈 상태 및 오류 상태 기반

상태: 완료

## Milestone 3 — Weather Integration

목표: 외부 날씨 공급자를 내부 계약으로 격리하고 시간대별 예보를 안정적으로
StellaAtlas 날씨 모델로 변환합니다.

- 날씨 공급자 인터페이스와 Adapter
- 시간대별 예보 변환
- 타임아웃, 오류 매핑과 캐싱

상태: 완료

## Milestone 4 — Astronomy Engine

목표: 위치와 로컬 날짜를 기준으로 관측 판단에 필요한 태양·달 정보를 명시적인
타임존과 함께 안정적으로 계산합니다.

- 일몰과 박명
- 월출, 월몰, 위상과 조도
- 위치 기반 타임존 처리

상태: 완료

## Milestone 5 — Observation Score

목표: 시간대별 날씨와 천문 조건을 설명 가능한 점수로 평가하고 가장 좋은 관측
시간 구간을 선택합니다.

- 독립적인 점수 규칙과 경계값
- 시간대별 점수와 이유
- 최적 관측 시간 선택
- 규칙 및 경계 테스트

상태: 완료

## Milestone 6 — Authentication Foundation

목표: 핵심 관측 조회의 비로그인 접근성을 유지하면서 OAuth2/OIDC와 Spring
Security 기반 인증 경계 및 프런트엔드 로그인 흐름을 준비합니다.

- Spring Security와 Google OIDC client 기반
- 공개 관측 API와 인증 사용자 API의 접근 경계
- 세션, CSRF, 현재 사용자 조회와 로그아웃
- 반응형 로그인·사용자·로그아웃 UI
- 환경변수 기반 provider 설정

상태: 완료

실제 Google Cloud OAuth 애플리케이션 등록과 사용자 데이터 영속화는 Milestone
7에서 진행합니다.

## Milestone 7 — OAuth Integration and Location Library

목표: StellaAtlas를 Google OAuth 애플리케이션으로 등록해 실제 사용자 로그인을
완성하고, 로그인 사용자가 자주 찾는 관측 위치를 다시 활용할 수 있게 합니다.

- Google Cloud OAuth 동의 화면과 Web client 등록
- 로컬·운영 redirect URI 및 비밀값 설정
- Google 계정과 내부 사용자 UUID 연결
- 관측 위치 즐겨찾기 등록·조회·삭제
- 최근 조회 위치 기록과 사용자별 목록
- 즐겨찾기·최근 위치에서 관측 조건 다시 조회
- 사용자별 소유권, 위치정보 최소화와 보존 정책
- 관측 기록 생성과 사용자별 목록

상태: 계획됨, 아직 시작하지 않음

## Milestone 8 — Deployment

- 운영 배포와 HTTPS
- 비밀 관리, 모니터링과 백업
- 개인정보처리방침과 이용약관

## Scope Policy

- 현재 마일스톤보다 앞선 기능은 명시적인 요청 없이 구현하지 않습니다.
- 마일스톤 범위를 변경하면 이 문서와 관련 결정을 함께 갱신합니다.
- 세부 기능과 우선순위는 Issue에서 관리하고 이 문서는 단계별 목표에
  집중합니다.
