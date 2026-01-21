<script>
  import ZoomableMap from "./ZoomableMap.svelte";
  export let forest, plant;
  plant = plant ?? { posX: 0, posY: 0 };

  function selectLocation(pos) {
    plant.posX = pos.posX;
    plant.posY = pos.posY;
  }
</script>

<ZoomableMap
  image={forest?.image}
  alt="Food forest aerial view"
  clickable
  onimageclick={selectLocation}
  let:mapZoom
  classes="max-w-[60vh] max-h-[60vh] border border-border rounded-lg"
>
  <div
    style="position: absolute; left: {plant.posX}%; top: {plant.posY}%; transform: translate(-50%, -50%); text-align: center; aspect-ratio: 1 / 1;  background: red;"
    style:width="{30 / mapZoom}px"
    style:border-radius="{15 / mapZoom}px"
  ></div>
</ZoomableMap>

<div class="flex gap-4">
  <div class="flex-1">
    <label for="posX" class="text-sm text-muted-foreground">X</label>
    <input
      type="number"
      name="posX"
      id="posX"
      value={plant.posX}
      readonly
      class="w-full px-2 py-1 text-sm border border-border rounded-lg bg-background text-foreground"
    />
  </div>
  <div class="flex-1">
    <label for="posY" class="text-sm text-muted-foreground">Y</label>
    <input
      type="number"
      name="posY"
      id="posY"
      value={plant.posY}
      readonly
      class="w-full px-2 py-1 text-sm border border-border rounded-lg bg-background text-foreground"
    />
  </div>
</div>
