# Contributing to StellaAtlas

이 문서는 사람이 StellaAtlas에 기여할 때 필요한 절차를 요약합니다. AI
에이전트는 이 문서와 함께 `AGENTS.md`를 반드시 따릅니다.

## Before Starting

1. 현재 마일스톤과 작업 범위를 `AGENTS.md`에서 확인합니다.
2. `AGENTS.md`에 명시된 순서로 관련 문서를 읽습니다.
3. 기존 Issue가 있는지 확인하고 작업 목표와 완료 조건을 정의합니다.
4. `main`이 최신이고 작업 트리가 깨끗한지 확인합니다.

현재 마일스톤보다 앞선 기능은 명시적인 합의 없이 구현하지 않습니다.

## Branches

`main`에 직접 커밋하지 않습니다. 다음 접두사 중 하나를 사용하고 소문자와
하이픈으로 작업 내용을 표현합니다.

```text
feature/
fix/
docs/
refactor/
test/
build/
ci/
chore/
```

예:

```text
build/backend-initialization
docs/clarify-local-setup
ci/add-foundation-checks
```

## Changes

- 하나의 브랜치와 Pull Request에는 하나의 논리적 변경만 포함합니다.
- 기존 구조와 문서화된 결정을 우선합니다.
- 비밀값과 `.env` 파일을 커밋하지 않습니다.
- 새 의존성은 기존 도구로 해결할 수 없는지 검토하고 도입 이유를 기록합니다.
- 공개 API, 아키텍처 또는 주요 기술 결정을 변경하면 관련 문서와
  `docs/DECISIONS.md`를 갱신합니다.
- 테스트를 삭제하거나 검증을 약화해 실패를 우회하지 않습니다.

## Commits

Conventional Commits 형식을 사용합니다.

```text
<type>(<optional-scope>): <description>
```

설명은 영어 명령형 소문자로 작성하고 마침표를 붙이지 않습니다.

```text
build(backend): initialize Spring Boot application
docs: clarify local development setup
ci: validate foundation configuration
```

허용하는 type은 `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`,
`ci`, `perf`, `chore`입니다.

## Verification

변경한 영역에 존재하는 검증 명령만 실행합니다. 아직 생성되지 않은 모듈이나
스크립트의 명령을 임의로 만들지 않습니다.

현재 Foundation 단계의 기본 검증:

```bash
docker compose config --quiet
```

애플리케이션 모듈이 초기화된 후에는 `AGENTS.md`의 Backend 및 Frontend 검증
명령을 사용합니다.

## Pull Requests

Pull Request 제목은 커밋과 같은 형식을 사용합니다. 본문에는 다음 내용을
포함합니다.

- 변경 목적과 주요 구현
- 영향받는 모듈
- 설계 판단과 고려한 대안
- 실행한 검증과 결과
- 문서 변경
- 알려진 제한이나 위험
- UI 변경 시 스크린샷

검증을 실행하지 못했다면 생략하지 말고 이유를 적습니다.
