<script>
  import ZoomableMap from "./ZoomableMap.svelte";
  export let forest, plant;
  plant = plant ?? {posX:0, posY: 0};

  let mapHeight;
  let mapWidth;
  let mapViewWidth;
  let mapViewHeight;
  let mapView;
  $: mapZoomState = {originX: 0, originY: 0, zoom: 1, zoomMultiplier: Math.min(mapViewHeight/mapHeight, mapViewWidth/mapWidth)};

  function mapZoom(e){
    const boundingClientRect = mapView.getBoundingClientRect();
    const screenX = e.pageX - boundingClientRect.x;
    const screenY = e.pageY - boundingClientRect.y;
    
    const offsetX = (screenX - mapZoomState.originX) / (mapZoomState.zoom*mapZoomState.zoomMultiplier) + mapZoomState.originX;
    const offsetY = (screenY - mapZoomState.originY) / (mapZoomState.zoom*mapZoomState.zoomMultiplier) + mapZoomState.originY;
    mapZoomState.zoom = limit( mapZoomState.zoom*(1-e.deltaY/1000), 0.3, 5);

    if(mapZoomState.zoom*mapZoomState.zoomMultiplier !== 1 ){
      mapZoomState.originX = (offsetX * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenX)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
      mapZoomState.originY = (offsetY * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenY)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
    }
    e.preventDefault();
  }

  function limit(n, min, max){
    return Math.min(Math.max(n, min), max);
  }

  function selectLocation(pos){
    plant.posX = pos.posX;
    plant.posY = pos.posY;
  }

</script>
<ZoomableMap image={forest?.image} alt="Food forest aerial view" clickable onimageclick={selectLocation} let:mapZoom classes="max-w-[60vh] max-h-[60vh]">
<div
    style="position: absolute; left: {plant.posX}%; top: {plant.posY}%; transform: translate(-50%, -50%); text-align: center; aspect-ratio: 1 / 1;  background: red;" 
    style:width="{30/mapZoom}px" style:border-radius="{15/mapZoom}px"
></div>
</ZoomableMap>

<input type="number" name="posX" id="posX" value={plant.posX} readonly>
<input type="number" name="posY" id="posY" value={plant.posY} readonly>