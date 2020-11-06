const API_KEY = "684f664b6e646a393633564257564f";


var apiObj = "";
fetch(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/GetParkInfo/1/100/`)
.then(function(response){
    return response.json();
})
.then(function(json){
    const length = json.GetParkInfo.row.length;
    let array = [];

    for(var i=0;i<length;i++){
        var point = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([json.GetParkInfo.row[i].LNG,json.GetParkInfo.row[i].LAT])),
            name:'hi',
          });
        array.push(point);
    }


    var vectorLayer = new ol.layer.Vector({ //정보를 담을 벡터 레이어
        Features: array,
        });
    
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
              new ol.layer.Vector({
                source: new ol.source.Vector({
                  features: array
                }),
                style: new ol.style.Style({
                  image: new ol.style.Icon({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: '../config/image/star.png',
                    scale: [0.05,0.05]
                  })
                })
              })
        ],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([126.978446,37.523184]),
            zoom: 11,
        }),
        });
})

