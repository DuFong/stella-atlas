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

## Astronomy Engine

- Component: `astronomy-engine:2.1.19`
- Purpose: 프런트엔드 밤하늘 시뮬레이션의 태양·달·행성 위치와 지평 좌표 계산
- License: MIT License
- Project: <https://github.com/cosinekitty/astronomy>

초기 밝은 별과 대표 별자리 목록은 대규모 제3자 sky-culture bundle을 포함하지
않는 검토 가능한 프로젝트 데이터로 유지합니다. catalog를 확대할 때 각 데이터
출처, 재배포 조건과 attribution을 이 문서에 추가합니다.

## Three.js

- Component: `three:0.186.0`
- Purpose: 프로젝트 소유 플라네타리움의 WebGL 2 scene, camera, GPU buffer와 shader 관리
- License: MIT License
- Project: <https://threejs.org/>
- Source: <https://github.com/mrdoob/three.js>

Three.js는 천체 위치를 계산하거나 catalog와 시각 asset을 제공하지 않습니다.
StellaAtlas의 Astronomy Engine 결과를 화면에 투영하는 renderer 기반으로만
사용하며 catalog, texture와 landscape의 출처는 별도로 기록합니다.

## exifr

- Component: `exifr:7.1.3`
- Purpose: 업로드한 JPEG·HEIC 이미지의 EXIF 촬영 시각과 GPS 좌표 추출
- License: MIT License
- Project: <https://github.com/MikeKovarik/exifr>

브라우저 권장 lite bundle을 사용합니다. EXIF 값은 편집 가능한 입력 초깃값으로만
사용하며 손상되었거나 지원되지 않는 형식의 metadata는 빈 값으로 처리합니다.

## fake-indexeddb

- Component: `fake-indexeddb:6.2.5` (development only)
- Purpose: 브라우저 IndexedDB adapter의 자동화 테스트
- License: Apache License 2.0
- Project: <https://github.com/dumbmatter/fakeIndexedDB>
