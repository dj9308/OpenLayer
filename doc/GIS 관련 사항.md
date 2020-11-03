# GIS 관련 사항

## GIS(Geographic Information System)

- 지도 및 지리정보를 컴퓨터로 관리하고, 여기서 얻은 지리정보를 기초로 데이터를 수집 분석 가공해 지형과 관련된 모든 분야에 적용하기 위해 설계된 종합 정보 시스템.

## GIS 구성요소

### Spatial Analysis(공간 분석)

- 지도 위에 표시한 요소들을 목적에 맞게 처리해 해석하는 작업
- 여기서 말하는 공간은 X,Y 좌표상의 공간(Spatial O space X)
- 데이터의 속성에 따라 인구의 밀집, 시설 위치, 범죄율, 이동 경로, 통계분석 결과 표현한다.
- GIS tool을 사용해 공간 통계 분석도 가능하다.
- 주로 vector 데이터로 분석이 이루어진다.
- EX: 피난 경로 탐색, 기온 분포, 재난 발생률 표현

### Image Analysis(Remote Sensing, 원격 탐사)

- 주로 인공위성을 이용해 원격으로 탐사하는 작업
- 위성이 보낸 자료를 이용해 Remote Sensing 분석을 시행한다.
- EX: 지표면의 식생, 기온 변화, 사막화 등

### 데이터베이스 구축/관리

- DB를 구축해 지리 관련 정보들을 CRUD하는 작업.

### Customize Development(개발)

## Map Service 종류

- WMS
  - Web Map Service의 약자.
  - 전문 GIS 소프트웨어로 지도를 게시하는 방법
  - 지도 타일방식과 유사하며, 웹지도에 적합하진 않다.(출처: leaflet)
  - HTTP 프로토콜이 적용되며, 이미지로 받는다.
  - function : GetCapabilities, GetMap
- TMS : Tile Map Service를 의미한다. 웹 맵에 더 중점을 둔 맵 타일링 표준.(ex: leaflet의 L.TileLayer)
- WMTS : Web Map Tile Service를 의미한다. 지도 타일의 표준 프로토콜이다.

## GIS 데이터

- 레스터 데이터 

  - 항공사진과 같이 실세계를 열과 행(또는 Cell)로 배치된 화소들의 배열로 구성된 영상.
  - Mesh data: 망, 격자를 뜻하며 국토를 일정 크기로 나눈 것.(레스터 데이터와 다름).

- 벡터 데이터

  -  탐방로, 공원 경계와 같이 실세계를 점과 배지어 곡선을 이용해서(Vector) 테두리와 내부를 채워 만든 자료.

  - 좌표계로 모든 지도에 오버랩이 가능해진다.(좌표 설정화)

  - 벡터 데이터에서 실세계는 아래와 같은 3가지 유형으로 구분될 수 있다.

    - point : 우물과 같이 점형태의 자료.
    - polyline : 강과 같이 선 형태의 자료.
    - polygon : 호수와 같이 면 형태로 구성되는 자료.
    - ![img](https://t1.daumcdn.net/cfile/blog/0274054051B96FE434)

  - 벡터 데이터는 GIS에서 Shape File 이라는 특성화된 파일 포맷을 사용하고 있다.(.shp)

    - 쉐이프 파일 포맷은 지리적으로 참조된 feature들의 geometry와 attribute를 정의한다.
    - feature : 지도에 표시될 수 있는 실세계의 객체
    - record : 각 feature에 대하여 기록된 데이터
    - geometry : 특정 데이터의 좌표. 즉 기하학적 위치를 말한다.  
    - attribute : geometry와 맞물려 저장되는 속성정보(변수)
      -  sql의 record와 attribute로 생각하면 쉽다.
    - EX): geometry: 좌표 / attribute: 조사자, 조사날짜, 유형, etc

  - #### 확장자 포맷 (*.shp, *.shx, *.dbf, *.prj, *.sbn, *.sbx, *.xml)

    - *.shp: 피처 지오메트리를 저장하는 주요 파일이다.
    - *.dbf: 피처 어트리뷰트를 저장하는 dBASE 테이블로써, 엑셀에서도 열어볼 수 있다.*
    - .shx: 피처 지오테트리의 색인(index)을 저장하는 인덱스 파일이다.
    - **.prj** : 좌표계 정보를 저장하는 파일. 
      - 좌표계가 지정되지 않은 파일은 .prj가 존재하지 않으며, 파일을 전송할 때 이 파일을 누락하면 상대방이 좌표계를 즉시 확인할 수 없다.
    - *.sbn과 *.sbx: feature의 공간 인덱스(spatial index)를 저장한다.
    - *.xml: 쉐이프 파일에 대한 정보를 저장하는 메타데이터(Metadata) 파일로 ArcGIS에서 사용된다.
    - *.cpg : Shape 파일 중 코드페이지를 나타낸다.

## GeoServer

### 정의 및 하는 일

- 다양한 공간 Data를 인터넷 GIS 인터페이스로 공급하는 서버 프로그램
- 잘 다듬어진 자료를 웹에서 예쁘게 서비스 한다.
- ![6 GeoServer WMS WFS WCS Vector Source Raster Source Formatted Map Feature Object Coverage Data png, jpeg, gif GML, GeoJSON...](https://image.slidesharecdn.com/day4geoserver-140724211518-phpapp01/95/open-source-gis-4-geoserver-2014-7-6-1024.jpg?cb=1406236720)

### 특징

- 사용 편한 UI 제공
- java 기반이기 때문에, OS에 구애받지 않음(JVM 때문에)
- 캐시 지원
- 다양한 좌표계로 실시간 변환 가능
- 거의 모든 GIS 자료 이용 가능
- 데이터 가공 가능

### interface 종류

#### WMS(Web Map service)

#### WFS(Web Feature Service)

- 지리적 Feature 인터페이스
- feature 요청, catalog 조회, 속성조회 가능
- HTTP 프로토콜이 적용되며, XML,GeoJSON 등으로 응답받음.
- function : GetCapabilities, DescribeFeatureType, GetFeature

#### WCS(Web Coverage Service)

- 커버리지 인터페이스 표준
- coverage 요청, catalog 조회 가능
- HTTP 프로토콜이 적용되며, 레스터 파일로 받음
- function: GetCapabilities, DescribeCoverage, GetCoverage
- Coverage = 좌표가 있는 레스터 데이터

## geoJSON

### 특징

- 위치정보를 갖는 point를 기반으로 체계적으로 지형을 표현하기 위해 설계된 개방형 공개 표준 형식이다.
- JSON를 사용하는 파일 포맷이다.
- vector로 만들어진 point, polyline, polygon 형태로 표현된다.

## 관련 단어 및 tool

- OGC : 민간 GIS 영리 단체
- QGIS : 공간데이터 생산/편집 도구. 서비스 할 원본 데이터를 만들어 낸다.
- PostGIS : 공간데이터 관리도구. 다듬어진 공간데이터를 효과적으로 관리하고 조건에 맞는 데이터를 제공한다.
- 좌표 : 위도(Longitude) / 경도(Lattitude) / 고도(x)

## 라이브러리 종류

- OpenLayers : Leaflet에 비해 오래됐으며 관련 정보가 많다.
- Leaflet : OpenLayers보다 늦게 개발됐지만, 구조가 단순하고 알기 쉽다.



#### 참고문서

[GIS 데이터](http://blog.daum.net/geoscience/480)

[geoserver](https://www.slideshare.net/jangbi882/open-source-gis-4-geoserver-2014-7)