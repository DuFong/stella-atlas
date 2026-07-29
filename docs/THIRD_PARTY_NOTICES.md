# Third-Party Notices

이 문서는 StellaAtlas가 직접 사용하는 라이브러리 중 별도 데이터 출처 표기나
주요 라이선스 확인이 필요한 항목을 기록합니다. 전체 전이 의존성 목록을
대체하지 않습니다.

## Commons SunCalc

- Component: `org.shredzone.commons:commons-suncalc:3.11`
- Purpose: 태양과 달의 위치, 출몰 시각, 위상 및 조도 계산
- License: Apache License 2.0
- Project: <https://shredzone.org/maven/commons-suncalc/>

## TimeShape

- Component: `net.iakovlev:timeshape:2026b.29`
- Purpose: 위도·경도를 IANA 시간대로 해석
- Code license: MIT License
- Project: <https://github.com/RomanIakovlev/timeshape>

TimeShape에 포함된 시간대 경계 데이터는
[timezone-boundary-builder](https://github.com/evansiroky/timezone-boundary-builder)
에서 생성되며 OpenStreetMap 데이터를 기반으로 합니다. 해당 데이터는 Open
Data Commons Open Database License(ODbL)를 따릅니다.
