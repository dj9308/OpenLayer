var image = new ol.style.CircleStyle({
  radius : 5,
  fill:null,
  stroke: new ol.style.Stroke({
    color:'red',
    width:1
  })
});


var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: styleFunction,
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    vectorLayer ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2,
  }),
});