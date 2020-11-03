# openLayers 소스 관련

## 기본 map 객체 및 레이어 생성

- ```javascript
  var map = new ol.Map({  //객체 생성 부분. 파라미터로 JSON을 받는다.
    layers: [
      new ol.layer.Tile({ //기본 레이어 타일 생성
        source: new ol.source.OSM(),  // 레이어 종류(OSM) 지정
      }),
      vectorLayer ],  // 벡터 설정(없으면 패쓰)
    target: 'map',	// HTML id가 map인 div 태그에 지도 구현한다는 뜻
    view: new ol.View({	// 처음 위치, 줌 등 변수 설정
      center: [0, 0],
      zoom: 2,
    }),
  });
  ```

## geoJSON

- Polygon -multiPolygon : 삼각형 / 다각형

- ```javascript
  
  var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()]; // geoJSON의 type를 styles 인덱스에 넣어서 매칭되는 스타일을 넣는 것.
  };
  
  var vectorSource = new ol.source.Vector({	// 벡터 소스 객체 생성
    //geoJSON을 읽는 함수
    features: new ol.format.GeoJSON().readFeatures(geojsonObject),
  });
  // 따로 벡터 추가하는 함수
  vectorSource.addFeature(new ol.Feature(new ol.geom.Circle([5e6, 7e6], 1e6)));
  
  var vectorLayer = new ol.layer.Vector({ // 벡터 레이어 객체 생성
    source: vectorSource,	// 좌표에 따른 벡터소스 생성
    style: styleFunction, // 벡터의 스타일 설정(도형마다 따로 적용 가능)
  });
  
  var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),  // 기본 레이어 생성
      }),
      vectorLayer ],  // 벡터 설정
    target: 'map',
    view: new ol.View({
      center: [0, 0],
      zoom: 2,
    }),
  });
  ```



### 참고문서

[외부 geoJSON 적용](https://lts0606.tistory.com/206)