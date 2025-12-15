<script>
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
    /** 
     * als (pointerX - originX) * newScale + originX = screenX
     * dan originX vrijmaken
     * (pointerX - originX) * newScale = screenX - originX
     * pointerX - originX = screenX/newScale -  originX/newScale
     * -originX + originX/newScale = screenX/newScale - pointerX
     * originX(-1 + 1/newScale) = screenX/newScale - pointerX
     * originX = (screenX/newScale - pointerX)/(-1 + 1/newScale)
     * originX = (screenX - pointerX*newScale)/(-1*newScale + 1)
     * originX = (pointerX*newScale - screenX)/(newScale - 1)
     */

    if(mapZoomState.zoom*mapZoomState.zoomMultiplier !== 1 ){
      mapZoomState.originX = (offsetX * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenX)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
      mapZoomState.originY = (offsetY * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenY)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
    }
    e.preventDefault();
  }

  function limit(n, min, max){
    return Math.min(Math.max(n, min), max);
  }

  function selectLocation(e){
    plant.posX = e.offsetX / mapWidth * 100;
    plant.posY = e.offsetY / mapHeight * 100;
  }

</script>

<div class="overflow-hidden max-w-[60vh] max-h-[60vh] aspect-square relative" bind:clientHeight={mapViewHeight} bind:clientWidth={mapViewWidth} onwheel={mapZoom} bind:this={mapView} >
  <div class="relative flex-1 bg-muted" style:width="{mapWidth}px" style:height="{mapHeight}px" style:transform="scale({mapZoomState.zoom*mapZoomState.zoomMultiplier})" style:transform-origin="{mapZoomState.originX}px {mapZoomState.originY}px">
    <div class="absolute inset-0" >
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <img
        src="{forest?.image}"
        alt="Food forest aerial view"
        bind:naturalHeight={mapHeight}
        bind:naturalWidth={mapWidth}
        onclick={selectLocation}
      />
  </div>
    <div class="absolute inset-0 pointer-events-none" style:width="{mapWidth}px" style:height="{mapHeight}px">
      <div
       style="position: absolute; left: {plant.posX}%; top: {plant.posY}%; transform: translate(-50%, -50%); text-align: center; aspect-ratio: 1 / 1;  background: red;" style:width="{30/mapZoomState.zoom}px" style:border-radius="{15/mapZoomState.zoom}px"
      ></div>
    </div>
  </div>
</div>
<input type="number" name="posX" id="posX" value={plant.posX} readonly>
<input type="number" name="posY" id="posY" value={plant.posY} readonly>