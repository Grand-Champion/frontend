<script>
  import { derived } from "svelte/store";
  import { language, t } from "$lib/stores/language";
  import {
    Leaf,
    Trees,
    Flower2,
    Sprout,
    X,
    ChevronDown,
    Droplets,
    Sun,
    Thermometer,
    MessageCircle,
    Send,
    ExternalLink,
  } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";

  // Pak API data
  export let forestData;

  // Get plants array directly from API
  $: plants = forestData?.data?.plants || [];

  // calculate status based on species optimal ranges
  function getStatus(plant) {
    if (!plant.conditions || !plant.conditions[0]) return 'critical';
    if (!plant.species) return 'critical';
    
    const c = plant.conditions[0];
    const s = plant.species;
    let issuesCount = 0;

    // Check conditions met species ranges
    if (s.minTemperature !== null && s.maxTemperature !== null) {
      if (
        c.temperature < s.minTemperature ||
        c.temperature > s.maxTemperature
      ) {
        issuesCount++;
      }
    }

    if (s.minHumidity !== null && s.maxHumidity !== null) {
      if (c.humidity < s.minHumidity || c.humidity > s.maxHumidity) {
        issuesCount++;
      }
    }

    if (s.minSoilMoisture !== null && s.maxSoilMoisture !== null) {
      if (
        c.soilMoisture < s.minSoilMoisture ||
        c.soilMoisture > s.maxSoilMoisture
      ) {
        issuesCount++;
      }
    }

    if (s.minSoilPH !== null && s.maxSoilPH !== null) {
      if (c.soilPH < s.minSoilPH || c.soilPH > s.maxSoilPH) {
        issuesCount++;
      }
    }

    if (s.minSunlight !== null && s.maxSunlight !== null) {
      if (c.sunlight < s.minSunlight || c.sunlight > s.maxSunlight) {
        issuesCount++;
      }
    }

    // Returned de status, kijkt naar hoeveelheid issues
    if (issuesCount === 0) return "good";
    if (issuesCount <= 2) return "attention";
    return "critical";
  }

  // Gebruik backend species types (Tree, Shrub, Plant)
  $: categoryConfig = {
    tree: {
      label: t("trees", $language),
      icon: Trees,
      color: "var(--category-tree)",
    },
    shrub: {
      label: t("shrubs", $language),
      icon: Sprout,
      color: "var(--category-shrub)",
    },
    herb: {
      label: t("herbs", $language),
      icon: Leaf,
      color: "var(--category-herb)",
    },
    vegetable: {
      label: t("vegetables", $language),
      icon: Flower2,
      color: "var(--category-vegetable)",
    },
  };

  $: statusConfig = {
    good: { label: t("good", $language) },
    attention: { label: t("needsAttention", $language) },
    critical: { label: t("critical", $language) },
  };

  // Local UI state
  let selectedPlantId = null;
  let selectedPlant = null;
  let overallStatus = null;
  let overallColor = null;
  let speciesOpen = true;
  let maintenanceOpen = true;
  let hoveredPlantId = null;
  const comments = {};
  let commentText = "";

  // Plant care advice messages updaten zonder refresh
  $: if (selectedPlantId !== null) {
    selectedPlant = plants.find(p => p.id === selectedPlantId) || null;
    if (!selectedPlant) {
      selectedPlantId = null;
    }
  } else {
    selectedPlant = null;
  }

  function getStatusColor(status) {
    switch (status) {
      case "good":
        return "var(--status-good)";
      case "attention":
        return "var(--status-attention)";
      case "critical":
        return "var(--status-critical)";
    }
  }

  const statusBg = (color) => `color-mix(in oklch, ${color} 12%, transparent)`;
  const statusBorder = (color) =>
    `color-mix(in oklch, ${color} 32%, transparent)`;

  function formatStage(stage) {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  function generateAdvice(plant) {
    const advice = [];

    // Check of conditions bestaan
    if (!plant.conditions || !plant.conditions[0]) {
      return ["No condition data available."];
    }

    // Check of specie data bestaat
    if (!plant.species) {
      return ["No species data available for optimal range comparison."];
    }
    
    const c = plant.conditions[0];
    const s = plant.species;

    // Check of temperature binnen range zit
    if (s.minTemperature !== null && s.maxTemperature !== null) {
      if (c.temperature < s.minTemperature) {
        advice.push("Temperature too cold.");
      } else if (c.temperature > s.maxTemperature) {
        advice.push("Temperature too hot.");
      }
    }

    // Check of humidity binnen range zit
    if (s.minHumidity !== null && s.maxHumidity !== null) {
      if (c.humidity < s.minHumidity) {
        advice.push("Humidity too low.");
      } else if (c.humidity > s.maxHumidity) {
        advice.push("Humidity too high.");
      }
    }

    // Check of soil moisture binnen range zit
    if (s.minSoilMoisture !== null && s.maxSoilMoisture !== null) {
      if (c.soilMoisture < s.minSoilMoisture) {
        advice.push("Soil too dry.");
      } else if (c.soilMoisture > s.maxSoilMoisture) {
        advice.push("Soil too wet.");
      }
    }

    // Check of soil pH binnen range zit
    if (s.minSoilPH !== null && s.maxSoilPH !== null) {
      if (c.soilPH < s.minSoilPH || c.soilPH > s.maxSoilPH) {
        advice.push("Soil pH out of range.");
      }
    }

    // Check of sunlight binnen range zit
    if (s.minSunlight !== null && s.maxSunlight !== null) {
      if (c.sunlight < s.minSunlight) {
        advice.push("Not enough sunlight.");
      } else if (c.sunlight > s.maxSunlight) {
        advice.push("Too much sunlight.");
      }
    }

    return advice.length ? advice : ["All conditions are optimal."];
  }

  function addComment() {
    if (commentText.trim() && selectedPlant) {
      comments[selectedPlant.id] = [
        ...(comments[selectedPlant.id] || []),
        commentText,
      ];
      commentText = "";
    }
  }

  const filteredPlants = derived(
    [selectedCategories, selectedStatus],
    ([$categories, $statuses]) => {
      if (!plants || plants.length === 0) return [];

      return plants.filter(
        (plant) =>
          $categories.includes(plant.species?.type?.toLowerCase() || "tree") &&
          $statuses.includes(getStatus(plant)),
      );
    },
  );

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return getStatusColor("good");
    const midpoint = (min + max) / 2;
    return Math.abs(current - midpoint) > criticalThreshold
      ? getStatusColor("critical")
      : getStatusColor("attention");
  }

  function viewPlantDetails(plantId) {
    goto(`/plant/${plantId}`);
  }

  $: if (selectedPlant) {
    overallStatus = getStatus(selectedPlant);
    overallColor = getStatusColor(overallStatus);
  } else {
    overallStatus = null;
    overallColor = null;
  }

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
  }

  function limit(n, min, max){
    return Math.min(Math.max(n, min), max);
  }

</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar (shared filters) -->
  <div
    class="w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <Filters />
  </div>

  <!-- Center map area -->
  <div class="overflow-hidden w-full h-full relative" bind:clientHeight={mapViewHeight} bind:clientWidth={mapViewWidth} onwheelcapture={mapZoom} bind:this={mapView}>
    <div class="relative flex-1 bg-muted" style:width="{mapWidth}px" style:height="{mapHeight}px" style:transform="scale({mapZoomState.zoom*mapZoomState.zoomMultiplier})" style:transform-origin="{mapZoomState.originX}px {mapZoomState.originY}px">
      <div class="absolute inset-0">
        <img
          src="{forestData?.data?.image}"
          alt="Food forest aerial view"
          bind:naturalHeight={mapHeight}
          bind:naturalWidth={mapWidth}
        />
        <div class="absolute inset-0 bg-black/10"></div>
      </div>

      <div class="absolute inset-0" style:width="{mapWidth}px" style:height="{mapHeight}px">
        {#each $filteredPlants as plant (plant.id)}
          {#if typeof plant.posX === "number" && typeof plant.posY === "number"}
            {@const config =
              categoryConfig[plant.species?.type?.toLowerCase() || "tree"]}
            {@const status = getStatus(plant)}
            {@const statusColor = getStatusColor(status)}

            <div
              style="position: absolute; left: {plant.posX}%; top: {plant.posY}%; transform: translate(-50%, -50%); text-align: center; width: 60px;"
            >
              <button
                onclick={() => (selectedPlantId = plant.id)}
                onmouseenter={() => (hoveredPlantId = plant.id)}
                onmouseleave={() => (hoveredPlantId = null)}
                class="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 cursor-pointer {selectedPlant?.id ===
                plant.id
                  ? 'ring-4 ring-white scale-110'
                  : ''}"
                style="background-color: {statusColor};"
                aria-label="View {plant.name}"
              >
                <svelte:component this={config.icon} class="h-5 w-5" />
              </button>
              <div class="text-xs text-white mt-1 truncate" title={plant.name}>
                {plant.name}
                  <span style="display:block; color:yellow; font-size:10px;">ID: {plant.id}</span> <!-- dit is zodat we kunnen zien welk id een plant heeft. Moet later verwijderd worden -->
              </div>
            </div>
          {/if}

          {#if hoveredPlantId === plant.id}
            <div
              class="absolute rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg whitespace-nowrap pointer-events-none z-50"
              style="left: {plant.posX}%; top: calc({plant.posY}% + 30px); transform: translateX(-50%);"
            >
              {plant.species?.name || `Plant ${plant.id}`}
            </div>
          {/if}
        {/each}
      </div>
    </div>
      {#if selectedPlant}
        <div
          class="map-overlay absolute right-6 top-6 bottom-6 w-96 max-w-[95%] rounded-lg border border-white/40 dark:border-white/10 bg-white/70 dark:bg-green-950/25 backdrop-blur-lg shadow-xl z-50 overflow-y-auto pointer-events-auto"
        >
          <div class="p-6">
            <div class="mb-4 flex items-start justify-between">
              <div class="flex-1">
                <div
                  class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold text-primary-foreground"
                  style={`background-color: ${categoryConfig[selectedPlant.species?.type?.toLowerCase() || "tree"]?.color || "var(--category-tree)"};`}
                >
                  {categoryConfig[
                    selectedPlant.species?.type?.toLowerCase() || "tree"
                  ]?.label || "Unknown"}
                </div>
                <h2 class="text-2xl font-bold text-card-foreground">
                  {selectedPlant.name
                    ? selectedPlant.name
                    : selectedPlant.species?.name
                      ? selectedPlant.species.name
                      : `Plant ${selectedPlant.id}`}
                </h2>
                <p class="text-sm italic text-muted-foreground">
                  {selectedPlant.species?.scientificName ||
                    `Species ${selectedPlant.speciesId || ""}`}
                </p>
              </div>
              <button
                onclick={() => (selectedPlantId = null)}
                class="p-2 hover:bg-muted rounded-lg cursor-pointer"
                aria-label="Close details"><X class="h-4 w-4" /></button
              >
            </div>

            <div class="space-y-6">
              <div
                class="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={selectedPlant.image ||
                    selectedPlant.species?.image ||
                    "/placeholder.svg"}
                  alt={selectedPlant.name
                    ? selectedPlant.name
                    : `Plant ${selectedPlant.id}`}
                  class="w-full h-full object-cover"
                />
              </div>

              <div
                class="rounded-lg p-4 border"
                style={`background-color: ${statusBg(overallColor)}; border-color: ${statusBorder(overallColor)};`}
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-card-foreground">
                    Overall Status
                  </h3>
                  <div
                    class="px-2 py-1 rounded text-xs font-semibold text-white"
                    style={`background-color: ${overallColor};`}
                  >
                    {overallStatus === "good"
                      ? "Optimal"
                      : overallStatus === "attention"
                        ? "Needs Attention"
                        : "Critical"}
                  </div>
                </div>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-semibold text-card-foreground">
                  Care Advice
                </h3>
                <div
                  class="space-y-2 rounded-lg border p-4"
                  style="background-color: color-mix(in oklch, var(--primary) 12%, transparent); border-color: color-mix(in oklch, var(--primary) 32%, transparent);"
                >
                  {#each generateAdvice(selectedPlant) as advice, i (i)}
                    <p class="text-sm text-foreground">{advice}</p>
                  {/each}
                </div>
              </div>

              <div>
                <button
                  onclick={() => viewPlantDetails(selectedPlant.id)}
                  class="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer"
                  >View Full Details <ExternalLink class="h-4 w-4" /></button
                >

                <div class="mb-3 flex items-center gap-2">
                  <MessageCircle class="h-4 w-4" />
                  <h3 class="text-sm font-semibold text-card-foreground">
                    Comments ({Array.isArray(comments[selectedPlant.id])
                      ? comments[selectedPlant.id].length
                      : 0})
                  </h3>
                </div>

                <div class="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {#each Array.isArray(comments[selectedPlant.id]) ? comments[selectedPlant.id] : [] as comment, i (i)}
                    <div class="rounded-lg bg-muted p-2">
                      <p class="text-sm text-muted-foreground">{comment}</p>
                    </div>
                  {/each}
                </div>

                <div class="flex gap-2">
                  <input
                    type="text"
                    bind:value={commentText}
                    onkeypress={(e) => e.key === "Enter" && addComment()}
                    placeholder="Add a comment..."
                    class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onclick={addComment}
                    class="px-3 py-2 rounded-lg border border-border hover:bg-muted cursor-pointer"
                    ><Send class="h-3 w-3" /></button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <button
        onclick={goto("/plant/create")}
        class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer map-overlay absolute left-6 top-6 "
      >
        {t("createPlant", $language)}
      </button>
  </div>
</div>

<style>
  /* Component-specific styles can go here if needed */
</style>
