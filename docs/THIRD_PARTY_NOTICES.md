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

은하수는 외부 texture 없이 Galactic-to-ICRS 회전과 Astronomy Engine의 지평
좌표 변환으로 생성한 procedural ribbon입니다. 대기 gradient와 지상 실루엣도
프로젝트 CSS/geometry이므로 별도 시각 asset을 배포하지 않습니다.

서버 렌더링과 확장 catalog 로딩 실패 시 사용하는 30개 핵심 항성의 J2000 좌표와
밝기 값은 SIMBAD에서 확인한 부분집합입니다. SIMBAD 서비스 데이터는 ODbL로
제공되며, 이 제품은 SIMBAD database operated at CDS, Strasbourg, France를
사용했음을 고지합니다.

- SIMBAD: <https://simbad.cds.unistra.fr/simbad/>
- SIMBAD reference: Wenger et al. 2000, A&AS, 143, 9

## HYG Database

- Component: HYG Database 4.1의 6.5등급 이하 항성 부분집합
- Purpose: J2000 적경·적위, 겉보기 등급, 색지수, HIP 및 Bayer/Flamsteed 식별자
- License: Creative Commons Attribution-ShareAlike 4.0
- Project: <https://github.com/astronexus/HYG-Database>
- Snapshot: `c7f7f883fe678cc7680169a50ccd7dcc49b060ce`

StellaAtlas가 배포하는 `star-catalog.json`은 HYG 4.1의 파생 데이터입니다.
한국어로 별도 관리하던 30개 대표 항성 이름과 표시 색상 정책을 적용하고, 나머지
항성의 색은 HYG 색지수로부터 프로젝트가 계산합니다.

## OpenNGC

- Component: OpenNGC의 은하·성운·성단 부분집합
- Purpose: 심원천체 J2000 좌표, 종류, 밝기, 겉보기 크기와 교차 식별자
- License: Creative Commons Attribution-ShareAlike 4.0
- Project: <https://github.com/mattiaverga/OpenNGC>
- Snapshot: `da90466031b0372c896588b85be6016c617e205b`

`deep-sky-catalog.json`은 지원 종류 중 Messier 식별자나 일반 이름이 있거나
겉보기 V등급이 10 이하인 행을 추린 OpenNGC 파생 데이터입니다. 일부 대표
Messier 천체의 한국어 표시 이름은 프로젝트가 관리합니다.

## Stellarium Western Sky Culture

- Component: Western sky-culture constellation line data
- Purpose: 88개 별자리의 HIP 기반 연결선
- Data license: upstream-declared Creative Commons Attribution-ShareAlike
- Project: <https://github.com/Stellarium/stellarium-skycultures/tree/master/western>
- Snapshot: `014fbb5e59233d133c22f9811af96b67d05a95c9`

Stellarium Web Engine이나 AGPL 코드를 포함하지 않으며, `western/index.json`에서
별자리 HIP 연결선만 변환합니다. 삽화와 설명문은 배포하지 않습니다. 한국어
별자리 이름은 프로젝트가 관리합니다.

정확한 입력 checksum, 선택 기준과 재생성 절차는 `docs/PLANETARIUM_CATALOGS.md`에
기록합니다.

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
