<script>
    export let image, alt, clickable = true, onimageclick, classes;

    let mapHeight;
    let mapWidth;
    let mapViewWidth;
    let mapViewHeight;
    let mapView;
    let downPos;
    $: mapZoomState = {originX: 0, originY: 0, zoom: 1, zoomMultiplier: Math.min(mapViewHeight/mapHeight, mapViewWidth/mapWidth)};
    let pointerPos;

    function mapZoom(e){
        const {screenX, screenY} = getPointerScreenPos(e);

        const {offsetX, offsetY} = pointerScreenToOffset(screenX, screenY); 
        mapZoomState.zoom = limit( mapZoomState.zoom*(1-e.deltaY/1000), 0.3, 5);

        fixOrigin(offsetX, offsetY, screenX, screenY);
        e.preventDefault();
    }

    function getPointerScreenPos(e){
        const boundingClientRect = mapView.getBoundingClientRect();
        const screenX = e.pageX - boundingClientRect.x;
        const screenY = e.pageY - boundingClientRect.y;
        return {screenX, screenY};
    }

    function pointerScreenToOffset(screenX, screenY){
        const offsetX = (screenX - mapZoomState.originX) / (mapZoomState.zoom*mapZoomState.zoomMultiplier) + mapZoomState.originX;
        const offsetY = (screenY - mapZoomState.originY) / (mapZoomState.zoom*mapZoomState.zoomMultiplier) + mapZoomState.originY;
        return {offsetX, offsetY};
    }

    function mapPointerDown(e){
        pointerPos = getPointerScreenPos(e);
        downPos = pointerPos;
        e.preventDefault();
    }

    function fixOrigin(offsetX, offsetY, screenX, screenY){
        if(mapZoomState.zoom*mapZoomState.zoomMultiplier !== 1 ){
            mapZoomState.originX = (offsetX * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenX)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
            mapZoomState.originY = (offsetY * mapZoomState.zoom*mapZoomState.zoomMultiplier - screenY)/(mapZoomState.zoom*mapZoomState.zoomMultiplier - 1);
        }
    } 
    
    function mapPointerMove(e){
        if(!pointerPos) return;
        const {screenX, screenY} = getPointerScreenPos(e);
        
        const {offsetX, offsetY} = pointerScreenToOffset(pointerPos.screenX, pointerPos.screenY)
        fixOrigin(offsetX, offsetY, screenX, screenY);

        pointerPos = {screenX, screenY};
        e.preventDefault();
    }

    function mapPointerUp(e){
        if(pointerPos && downPos && pointerPos.screenX == downPos.screenX && pointerPos.screenY == downPos.screenY){
            imageClicked();
        }
        pointerPos = undefined;
    }

    function limit(n, min, max){
        return Math.min(Math.max(n, min), max);
    }

    function imageClicked(){
        if(onimageclick){
            const { offsetX, offsetY } = pointerScreenToOffset(pointerPos.screenX, pointerPos.screenY);
            onimageclick( {
                posX: limit(offsetX / mapWidth * 100, 0, 100),
                posY: limit(offsetY / mapHeight * 100, 0, 100)
            } );
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overflow-hidden w-full h-full relative {classes}">
    <div class="overflow-hidden w-full h-full relative" bind:clientHeight={mapViewHeight} bind:clientWidth={mapViewWidth} onwheelcapture={mapZoom} bind:this={mapView} onmousedown={mapPointerDown} onmousemove={mapPointerMove} onmouseup={mapPointerUp}>
        <div class="relative flex-1 bg-muted" style:width="{mapWidth}px" style:height="{mapHeight}px" style:transform="scale({mapZoomState.zoom*mapZoomState.zoomMultiplier})" style:transform-origin="{mapZoomState.originX}px {mapZoomState.originY}px">
            <div class="absolute inset-0">
                <img
                    src="{image}"
                    alt="{alt}"
                    bind:naturalHeight={mapHeight}
                    bind:naturalWidth={mapWidth}
                />
            <div class="absolute inset-0 bg-black/10"></div>
            </div>

            <div class="absolute inset-0" style:width="{mapWidth}px" style:height="{mapHeight}px" style:pointer-events="{clickable? "auto" : "none"}">
                <slot mapZoom={mapZoomState.zoom} />
            </div>
        </div>
    </div>
    <slot name="over" />
</div>