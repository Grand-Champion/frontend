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
    Filter,
  } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";
  import ZoomableMap from "./ZoomableMap.svelte";
  import { jwt } from "$lib/stores/jwt";
  import { getPayload } from "$lib/Auth";
  import { getStatus, getStatusColor } from "$lib/utils/plant-helpers";

  // Pak API data
  export let forestData;

  // Get plants array directly from API
  $: plants = forestData?.data?.plants || [];

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
    optimal: { label: t("optimal", $language) },
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
  let showFilters = false;
  const comments = {};
  let commentText = "";

  // Plant care advice messages updaten zonder refresh
  $: if (selectedPlantId !== null) {
    selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;
    if (!selectedPlant) {
      selectedPlantId = null;
    }
  } else {
    selectedPlant = null;
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

      return plants.filter((plant) => {
        const status = getStatus(plant);
        const normalizedStatus = status === "unknown" ? "critical" : status;

        return (
          $categories.includes(plant.species?.type?.toLowerCase() || "tree") &&
          $statuses.includes(normalizedStatus)
        );
      });
    },
  );

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return getStatusColor("optimal");
    const midpoint = (min + max) / 2;
    return Math.abs(current - midpoint) > criticalThreshold
      ? getStatusColor("critical")
      : getStatusColor("attention");
  }

  function viewPlantDetails(plantId) {
    goto(`/plants/${plantId}`);
  }

  $: if (selectedPlant) {
    overallStatus = getStatus(selectedPlant);
    overallColor = getStatusColor(overallStatus);
  } else {
    overallStatus = null;
    overallColor = null;
  }

  // Update alle plant kleuren wanneer plants verandert
  $: plantColors = plants.reduce((map, plant) => {
    map[plant.id] = getStatusColor(getStatus(plant));
    return map;
  }, {});
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (showFilters = false)} />

<div class="relative flex h-full w-full">
  <!-- Left Sidebar (shared filters) -->
  <div
    class="hidden md:block w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <Filters />
  </div>

  <!-- Center map area -->

  <ZoomableMap image={forestData?.data?.image} alt="Food forest aerial view">
    {#each $filteredPlants as plant (plant.id)}
      {#if typeof plant.posX === "number" && typeof plant.posY === "number"}
        {@const config =
          categoryConfig[plant.species?.type?.toLowerCase() || "tree"]}

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
            style="background-color: {plantColors[plant.id]};"
            aria-label="View {plant.name}"
          >
            <svelte:component this={config.icon} class="h-5 w-5" />
          </button>
          <div class="text-xs text-white mt-1 truncate" title={plant.name}>
            {plant.name}
          </div>
          {#if plant.id === 1}
            <div class="text-xs text-white/80 mt-0.5">
              ID: {plant.id}
            </div>
          {/if}
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
    <svelte:fragment slot="over">
      {#if selectedPlant}
        <div
          class="map-overlay fixed top-16 left-0 right-0 bottom-0 md:absolute md:left-auto md:right-6 md:top-6 md:bottom-6 md:w-96 md:max-w-[95%] md:rounded-lg border border-white/40 dark:border-white/10 bg-white/70 dark:bg-green-950/25 backdrop-blur-lg shadow-xl z-50 overflow-y-auto pointer-events-auto"
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
                  ]?.label || t("unknown", $language)}
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
                    `${t("species", $language)} ${selectedPlant.speciesId || ""}`}
                </p>
              </div>
              <button
                onclick={() => (selectedPlantId = null)}
                class="p-2 hover:bg-muted rounded-lg cursor-pointer"
                aria-label={t("back", $language)}><X class="h-4 w-4" /></button
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
                    {t("overallStatus", $language)}
                  </h3>
                  <div
                    class="px-2 py-1 rounded text-xs font-semibold text-white"
                    style={`background-color: ${overallColor};`}
                  >
                    {overallStatus === "optimal"
                      ? t("optimal", $language)
                      : overallStatus === "attention"
                        ? t("needsAttention", $language)
                        : t("critical", $language)}
                  </div>
                </div>
              </div>

              <div>
                <h3 class="mb-3 text-sm font-semibold text-card-foreground">
                  {t("careAdvice", $language)}
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
                  >{t("viewFullDetails", $language)}
                  <ExternalLink class="h-4 w-4" /></button
                >

                <div class="mb-3 flex items-center gap-2">
                  <MessageCircle class="h-4 w-4" />
                  <h3 class="text-sm font-semibold text-card-foreground">
                    {t("comments", $language)} ({Array.isArray(
                      comments[selectedPlant.id],
                    )
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
                    placeholder={t("addComment", $language)}
                    class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onclick={addComment}
                    class="px-3 py-2 rounded-lg border border-border hover:bg-muted cursor-pointer"
                    aria-label={t("send", $language)}
                    ><Send class="h-3 w-3" /></button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      {#if forestData?.data && (getPayload($jwt).role === "admin" || getPayload($jwt).id === forestData.data.ownerId)}
        <div
          class="action-buttons map-overlay absolute left-6 top-6 flex flex-col gap-3"
        >
          <button
            onclick={goto(`/forests/${forestData.data.id}/plants/create`)}
            class="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("createPlant", $language)}
          </button>
          <button
            onclick={goto("/species/create")}
            class="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t("createSpecies", $language)}
          </button>
        </div>
      {/if}
    </svelte:fragment>
  </ZoomableMap>

  <!-- Mobile floating filter button -->
  <div class="md:hidden pointer-events-none">
    <div
      class="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <button
        class="inline-flex w-[92vw] max-w-md items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-card-foreground shadow-sm"
        onclick={() => (showFilters = true)}
      >
        <Filter class="h-4 w-4" />
        {t("filter", $language) || "Filters"}
      </button>
    </div>
  </div>

  <!-- Mobile filter overlay -->
  {#if showFilters}
    <div
      class="md:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-black/20 backdrop-blur-sm"
      role="dialog"
      tabindex="0"
      aria-modal="true"
      aria-label={t("filter", $language) || "Filters"}
      onclick={() => (showFilters = false)}
      onkeydown={(e) => e.key === "Enter" && (showFilters = false)}
    >
      <div
        class="w-full h-full bg-card/85 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto"
        role="presentation"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card/95 backdrop-blur-xl z-10"
        >
          <div
            class="flex items-center gap-2 text-sm font-semibold text-card-foreground"
          >
            <Filter class="h-4 w-4" />
            {t("filters", $language) || "Filters"}
          </div>
          <button
            class="rounded-full p-2 hover:bg-muted"
            onclick={() => (showFilters = false)}
            aria-label={t("close", $language) || "Close"}
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="p-4">
          <Filters />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .action-buttons {
    pointer-events: auto;
  }
</style>
