# Planetarium Performance and Regression Budgets

## Scope

Milestone 9의 Three.js renderer는 천문 계산과 분리된 표시 계층입니다. 이 문서는
`/sky` route의 반복 가능한 정적 예산, runtime 품질 저하 정책과 대표 기기에서
확인할 상호작용 예산을 정의합니다.

## Automated budgets

| Metric | Budget | Verification |
|---|---:|---|
| `/sky` client JavaScript, raw | <= 1,200,000 bytes | `npm run test:planetarium-budget` |
| `/sky` client JavaScript, gzip | <= 350,000 bytes | `npm run test:planetarium-budget` |
| Bright-object scene | <= 128 objects | astronomy adapter regression test |
| Milky Way sampling | 72 points | astronomy adapter regression test |
| WebGL pixel ratio | <= 2 full, 1 reduced | renderer/component policy |

예산 검사는 production build의 client-reference manifest가 가리키는 실제 route
chunk를 중복 없이 합산합니다. `npm run build -- --webpack` 후 실행하며 예산을
넘으면 실패합니다.

2026-09-17 production build 측정값은 5개 chunk, raw 664,538 bytes, gzip
177,483 bytes로 두 JavaScript 예산을 통과했습니다.

## Runtime budgets

대표 desktop과 mobile에서 다음 기준을 사용합니다.

| Scenario | Desktop budget | Mobile budget |
|---|---:|---:|
| Drag/zoom/orientation frame time, p95 | <= 16.7 ms | <= 33.3 ms |
| Input-to-visible-update, p95 | <= 100 ms | <= 150 ms |
| Long task during 30-second interaction | none over 200 ms | none over 300 ms |
| Additional JS heap after enter/exit cycles | <= 15 MB | <= 20 MB |

실기기 측정은 production build에서 30초 드래그·확대, 60× 시간 재생, 검색·선택,
전체화면 진입·해제와 모션 입력을 순서대로 수행합니다. Chrome Performance panel의
frame/long-task/heap 기록과 Safari Web Inspector의 timeline을 사용합니다.

## Adaptive quality

- `prefers-reduced-motion: reduce`, 4GB 이하 device memory 또는 4개 이하 logical
  processor에서는 reduced 품질을 선택합니다.
- reduced 품질은 device pixel ratio를 1로 제한하고, 별·별자리 label 밀도를
  낮추면서 태양·달·행성과 선택 천체 label은 유지합니다.
- renderer는 최근 20~60회 render의 CPU submission p95가 viewport frame 예산을
  넘으면 현재 session을 자동으로 reduced 품질로 낮춥니다.
- WebGL 2 초기화나 context 유지 실패 시 Canvas 2D와 텍스트 목록으로 전환합니다.
- 시간 재생은 자동 시작하지 않으며 사용자 조작 후에만 실행합니다.

## Regression coverage

- 고정 좌표·절대 시각에서 Astronomy Engine scene과 은하수 표본이 결정적입니다.
- observer-space projection, label 밀도, 선택 강조와 hit-test 연결을 단위 테스트로
  고정합니다.
- 390px mobile과 desktop 상호작용, 전체화면, keyboard, fallback, 검색·선택과
  재생 동작을 component regression test로 검증합니다.
- release 후보에서는 위 runtime scenario를 대표 desktop과 mobile 실기기에서
  반복하고 결과를 변경 PR에 기록합니다.
