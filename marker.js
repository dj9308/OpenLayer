const iconFeature = new ol.Feature({
  geometry: new ol.geom.Point(ol.proj.fromLonLat([-2, 53])),
  name: 'Somewhere near Nottingham',
});

console.dir(iconFeature);

const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [iconFeature]
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
      })
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-2, 53]),
    zoom: 6
  })
});