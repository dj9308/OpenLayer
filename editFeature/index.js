const raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

const sourceDrawnPolygons = new ol.source.Vector({ wrapX: false });
const sourceDrawnLines = new ol.source.Vector({ wrapX: false });

const drawnPolygons = new ol.layer.Vector({
  source: sourceDrawnPolygons,
  style: drawnStyle
});

const drawnLines = new ol.layer.Vector({
  source: sourceDrawnLines
});

let select = new ol.interaction.Select();

let translate = new ol.interaction.Translate({
  features: select.getFeatures(),
});

const map = new ol.Map({
  layers: [raster, drawnPolygons, drawnLines],
  target: 'map',
  view: new ol.View({
    center: [-11000000, 4600000],
    zoom: 14
  })
});

let pressedButton;
let selectedFeatures = [];

function selectAndDrag() {
  map.addInteraction(select);
  map.addInteraction(translate);
  map.removeInteraction(draw);

  select.on('select',function(e){
    console.log("hello");
    const selected = e.selected;
    const deSelected = e.deselected;
    if(selected.length!==0){
      selected.forEach(function(feature){
        selectedFeatures.push(feature);
      });
    }
    
    if(deSelected.length!==0){
      deSelected.forEach(function(feature){
        selectedFeatures.pop(feature);
      });
    }
    console.log(selectedFeatures);
  });

  translate.on('translateend',function(e){
    e.features.forEach(function (feature,index) {
      console.log(feature.getGeometry().getCoordinates());
    });
  });
}

function mergePolygons(){
  if(selectedFeatures.length>=1){
    let selectedGeoJSON = FormatGeoJSON.writeFeatureObject(selectedFeatures[0], { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    let selectedPolygon = turf.polygon(selectedGeoJSON.geometry.coordinates);
    let mergedPolygon = selectedPolygon;

    selectedFeatures.forEach(function(feature){
      selectedGeoJSON = FormatGeoJSON.writeFeatureObject(feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      selectedPolygon = turf.polygon(selectedGeoJSON.geometry.coordinates);
      mergedPolygon = turf.union(mergedPolygon,selectedPolygon);
      sourceDrawnPolygons.removeFeature(feature);
    });
    selectedFeatures=[];
    mergedPolygon = FormatGeoJSON.readFeatures(mergedPolygon, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    sourceDrawnPolygons.addFeatures(mergedPolygon);
  }
}

function addInteraction(button) {
  const value = button.value;
  pressedButton = button;
  button.style.backgroundColor = '#A8D3EE';
  if (draw != null) {
    map.removeInteraction(draw);
    map.removeInteraction(select);
    map.removeInteraction(translate);
  }

  draw = new ol.interaction.Draw({
    source: (value == 'Polygon') ? sourceDrawnPolygons : sourceDrawnLines,
    type: value
  });
  map.addInteraction(draw);
  draw.once('drawend', drawEnd);

  // 그린 line feature마다 snap 적용
  let snap = new ol.interaction.Snap({source: drawnPolygons.getSource()});
  map.addInteraction(snap);
}

const cutIdPrefix = 'cut_';
let draw = null;
let snap = null;
let FormatGeoJSON = new ol.format.GeoJSON;
let polygons = [];
let features = [];

const defaultStyle = new ol.layer.Vector().getStyle()();

// const highlightStyle = new ol.style.Style({
//   fill: new ol.style.Fill({
//     color: 'rgba(255,255,255,0.9)',
//   }),
//   stroke: new ol.style.Stroke({
//     color: '#3399CC',
//     width: 3,
//   }),
//   text: new ol.style.Text({
//     font: 'bold 15px "Open Sans", "Arial Unicode MS", "sans-serif"',
//     overflow: true,
//     fill: new ol.style.Fill({
//       color: '#000',
//     }),
//     stroke: new ol.style.Stroke({
//       color: '#fff',
//       width: 3,
//     }),
//   }),
// });

const side1CutStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: [0, 255, 0, 0.8],
    width: 1
  }),
  fill: new ol.style.Fill({
    color: [0, 255, 0, 0.2],
  })
});

const side2CutStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: [255, 0, 0, 0.8],
    width: 1
  }),
  fill: new ol.style.Fill({
    color: [255, 0, 0, 0.2],
  })
});


// id 설정 및 style 설정 : map이 실행되면 실행되는 기본 함수
function drawnStyle(feature) {
  let id = feature.get('id');
  if (typeof (id) !== 'undefined') {
    id = id.substring(0, (cutIdPrefix.length + 1))
  }
  if (id == cutIdPrefix + '1')
    return side1CutStyle;
  else if (id == cutIdPrefix + '2')
    return side2CutStyle;
  else {
    return defaultStyle;
  }
}

function startCutting() {
  const lineFeatures = drawnLines.getSource().getFeatures();

  for (let i = 0; i < lineFeatures.length; i++) {
    const drawnGeoJSON = FormatGeoJSON.writeFeatureObject(lineFeatures[i], { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    const drawnGeometry = turf.getGeom(drawnGeoJSON);
    let newFeatures = [];

    features.forEach(function (feature,index) {
      const convertedGeoJSON = FormatGeoJSON.writeFeatureObject(feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      const convertedGeometry = turf.getGeom(convertedGeoJSON);
      const cutPolygon = polygonCut(convertedGeometry, drawnGeometry, cutIdPrefix);
      if (cutPolygon != null) {
        // 자른 polygon 배열에 삽입 후 그리기
        cutFeatures = FormatGeoJSON.readFeatures(cutPolygon, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        sourceDrawnPolygons.addFeatures(cutFeatures);
        cutFeatures.forEach(function (feature,index) {
          newFeatures.push(feature);
        });
        sourceDrawnPolygons.removeFeature(feature);
      }
      else {
        //잘려진 도형이 없을 경우, 기존 feature 삽입
        newFeatures.push(feature);
      }
    });
    features = newFeatures;
    drawnLines.getSource().removeFeature(lineFeatures[i]);
  }
}

function drawEnd(e) {
  // drawnGeoJSON : openlayers와 turf의 geoJSON 연결 부분
  const drawnGeoJSON = FormatGeoJSON.writeFeatureObject(e.feature, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
  const drawnGeometry = turf.getGeom(drawnGeoJSON);

  // polygon 그린 후 배열에 추가
  if (drawnGeometry.type == 'Polygon') {
    sourceDrawnPolygons.once('addfeature',function(evt){
      sourceDrawnPolygons.removeFeature(evt.feature);

      //꼬인 다각형 나눠서 저장
      const unkinked = turf.unkinkPolygon(drawnGeometry);
      turf.geomEach(unkinked, function (geometry) {
        feature = FormatGeoJSON.readFeatures(geometry, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
        sourceDrawnPolygons.addFeatures(feature);
        features.push(feature[0]);
      });
    });
  }

  map.removeInteraction(draw);
  map.removeInteraction(select);
  map.removeInteraction(translate);
  pressedButton.style.backgroundColor = '';
  pressedButton.blur();
}

function polygonCut(polygon, line, idPrefix) {
  const THICK_LINE_UNITS = 'kilometers';
  const THICK_LINE_WIDTH = 0.001;
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect;
  let thickLineString, thickLinePolygon, clipped, polyg, intersect;
  let polyCoords = [];
  let cutPolyGeoms = [];
  let cutFeatures = [];
  let offsetLine = [];
  let retVal = null;

  // 에외사항 처리
  if (((polygon.type != 'Polygon') && (polygon.type != 'MultiPolygon')) || (line.type != 'LineString')) {
    return retVal;
  }

  if (typeof (idPrefix) === 'undefined') {
    idPrefix = '';
  }

  // line 중 단 하나의 point라도 polygon 안에 없을 때
  intersectPoints = turf.lineIntersect(polygon, line);
  if (intersectPoints.features.length == 0) {
    return retVal;
  }

  // var lineCoords = turf.getCoords(line);
  // if ((turf.booleanWithin(turf.point(lineCoords[0]), polygon) ||
  //   (turf.booleanWithin(turf.point(lineCoords[lineCoords.length - 1]), polygon)))) {
  //   return retVal;
  // }

  //  추가된 선 생성
  offsetLine[0] = turf.lineOffset(line, THICK_LINE_WIDTH, { units: THICK_LINE_UNITS });
  offsetLine[1] = turf.lineOffset(line, -THICK_LINE_WIDTH, { units: THICK_LINE_UNITS });


  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    polyCoords = [];

    // 선의 좌표 삽입
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j]);
    }

    // 그려진 선으로 새로운 Polygon형식의 lineString 생성
    for (j = (offsetLine[forCut].geometry.coordinates.length - 1); j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
    }
    polyCoords.push(line.coordinates[0]);

    // lineString을 polygon 형태로 변환
    thickLineString = turf.lineString(polyCoords);
    thickLinePolygon = turf.lineToPolygon(thickLineString);
    clipped = turf.difference(polygon, thickLinePolygon);
    console.log(clipped);

    cutPolyGeoms = [];
    for (j = 0; j < clipped.geometry.coordinates.length; j++) {
      if(clipped.geometry.coordinates[j].length!==1){
        return retVal;
      }
      polyg = turf.polygon(clipped.geometry.coordinates[j]);
      intersect = turf.lineIntersect(polyg, offsetLine[forSelect]);
      console.log(offsetLine[forSelect]);  //feature 다 똑같음 길이 2
      if (intersect.features.length > 0) {
        console.log("on");
        cutPolyGeoms.push(polyg.geometry.coordinates);
      }else{
        // const lineLength = line.coordinates.length;
        // const firstLinePointBuffer = turf.buffer(turf.point(line.coordinates[0]), 5, {units: 'meters'});
        // const lastLinePointBuffer = turf.buffer(turf.point(line.coordinates[lineLength-1]), 5, {units: 'meters'});
        // const LinedPolygon = turf.polygonToLine(polygon);
        // const first = turf.lineIntersect(LinedPolygon, firstLinePointBuffer);
        // const last = turf.lineIntersect(LinedPolygon, lastLinePointBuffer);
      }
    };

    cutPolyGeoms.forEach(function (geometry, index) {
      id = idPrefix + (i + 1) + '.' + (index + 1);
      cutFeatures.push(turf.polygon(geometry, { id: id }));
    });
  }

  if (cutFeatures.length > 0) retVal = turf.featureCollection(cutFeatures);

  return retVal;
};