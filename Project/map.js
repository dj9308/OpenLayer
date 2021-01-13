let drawFeature;
let drawPoint;
let measureTooltipElement;
let measureTooltip;

const raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

const sourceDrawnFeature = new ol.source.Vector({ wrapX: false });
const sourceDrawnPoint = new ol.source.Vector({ wrapX: false });

const vectorStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new ol.style.Stroke({
    color: '#ff0000',
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
})

const drawnFeature = new ol.layer.Vector({
  source: sourceDrawnFeature,
  style: vectorStyle
});

const drawnPoint = new ol.layer.Vector({
  source: sourceDrawnPoint,
  style: vectorStyle
});

const map = new ol.Map({
  layers: [raster, drawnFeature, drawnPoint],
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

const pointerMoveHandler = function (evt) {
  if (evt.dragging) {
    return;
  }
  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};

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

const formatLength = function (len) {
  const length = len;
  let output;

  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function paintMeasureOverlay(relativeOutput, totalOutput) {
  if (relativeOutput !== undefined) {
    measureTooltipElement.innerHTML = `
    상대거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${relativeOutput}</span><br/>
    총거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${totalOutput}</span>
    <hr>
    <div><span>부분취소 : 백스페이스</span><br/>
    <span>지정완료 : 더블클릭</span></div>`;
  } else {
    measureTooltipElement.innerHTML = `총거리 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:red">${totalOutput}</span>
      <button id="deleteFeature">✖</button>`;
  }
}

function removeInteraction() {
  map.removeInteraction(drawFeature);
  map.removeInteraction(drawPoint);
}

function addInteraction(button) {
  let sketch;
  let listener;
  let tooltipCoord;
  let currentLength;
  let formalLength;
  let output;
  let checkPointElement;
  let checkPointTooltip;
  let idNum = 0;
  let pointCnt = 0;
  
  const value = button.value;
  if (drawFeature !== null) {
    removeInteraction();
  }
  
  drawFeature = new ol.interaction.Draw({
    source: sourceDrawnFeature,
    type: value,
    style: vectorStyle
  });
  
  drawPoint = new ol.interaction.Draw({
    source: sourceDrawnPoint,
    type: "Point",
    style: vectorStyle
  });
  
  map.addInteraction(drawFeature);
  map.addInteraction(drawPoint);
  createMeasureTooltip();
  
  map.on('dblclick', function (evt) {
    pointCnt--;
  });
  
  map.on('click', function (evt) {
    pointCnt++;
    if (output !== undefined && tooltipCoord !== undefined) {
      console.log(pointCnt);
      checkPointElement.innerHTML = output;
      checkPointTooltip.setPosition(tooltipCoord);
      map.addOverlay(checkPointTooltip);
      if (currentLength !== undefined) {
        formalLength = currentLength;
        paintMeasureOverlay('0 m', output);
      }
    }
  });
  
  drawFeature.on('drawstart', function (evt) {
    sketch = evt.feature;
    tooltipCoord = evt.coordinate;
    
    listener = sketch.getGeometry().on('change', function (evt) {
      const geom = evt.target;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
        measureTooltipElement.innerHTML = '총거리 : ' + output;
        measureTooltip.setPosition(tooltipCoord);
      } else if (geom instanceof ol.geom.LineString) {
        currentLength = ol.sphere.getLength(geom);
        output = formatLength(currentLength);
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
        paintMeasureOverlay(relativeOutput, output);
        measureTooltip.setPosition(tooltipCoord);
      };
    });
  });
  
  drawFeature.on('drawend', function (evt) {
    let pointAry = [];
    pointAry.push(pointCnt);
    console.log(pointAry[pointAry.length-1]);
    paintMeasureOverlay(undefined, output);
    measureTooltipElement.id = `lineString_${idNum}`;
    idNum++;
    document.querySelector('#deleteFeature').addEventListener('click', function (e) {
      // deleteFeature();
      sourceDrawnFeature.removeFeature(sourceDrawnFeature.getFeatures()[sourceDrawnFeature.getFeatures().length - 1]);
      this.parentNode.parentNode.removeChild(this.parentNode);
      $(`.${this.parentNode.id}`).remove();
      const currentNum = this.parentNode.id.split('_')[1] * 1;
      for (let i = 0; i < pointAry[currentNum]; i++) {
        sourceDrawnPoint.removeFeature(sourceDrawnPoint.getFeatures()[currentNum]);
      }
      pointCnt -= pointAry[currentNum];
      pointAry.pop(currentNum);
    });
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -15]);
    sketch = null;
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
    sourceDrawnPoint.removeFeature(sourceDrawnPoint.getFeatures()[sourceDrawnPoint.getFeatures().length - 1]);
    checkPointTooltip.setPosition(undefined);
  });
}