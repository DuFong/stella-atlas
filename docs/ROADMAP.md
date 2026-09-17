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
8에서 진행합니다.

## Milestone 7 — Observation Journal and Sky Simulation

목표: 사용자가 사진과 짧은 코멘트로 관측 게시물을 기기 안에 남기고, 선택한
위치와 시각의 밤하늘을 대화형 플라네타리움으로 미리 탐색할 수 있게 합니다.

### Local observation posts

- 이미지 파일 업로드와 지원 기기의 카메라 촬영
- EXIF에 촬영 시각이나 GPS가 있으면 초깃값으로 추출하고, 없으면 빈 값 유지
- 자동 입력된 촬영 위치·시각을 포함한 모든 필드의 사용자 수정
- 위도·경도, 시간대가 포함된 촬영 일시, 짧은 코멘트와 해시태그
- 게시물 정보와 이미지 Blob을 브라우저 IndexedDB에 로컬 저장
- 저장 용량 부족, 권한 거부, 지원하지 않는 파일과 메타데이터 누락 상태 처리
- 로컬 게시물 목록·상세·수정·삭제와 기기 외부로 전송되지 않는다는 안내
- 향후 서버 저장소로 교체할 수 있는 게시물·미디어 저장 port와 browser adapter

### Interactive sky simulation

- 좌표와 관측 시각을 입력으로 하는 대화형 밤하늘 화면
- 시간 이동, 방향 전환, 확대·축소, 주요 천체와 별자리 표시
- Canvas 2D를 지원하지 않거나 저사양인 환경의 명확한 대체 상태
- 플라네타리움 엔진을 프런트엔드 adapter 뒤에 격리
- Astronomy Engine 기반 태양·달·행성 계산과 자체 Canvas 하늘 투영
- 검토 가능한 소규모 밝은 별·대표 별자리 catalog
- catalog 확대 전 라이선스, 데이터 출처, 모바일 성능과 접근성 검증

완료 조건:

- 새로고침과 브라우저 재시작 후에도 동일 브라우저 프로필에서 로컬 게시물을
  다시 볼 수 있습니다.
- EXIF가 없거나 제거된 이미지도 사용자가 위치와 시각을 직접 입력해 저장할 수
  있습니다.
- 카메라 권한 거부와 저장 용량 부족이 데이터 손실 없는 오류 상태로 표시됩니다.
- 시뮬레이터가 동일 좌표·시각에 대해 일관된 하늘 상태를 표시합니다.
- 선택한 플라네타리움 엔진과 배포 의무가 ADR 및 제3자 고지에 기록됩니다.

상태: 완료

현재 구현: `/journal`에서 20MB 이하 이미지 선택, 카메라 촬영, EXIF 촬영 시각·
GPS 자동입력, 현재 위치 입력, 코멘트·해시태그와 로컬 목록·수정·삭제를 제공하며
metadata와 Blob을 하나의 IndexedDB 트랜잭션으로 저장합니다. `/sky`에서는 위치·
사용자 로컬 시각 선택, 태양·달·주요 행성, 밝은 별과 대표 별자리, 시간 이동, 방향 회전,
확대·축소를 제공합니다. 두 기능 모두 서버 저장 없이 브라우저에서 동작하며
저장소·엔진 adapter와 결정성·오류 상태 테스트를 포함합니다.

제외 범위: 서버 업로드, 기기 간 동기화, 공개 피드·좋아요·댓글, 사진 천체 분석,
센서 기반 AR 오버레이와 망원경 제어는 이 마일스톤에 포함하지 않습니다.

## Milestone 8 — OAuth Integration and Location Library

목표: StellaAtlas를 Google OAuth 애플리케이션으로 등록해 실제 사용자 로그인을
완성하고, 로그인 사용자가 자주 찾는 관측 위치와 관측 기록을 계정에 연결해
다시 활용할 수 있게 합니다.

- Google Cloud OAuth 동의 화면과 Web client 등록
- 로컬·운영 redirect URI 및 비밀값 설정
- Google 계정과 내부 사용자 UUID 연결
- 관측 위치 즐겨찾기 등록·조회·삭제
- 최근 조회 위치 기록과 사용자별 목록
- 즐겨찾기·최근 위치에서 관측 조건 다시 조회
- 사용자별 소유권, 위치정보 최소화와 보존 정책
- Milestone 7의 저장 port를 이용한 서버 관측 기록 생성과 사용자별 목록
- 서버 미디어 저장소 선택과 로컬 게시물 이전 정책은 별도 설계 후 구현

상태: 완료 (2026-08-24). 비밀값을 저장소 밖에서 주입한 로컬 Google OAuth
callback, 안정적인 내부 사용자 UUID, 소유자 범위 즐겨찾기 API와 UI를
완료했습니다. 최근 조회는 명시적 동의가 있을 때만 소수점 4자리 좌표를 최신
10개까지 저장하고 목록·전체 삭제·재사용을 지원합니다. 서버 관측 기록은 사진과
분리한 메타데이터 생성·목록·삭제로 제한했으며 서버 미디어와 로컬 이전은
후속 정책으로 보류했습니다.

## Milestone 9 — Immersive Planetarium

목표: Milestone 7의 정확하지만 식별하기 어려운 2D 천구 지도를, 실제 관측자가
지평선에서 하늘을 올려다보는 감각에 가까운 몰입형 플라네타리움으로
고도화합니다. 천체 위치 계산의 결정성과 기존 위치 라이브러리는 유지하면서
렌더링, 탐색과 천체 식별 경험을 개선합니다.

### Phase 1 — Renderer selection and WebGL foundation

- 현재 Canvas 2D 구현을 기준선으로 장면 복잡도, 번들 크기, 초기 로딩,
  프레임 성능과 모바일 입력을 측정
- Stellarium Web Engine은 AGPL source 제공 의무, WorldWide Telescope는 연구
  visualization 중심 범위와 기존 계산 port 중복 때문에 제품 후보에서 제외
- Three.js 기반 프로젝트 소유 renderer와 명시적인 lifecycle port 구현
- WebGL 2 미지원, 초기화 실패와 저성능 기기를 위한 fallback 전략 결정

ADR-023에서 Three.js 기반 프로젝트 renderer를 선택했습니다. 기존 Astronomy
Engine adapter가 계산의 source of truth를 유지하고, Three.js는 observer-space
투영과 GPU 렌더링만 담당합니다. Canvas 2D는 WebGL 초기화 실패 fallback으로
유지합니다.

### Phase 2 — Recognizable sky rendering

- 관측자 중심의 반구형 또는 원근 투영과 자연스러운 드래그·확대·축소
- 조작 버튼을 유지하는 전체화면 보기와 브라우저·viewport 기반 해제 경로
- 지평선, 방위, 관측 방향, 대기·박명 gradient와 선택 가능한 지상 실루엣
- 실제 등급과 색지수를 반영한 별 크기·밝기·색상 표현
- 은하수, 별자리 선·이름과 행성·달의 식별 가능한 시각 표현
- 확대 수준에 따른 label 밀도, 겹침 방지와 중요 천체 우선순위
- 천체 선택, 검색, 화면 중앙 정렬과 기본 정보 패널
- 시간 재생·일시정지와 현재 시각 복귀

### Phase 3 — Quality and accessibility

- 같은 위치·절대 시각에서 계산 결과가 기존 Astronomy Engine adapter와
  일치하는 결정성 테스트
- desktop·mobile의 대표 viewport와 입력 방식에 대한 시각 회귀 및 상호작용 테스트
- 실제 기기 측정으로 확정한 로딩·프레임·메모리 성능 예산
- `prefers-reduced-motion`, 키보드 조작, 명도 대비와 화면 밖 텍스트 천체 목록
- catalog·texture·landscape 출처, 라이선스와 attribution 문서화

완료 조건:

- 사용자가 별, 달과 주요 행성을 label 또는 선택 동작으로 쉽게 식별할 수 있습니다.
- 방향 전환, 확대·축소, 천체 검색·선택과 시간 재생이 desktop과 mobile에서
  동작합니다.
- 전체화면에서도 시간, 방향과 확대·축소 조작을 유지하고 명시적인 해제 수단을
  제공합니다.
- 지원하는 모바일 브라우저의 전체화면에서는 명시적인 권한 요청, 상대 방향 추적,
  재보정과 HTTPS·거부·미지원 안내를 갖춘 기기 모션 탐색을 제공합니다.
- 같은 입력에 대한 천체 위치는 기존 계산 엔진과 일관되고 렌더러 교체가 domain
  계약을 변경하지 않습니다.
- 합의한 성능 예산과 접근성 fallback을 테스트로 검증합니다.
- 채택한 renderer, catalog와 모든 시각 asset의 배포 의무가 ADR 및
  `THIRD_PARTY_NOTICES.md`에 기록됩니다.

제외 범위: 카메라 영상을 합성하는 센서 기반 AR, 망원경 제어, 천체사진 plate solving, 우주 비행
시뮬레이션, 자체 대규모 catalog backend, 운영 배포는 포함하지 않습니다.

상태: 완료 (2026-09-17). Three.js 기반 프로젝트 renderer, Canvas fallback,
관측자 중심 탐색, 전체화면·모션 입력, 천체 검색·선택·중앙 정렬, 우선순위 label,
시간 재생, procedural 은하수·대기·지상 단서와 adaptive 품질 정책을 구현했습니다.
결정성·상호작용·fallback 회귀 테스트와 production route JavaScript 예산을
자동화했고 대표 viewport Chrome visual smoke를 확인했습니다. release 후보의
실기기 runtime 측정은 `docs/PLANETARIUM_PERFORMANCE.md` 절차로 반복합니다.

## Milestone 10 — Deployment

상태: 시작 전. Milestone 9 완료 후 명시적으로 착수합니다.

- 운영 배포와 HTTPS
- 비밀 관리, 모니터링과 백업
- 개인정보처리방침과 이용약관

## Scope Policy

- 현재 마일스톤보다 앞선 기능은 명시적인 요청 없이 구현하지 않습니다.
- 마일스톤 범위를 변경하면 이 문서와 관련 결정을 함께 갱신합니다.
- 세부 기능과 우선순위는 Issue에서 관리하고 이 문서는 단계별 목표에
  집중합니다.
