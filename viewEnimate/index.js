var london = ol.proj.fromLonLat([-0.12755, 51.507222]);

var view = new ol.View({
  center: ol.proj.fromLonLat([126.978446,37.523184]),
  zoom: 11.3,
});

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      preload: 4,
      source: new ol.source.OSM(),
    }) ],
  view: view,
});

// function onClick(id, callback) {
//   document.getElementById(id).addEventListener('click', callback);
// }

const btn = document.querySelector("#pan-to-london");
btn.addEventListener("click",function(){
  view.animate({
    center: london,
    duration: 2000,
  });
});

// onClick('pan-to-london', function () {
//   view.animate({
//     center: london,
//     duration: 2000,
//   });
// });