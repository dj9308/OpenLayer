let drawLineString;
let drawPolygon;
let measureTooltipElement;
let measureTooltip;

const raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

const sourceDrawnLineString = new ol.source.Vector({ wrapX: false });
const sourceDrawnPolygon = new ol.source.Vector({ wrapX: false });

const featureStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.7)',
  }),
  stroke: new ol.style.Stroke({
    color:'#ff0000',
    width: 2,
  }),
  image: new ol.style.Circle({
    radius: 5,
    stroke: new ol.style.Stroke({
      color: 'rgba(255, 0, 0, 0.7)',
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.7)',
    }),
  }),
});

const drawnLineString = new ol.layer.Vector({
  source: sourceDrawnLineString,
  style: featureStyle
});

const drawnPolygon = new ol.layer.Vector({
  source: sourceDrawnPolygon,
  style: featureStyle
});

const map = new ol.Map({
  layers: [raster, drawnLineString, drawnPolygon],
  moveTolerance: 3,
  target: 'map',
  view: new ol.View({
    center: [-11000000, 4600000],
    zoom: 14
  })
});


function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

const formatRelativeLength = function (currentLength, formalLength) {
  const length = currentLength;
  if (formalLength !== undefined && formalLength >= 0) {
    const relativeLength = length - formalLength;
    if (relativeLength > 100) {
      relativeOutput = Math.round((relativeLength / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      relativeOutput = Math.round(relativeLength * 100) / 100 + ' ' + 'm';
    }
    return relativeOutput;
  } else {
    return undefined;
  }
}

const formatTotalLength = function (len) {
  const length = len;
  let output;

  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

const formatTotalArea = function (polygon) {
  const area = ol.sphere.getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function paintLineStringOverlay(relativeOutput, totalOutput) {
  if (relativeOutput !== undefined) {
    measureTooltipElement.innerHTML = `
    상대거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${relativeOutput}</span><br/>
    총거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${totalOutput}</span>
    <hr>
    <div><span>부분취소 : 백스페이스</span><br/>
    <span>지정완료 : 더블클릭</span></div>`;
  } else {
    measureTooltipElement.innerHTML = `총거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${totalOutput}</span>
      <button class="deleteLineString">✖</button>`;
  }
}

function paintPolygonOverlay(chkDrawEnd, Output) {
  if (!chkDrawEnd) {
    measureTooltipElement.innerHTML = `
    총면적 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${Output}</span><br/>
    <hr>
    <div><span>부분취소 : 백스페이스</span><br/>
    <span>지정완료 : 더블클릭</span></div>`;
  } else {
    measureTooltipElement.innerHTML = `총면적 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${Output}</span>
      <button class="deletePolygon">✖</button>`;
  }
}

function addInteraction(button) {
  const value = button.value;

  let sketch;
  let listener;
  let polygonOverlayPosition;
  let tooltipCoord;
  let currentLength;
  let formalLength;
  let output;
  let checkPointElement;
  let checkPointTooltip;
  let geom;
  let drawChk = false;
  let idNum = 0;
  let relativeLengthAry = [];

  if (drawLineString !== null || drawPolygon !== null) {
    map.removeInteraction(drawLineString);
    map.removeInteraction(drawPolygon);
  }
console.log(map.getInteractions());

  map.on('click', function (evt) {
    if(sketch !== null && geom !== undefined){
      if(sketch.getGeometry().getCoordinates().length>=3 && geom instanceof ol.geom.LineString){
        checkPointElement.innerHTML = output;
        checkPointTooltip.setPosition(tooltipCoord);
        map.addOverlay(checkPointTooltip);
        if (currentLength !== undefined) {
          if(drawChk){
            formalLength = undefined;
            currentLength = undefined;
            drawChk = false;
            sketch = null;
          }else{
            formalLength = currentLength;
            relativeLengthAry.push(formalLength);
          }
          paintLineStringOverlay('0 m', output);
        }
      }else if(sketch.getGeometry().getCoordinates().length>=2 && geom instanceof ol.geom.LineString){
        map.addOverlay(measureTooltip);
      }else if(sketch.getGeometry().getCoordinates()[0].length>=2 && geom instanceof ol.geom.Polygon){
        map.addOverlay(measureTooltip);
      }
    }
  });

  if(value ==='LineString'){
    drawLineString = new ol.interaction.Draw({
      source: sourceDrawnLineString,
      clickTolerance: 6,
      type: value,
      style: featureStyle
    });
      
    map.addInteraction(drawLineString);
    createMeasureTooltip();

    document.addEventListener('keydown', function(e){
      if(sketch !== null){
        if(e.key ==='Backspace' && sketch.getGeometry().getCoordinates().length>=2){
          drawLineString.removeLastPoint();
          const bar = document.querySelectorAll(`.lineString_${idNum}`);
          if(bar !== undefined){
            relativeLengthAry.pop();
            formalLength = relativeLengthAry[relativeLengthAry.length-1];
            let relativeOutput = formatRelativeLength(currentLength, formalLength);
            if (relativeOutput === undefined) {
              relativeOutput = output;
            };
            paintLineStringOverlay(relativeOutput, output);
            $(bar[0]).remove();
          }
        }
        if(sketch.getGeometry().getCoordinates().length===1){
          map.removeOverlay(measureTooltip);
        }
      }
    });

    drawLineString.on('drawstart', function (evt) {
      sketch = evt.feature;
      tooltipCoord = evt.coordinate;
      console.log(sketch.getGeometry());

      listener = sketch.getGeometry().on('change', function (evt) {
        geom = evt.target;
        currentLength = ol.sphere.getLength(geom);
        output = formatTotalLength(currentLength);
        tooltipCoord = geom.getLastCoordinate();
        checkPointElement = document.createElement('div');
        checkPointElement.className = `ol-tooltip ol-tooltip-checkpoint lineString_${idNum}`;
        checkPointTooltip = new ol.Overlay({
          element: checkPointElement,
          offset: [0, -15],
          positioning: 'bottom-center'
        });
        let relativeOutput = formatRelativeLength(currentLength, formalLength);
        if (relativeOutput === undefined) {
          relativeOutput = output;
        };
        paintLineStringOverlay(relativeOutput, output);
        measureTooltip.setPosition(tooltipCoord);
      });
    });

    drawLineString.on('drawend', function (evt) {
      drawChk=true;
      relativeLengthAry=[];
      paintLineStringOverlay(undefined, output);
      measureTooltipElement.id = `lineString_${idNum}`;
      idNum++;
      checkPointTooltip.setPosition(undefined);
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      measureTooltipElement = null;
      measureTooltip.setOffset([0, -15]);
      createMeasureTooltip();
      ol.Observable.unByKey(listener);
      
      document.querySelector('.deleteLineString').addEventListener('click', function (e) {
        idNum--;
        this.parentNode.parentNode.removeChild(this.parentNode);
        $(`.${this.parentNode.id}`).remove();
  
        const currentNum = this.parentNode.id.split('_')[1] * 1;
        sourceDrawnLineString.removeFeature(sourceDrawnLineString.getFeatures()[currentNum]);
        let i=currentNum;
        while(i<sourceDrawnLineString.getFeatures().length){
          document.querySelector(`#lineString_${i+1}`).id=`lineString_${i}`;
          $(`.lineString_${i+1}`).addClass(`lineString_${i}`);
          $(`.lineString_${i+1}`).removeClass(`lineString_${i+1}`);
          i++;
        }
      });
    });

  }else if(value ==='Polygon'){
    drawPolygon = new ol.interaction.Draw({
      source: sourceDrawnPolygon,
      clickTolerance: 6,
      type: value,
      style: featureStyle
    });

    map.addInteraction(drawPolygon);
    createMeasureTooltip();

    document.addEventListener('keydown', function(e){
      if(sketch !== null){
        if(e.key ==='Backspace' && sketch.getGeometry().getCoordinates()[0].length>=3){
          drawPolygon.removeLastPoint();
        }
        if(sketch.getGeometry().getCoordinates()[0].length===2){
          map.removeOverlay(measureTooltip);
        }
      }
    })
    
    drawPolygon.on('drawstart', function (evt) {
      sketch = evt.feature;
      tooltipCoord = evt.coordinate;
    
      listener = sketch.getGeometry().on('change', function (evt) {
        geom = evt.target;
        output = formatTotalArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
        checkPointElement = document.createElement('div');
        checkPointElement.className = `ol-tooltip ol-tooltip-checkpoint lineString_${idNum}`;
        paintPolygonOverlay(false,output);
      });
      
      polygonOverlayPosition = map.on('pointermove',function(evt){
        tooltipCoord = evt.coordinate;
        measureTooltip.setPosition(tooltipCoord);
      });
    });

    drawPolygon.on('drawend', function (evt) {
        paintPolygonOverlay(true,output);
        measureTooltipElement.id = `polygon_${idNum}`;
        idNum++;
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltipElement = null;
        measureTooltip.setOffset([0, -15]);
        sketch = null;
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
        ol.Observable.unByKey(polygonOverlayPosition);
      
      document.querySelector('.deletePolygon').addEventListener('click', function (e) {
        idNum--;
        this.parentNode.parentNode.removeChild(this.parentNode);
        $(`.${this.parentNode.id}`).remove();
  
        const currentNum = this.parentNode.id.split('_')[1] * 1;
        sourceDrawnPolygon.removeFeature(sourceDrawnPolygon.getFeatures()[currentNum]);
        let i=currentNum;
        while(i<sourceDrawnPolygon.getFeatures().length){
          document.querySelector(`#polygon_${i+1}`).id=`polygon_${i}`;
          $(`.polygon_${i+1}`).addClass(`polygon_${i}`);
          $(`.polygon_${i+1}`).removeClass(`polygon_${i+1}`);
          i++;
        }
      });
      map.removeInteraction(drawPolygon);
    });
  }
}