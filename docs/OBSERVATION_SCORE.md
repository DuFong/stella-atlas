# Observation Score

## Status

Milestone 5의 초기 규칙 기반 관측 점수 정책을 구현했습니다. 임계값이나
영향도를 변경할 때 이 문서와 경계 테스트를 함께 수정해야 합니다.

## Purpose

관측 점수는 특정 위치와 시간의 날씨·천문 조건을 사용자가 빠르게 이해할 수
있는 결과로 변환합니다. 점수만 제공하지 않고 추천 여부, 등급과 이유를 함께
반환해야 합니다.

## Contract

- 점수 범위는 0~100이며 최소값과 최대값을 항상 보장합니다.
- 동일한 입력은 동일한 결과를 반환합니다.
- 각 시간대에 독립적으로 점수를 계산할 수 있어야 합니다.
- 모든 주요 가점과 감점에는 안정적인 코드, 영향도와 사용자 메시지가
  있어야 합니다.
- 알 수 없는 필수 데이터를 임의의 정상값으로 간주하지 않습니다.
- 외부 API DTO나 Controller DTO를 점수 정책에 전달하지 않습니다.
- 하나의 거대한 조건문 대신 독립적인 규칙이나 정책을 조합합니다.

결과 형태:

```json
{
  "score": 82,
  "grade": "GOOD",
  "recommended": true,
  "reasons": [
    {
      "code": "MODERATE_CLOUD_COVER",
      "impact": -10,
      "message": "구름이 조금 예상됩니다."
    }
  ]
}
```

## Score Model

- 각 시간대는 기준점수 100에서 시작합니다.
- 각 독립 규칙은 최대 하나의 감점 이유를 반환합니다.
- 모든 감점을 합산한 뒤 결과를 0~100으로 제한합니다.
- 유의미한 감점이 없으면 `IDEAL_CONDITIONS` 이유를 영향도 0으로 제공합니다.
- 현재 정책은 가점을 사용하지 않습니다.

### Cloud Cover

| Cloud cover | Impact | Reason code |
|---:|---:|---|
| 0~20% | 0 | - |
| >20~40% | -10 | `MODERATE_CLOUD_COVER` |
| >40~70% | -25 | `HIGH_CLOUD_COVER` |
| >70~100% | -45 | `VERY_HIGH_CLOUD_COVER` |

### Precipitation Probability

| Probability | Impact | Reason code |
|---:|---:|---|
| 0~10% | 0 | - |
| >10~30% | -10 | `MODERATE_PRECIPITATION_RISK` |
| >30~60% | -25 | `HIGH_PRECIPITATION_RISK` |
| >60~100% | -45 | `VERY_HIGH_PRECIPITATION_RISK` |

### Visibility

| Visibility | Impact | Reason code |
|---:|---:|---|
| >= 15 km | 0 | - |
| >= 10 km and < 15 km | -5 | `MODERATE_VISIBILITY` |
| >= 5 km and < 10 km | -15 | `LOW_VISIBILITY` |
| < 5 km | -30 | `VERY_LOW_VISIBILITY` |

### Humidity

| Humidity | Impact | Reason code |
|---:|---:|---|
| 0~70% | 0 | - |
| >70~85% | -5 | `HIGH_HUMIDITY` |
| >85~95% | -15 | `VERY_HIGH_HUMIDITY` |
| >95~100% | -25 | `EXTREME_HUMIDITY` |

### Wind

| Wind speed | Impact | Reason code |
|---:|---:|---|
| 0~3 m/s | 0 | - |
| >3~6 m/s | -5 | `MODERATE_WIND` |
| >6~10 m/s | -15 | `STRONG_WIND` |
| >10 m/s | -25 | `VERY_STRONG_WIND` |

### Moonlight

달이 지평선 아래에 있거나 조도가 25% 이하이면 감점하지 않습니다.

| Illumination while above horizon | Impact | Reason code |
|---:|---:|---|
| >25~50% | -4 | `MODERATE_MOONLIGHT` |
| >50~75% | -8 | `BRIGHT_MOONLIGHT` |
| >75~100% | -12 | `VERY_BRIGHT_MOONLIGHT` |

MVP는 달의 실제 고도 대신 월출·월몰과 극지방 상태로 지평선 위 여부를
판단합니다.

### Twilight

| Phase | Impact | Reason code |
|---|---:|---|
| Dark | 0 | - |
| Astronomical twilight | -10 | `ASTRONOMICAL_TWILIGHT` |
| Nautical twilight | -25 | `NAUTICAL_TWILIGHT` |
| Civil twilight | -45 | `CIVIL_TWILIGHT` |
| Daylight | -100 | `DAYLIGHT` |

백야·극야는 계산된 `ALWAYS_ABOVE`와 `ALWAYS_BELOW` 상태를 그대로 사용하며,
존재하지 않는 일출·일몰 시각을 만들지 않습니다.

## Grade and Recommendation

| Score | Grade |
|---:|---|
| 85~100 | `EXCELLENT` |
| 70~84 | `GOOD` |
| 50~69 | `FAIR` |
| 0~49 | `POOR` |

`recommended`는 점수가 70 이상이고 천문박명이 끝난 완전한 밤(`DARK`)일 때만
참입니다. 박명 중 점수가 높더라도 관측 추천 시간으로 선택하지 않습니다.

## Observation Window

- 요청 날짜의 로컬 정오부터 다음 날 로컬 정오 직전까지를 하나의 관측일로
  평가합니다.
- 연속된 추천 시간대를 후보 구간으로 묶고 마지막 시간 슬롯에서 한 시간을
  더한 값을 종료 시각으로 사용합니다.
- 평균 점수가 가장 높은 구간을 선택합니다.
- 평균 점수가 같으면 더 긴 구간, 길이도 같으면 더 이른 구간을 선택합니다.
- 추천 시간대가 하나도 없으면 `bestWindow`는 `null`입니다.

## Missing Data and Messages

- 점수에 필요한 날씨 필드는 공급자 Adapter에서 모두 검증합니다.
- 날씨와 천문 시간대가 불일치하거나 관측창의 시간대별 데이터가 없으면 정상
  점수를 만들지 않고 `OBSERVATION_DATA_UNAVAILABLE` 오류를 반환합니다.
- 이유 코드는 영어의 안정적인 식별자이며 현재 사용자 메시지는 한국어로
  제공합니다. 다국어 처리는 별도 현지화 계층이 도입될 때 분리합니다.

## Required Tests

- 각 독립 규칙의 경계값
- 0과 100 범위 고정
- 동일 입력의 결정성
- 여러 규칙 조합
- 누락되거나 예상 밖인 공급자 값
- 등급과 추천 경계
- 이유 코드, 영향도와 메시지
- 자정을 넘는 최적 구간과 동점 선택

가중치나 임계값을 변경할 때 이 문서와 관련 테스트를 함께 수정합니다.
