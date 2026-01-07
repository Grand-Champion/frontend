<script>
    export let image,
        alt,
        clickable = true,
        onimageclick,
        classes;

    let mapHeight;
    let mapWidth;
    let mapViewWidth;
    let mapViewHeight;
    let mapView;
    let downPos;
    $: mapZoomState = {
        originX: 0,
        originY: 0,
        zoom: 1,
        zoomMultiplier: Math.min(
            mapViewHeight / mapHeight,
            mapViewWidth / mapWidth,
        ),
    };
    let pointerPos;
    let activePointers = new Map();
    let pinchStartDistance = null;
    let pinchStartZoom = 1;
    let pinchCenter = null;

    function mapZoom(e) {
        // Check if the target is within a scrollable container
        let element = e.target;
        while (element && element !== mapView) {
            const overflowY = window.getComputedStyle(element).overflowY;
            if (overflowY === "auto" || overflowY === "scroll") {
                // Allow scrolling in scrollable containers
                return;
            }
            element = element.parentElement;
        }

        const { screenX, screenY } = getPointerScreenPos(e);

        const { offsetX, offsetY } = pointerScreenToOffset(screenX, screenY);
        mapZoomState.zoom = limit(
            mapZoomState.zoom * (1 - e.deltaY / 1000),
            0.3,
            5,
        );

        fixOrigin(offsetX, offsetY, screenX, screenY);
        e.preventDefault();
    }

    function getPointerScreenPos(e) {
        const boundingClientRect = mapView.getBoundingClientRect();
        const screenX = e.pageX - boundingClientRect.x;
        const screenY = e.pageY - boundingClientRect.y;
        return { screenX, screenY };
    }

    function pointerScreenToOffset(screenX, screenY) {
        const offsetX =
            (screenX - mapZoomState.originX) /
                (mapZoomState.zoom * mapZoomState.zoomMultiplier) +
            mapZoomState.originX;
        const offsetY =
            (screenY - mapZoomState.originY) /
                (mapZoomState.zoom * mapZoomState.zoomMultiplier) +
            mapZoomState.originY;
        return { offsetX, offsetY };
    }

    function mapPointerDown(e) {
        // Don't interfere with interactive elements
        const interactiveElements = [
            "BUTTON",
            "INPUT",
            "TEXTAREA",
            "SELECT",
            "A",
        ];
        if (
            interactiveElements.includes(e.target.tagName) ||
            e.target.closest("button, input, textarea, select, a")
        ) {
            return;
        }
        e.preventDefault();
        mapView.setPointerCapture?.(e.pointerId);
        const pos = getPointerScreenPos(e);
        activePointers.set(e.pointerId, pos);
        if (activePointers.size === 1) {
            pointerPos = pos;
            downPos = pos;
        } else if (activePointers.size === 2) {
            const [a, b] = [...activePointers.values()];
            pinchStartDistance = Math.hypot(
                a.screenX - b.screenX,
                a.screenY - b.screenY,
            );
            pinchStartZoom = mapZoomState.zoom;
            pinchCenter = {
                screenX: (a.screenX + b.screenX) / 2,
                screenY: (a.screenY + b.screenY) / 2,
            };
        }
    }

    function fixOrigin(offsetX, offsetY, screenX, screenY) {
        if (mapZoomState.zoom * mapZoomState.zoomMultiplier !== 1) {
            mapZoomState.originX =
                (offsetX * mapZoomState.zoom * mapZoomState.zoomMultiplier -
                    screenX) /
                (mapZoomState.zoom * mapZoomState.zoomMultiplier - 1);
            mapZoomState.originY =
                (offsetY * mapZoomState.zoom * mapZoomState.zoomMultiplier -
                    screenY) /
                (mapZoomState.zoom * mapZoomState.zoomMultiplier - 1);
        }
    }

    function mapPointerMove(e) {
        // Don't interfere with interactive elements
        const interactiveElements = [
            "BUTTON",
            "INPUT",
            "TEXTAREA",
            "SELECT",
            "A",
        ];
        if (
            interactiveElements.includes(e.target.tagName) ||
            e.target.closest("button, input, textarea, select, a")
        ) {
            return;
        }
        e.preventDefault();
        if (!activePointers.has(e.pointerId)) return;
        const pos = getPointerScreenPos(e);
        activePointers.set(e.pointerId, pos);

        if (activePointers.size === 2) {
            const [a, b] = [...activePointers.values()];
            const dist = Math.hypot(
                a.screenX - b.screenX,
                a.screenY - b.screenY,
            );
            if (pinchStartDistance) {
                const scale = dist / pinchStartDistance;
                const targetZoom = limit(pinchStartZoom * scale, 0.3, 5);
                const { offsetX, offsetY } = pointerScreenToOffset(
                    pinchCenter.screenX,
                    pinchCenter.screenY,
                );
                mapZoomState.zoom = targetZoom;
                fixOrigin(
                    offsetX,
                    offsetY,
                    pinchCenter.screenX,
                    pinchCenter.screenY,
                );
            }
        } else if (activePointers.size === 1) {
            if (!pointerPos) return;
            const { screenX, screenY } = pos;
            const { offsetX, offsetY } = pointerScreenToOffset(
                pointerPos.screenX,
                pointerPos.screenY,
            );
            fixOrigin(offsetX, offsetY, screenX, screenY);
            pointerPos = { screenX, screenY };
        }
    }

    function mapPointerUp(e) {
        mapView.releasePointerCapture?.(e.pointerId);
        const wasSingle = activePointers.size === 1;
        const lastPos = pointerPos;
        activePointers.delete(e.pointerId);
        if (activePointers.size < 2) {
            pinchStartDistance = null;
            pinchCenter = null;
        }
        if (
            wasSingle &&
            lastPos &&
            downPos &&
            Math.hypot(
                lastPos.screenX - downPos.screenX,
                lastPos.screenY - downPos.screenY,
            ) < 3
        ) {
            imageClicked(lastPos);
        }
        if (activePointers.size === 1) {
            // continue panning with the remaining pointer
            pointerPos = [...activePointers.values()][0];
        } else {
            pointerPos = undefined;
        }
    }

    function limit(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    function imageClicked(posOverride) {
        if (onimageclick) {
            const pos = posOverride || pointerPos;
            if (!pos) return;
            const { offsetX, offsetY } = pointerScreenToOffset(
                pos.screenX,
                pos.screenY,
            );
            onimageclick({
                posX: limit((offsetX / mapWidth) * 100, 0, 100),
                posY: limit((offsetY / mapHeight) * 100, 0, 100),
            });
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="overflow-hidden w-full h-full relative {classes}"
    bind:clientHeight={mapViewHeight}
    bind:clientWidth={mapViewWidth}
    onwheelcapture={mapZoom}
    bind:this={mapView}
    onpointerdown={mapPointerDown}
    onpointermove={mapPointerMove}
    onpointerup={mapPointerUp}
    style:touch-action="none"
>
    <div
        class="relative flex-1 bg-muted"
        style:width="{mapWidth}px"
        style:height="{mapHeight}px"
        style:transform="scale({mapZoomState.zoom *
            mapZoomState.zoomMultiplier})"
        style:transform-origin="{mapZoomState.originX}px {mapZoomState.originY}px"
    >
        <div class="absolute inset-0">
            <img
                src={image}
                {alt}
                bind:naturalHeight={mapHeight}
                bind:naturalWidth={mapWidth}
            />
            <div class="absolute inset-0 bg-black/10"></div>
        </div>

        <div
            class="absolute inset-0"
            style:width="{mapWidth}px"
            style:height="{mapHeight}px"
            style:pointer-events={clickable ? "auto" : "none"}
        >
            <slot mapZoom={mapZoomState.zoom} />
        </div>
    </div>
    <slot name="over" />
</div>
