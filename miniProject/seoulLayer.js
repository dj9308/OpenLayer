const container = document.getElementById('popup'),
content = document.getElementById('popup-content'),
closer = document.getElementById('popup-closer'),
H2 = document.createElement("h2");
H3 = document.createElement("h3");

const SEOULMAP_KEY = 'https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json';
const SEOULCOORDS_KEY = `http://openapi.seoul.go.kr:8088/684f664b6e646a393633564257564f/json/SdeTlSccoSigW/1/25`;
const PARKING_KEY = `http://openapi.seoul.go.kr:8088/684f664b6e646a393633564257564f/json/GetParkInfo/1/1000/강남`;

let selected = null;
let guCenter= ol.proj.fromLonLat([126.978446,37.523184]);

//팝업 컨테이너 설정
const overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
})

//종료 버튼
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

const highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.9)',
    }),
    stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3,
    }),
    text: new ol.style.Text({
        font: 'bold 15px "Open Sans", "Arial Unicode MS", "sans-serif"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    }),
});

const certainPolygonStyle =  new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 3,
    }),
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.1)',
    }),
    text: new ol.style.Text({
        font: 'bold 15px "Open Sans", "Arial Unicode MS", "sans-serif"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    })
});

// const labelStyle = new ol.style.Style({
//     text: new ol.style.Text({
//         font: 'bold 15px "Open Sans", "Arial Unicode MS", "sans-serif"',
//         overflow: true,
//         fill: new ol.style.Fill({
//             color: '#000',
//         }),
//         stroke: new ol.style.Stroke({
//             color: '#fff',
//             width: 3,
//         }),
//     }),
// });

const PolygonStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#319FD3',
        width: 3,
    }),
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.6)',
    }),
    text: new ol.style.Text({
        font: 'bold 15px "Open Sans", "Arial Unicode MS", "sans-serif"',
        overflow: true,
        fill: new ol.style.Fill({
            color: '#000',
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3,
        }),
    })
});

let styles =[PolygonStyle];

var view = new ol.View({
    center: ol.proj.fromLonLat([126.978446,37.523184]),
    zoom: 11.3,
  });

let map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
        }),
        new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: SEOULMAP_KEY
            }),
            style: function(feature){
                PolygonStyle.getText().setText(feature.get('name'));
                return styles;
            },
        })
    ],
    overlays: [overlay],
    target: 'map',
    view: view
});

map.on('singleclick', function (evt) {
    const coordinate = evt.coordinate;
    // const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));

    map.forEachFeatureAtPixel(evt.pixel, function (f) {
        selected = f;
        let guName = '';

        f.setStyle(function(feature){
            const highlight = [highlightStyle];
            guName = feature.get('name');
            highlightStyle.getText().setText(guName);
            return highlight;
        });

        console.log(f.getGeometry());

        fetch(SEOULCOORDS_KEY).then(function(response){
            return response.json();
        }).then(function(json){
            const obj = json.SdeTlSccoSigW.row.filter(function(list){
                return guName === list.SIG_KOR_NM;
            });
            guCenter = ol.proj.fromLonLat([obj[0].LNG,obj[0].LAT]);
            
            view.animate({
                center : guCenter,
                duration : 2000,
                zoom : 13.7
            });
        });
        return true;
    });

    H2.innerText = '';
    const title = content.appendChild(H2);
  
    // content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
});

map.on('pointermove',function(evt){

    // 레이어 초기화
    if (selected !== null) {
        overlay.setPosition(undefined);
        selected.setStyle(undefined);
        selected = null;
    }

    //레이어 안에 들어왔을 때
    map.forEachFeatureAtPixel(evt.pixel, function (f) {
        selected = f;
        // return 값을 styles로만 하면 function안에 무슨 setting을 하던 상관 없다.
        f.setStyle(function(feature){
            const highlight = [highlightStyle];
            highlightStyle.getText().setText(feature.get('name'));

            // 팝업 생성
            let coordinate = evt.coordinate;
            let hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
            H2.innerText = selected.get('name');
            const title = content.appendChild(H2);
            H3.innerText = `주차장 개수 : `;
          
            // content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
            overlay.setPosition(coordinate);
            return highlight;
        });
        return true;
    });
});