<script>
  import { derived } from "svelte/store";
  import { localizedPlants } from "$lib/localized-plants";
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

  // Small configs used for icons/labels
  $: categoryConfig = {
    tree: {
      label: t("trees", $language),
      icon: Trees,
      color: "bg-emerald-600",
    },
    shrub: {
      label: t("shrubs", $language),
      icon: Sprout,
      color: "bg-teal-600",
    },
    herb: { label: t("herbs", $language), icon: Leaf, color: "bg-lime-600" },
    vegetable: {
      label: t("vegetables", $language),
      icon: Flower2,
      color: "bg-amber-600",
    },
  };

  $: statusConfig = {
    good: { label: t("good", $language) },
    attention: { label: t("needsAttention", $language) },
    critical: { label: t("critical", $language) },
  };

  // Local UI state
  let selectedPlant = null;
  let speciesOpen = true;
  let maintenanceOpen = true;
  let hoveredPlantId = null;
  let comments = {};
  let commentText = "";

  // Calculate a simple status based on differences
  function calculateStatus(current, optimal) {
    let issueCount = 0;
    let criticalCount = 0;

    const tempDiff = Math.max(
      optimal.temperature.min - current.temperature,
      current.temperature - optimal.temperature.max,
      0,
    );
    if (tempDiff > 0) tempDiff > 5 ? criticalCount++ : issueCount++;

    const humidityDiff = Math.max(
      optimal.humidity.min - current.humidity,
      current.humidity - optimal.humidity.max,
      0,
    );
    if (humidityDiff > 0) humidityDiff > 15 ? criticalCount++ : issueCount++;

    const moistureDiff = Math.max(
      optimal.soilMoisture.min - current.soilMoisture,
      current.soilMoisture - optimal.soilMoisture.max,
      0,
    );
    if (moistureDiff > 0) moistureDiff > 20 ? criticalCount++ : issueCount++;

    const sunlightDiff = Math.max(
      optimal.sunlightHours.min - current.sunlightHours,
      current.sunlightHours - optimal.sunlightHours.max,
      0,
    );
    if (sunlightDiff > 0) sunlightDiff > 2 ? criticalCount++ : issueCount++;

    if (criticalCount >= 2) return "critical";
    if (criticalCount >= 1 || issueCount >= 2) return "attention";
    return "good";
  }

  function getStatusColor(status) {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "attention":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
    }
  }

  function formatStage(stage) {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  function generateAdvice(plant) {
    const advice = [];
    const current = plant.currentConditions;
    const optimal = plant.optimalConditions;

    if (current.temperature < optimal.temperature.min)
      advice.push("Temperature too cold.");
    else if (current.temperature > optimal.temperature.max)
      advice.push("Temperature too hot.");

    if (current.humidity < optimal.humidity.min)
      advice.push("Humidity too low.");
    else if (current.humidity > optimal.humidity.max)
      advice.push("Humidity too high.");

    if (current.soilMoisture < optimal.soilMoisture.min)
      advice.push("Soil too dry.");
    else if (current.soilMoisture > optimal.soilMoisture.max)
      advice.push("Soil too wet.");

    return advice.length ? advice : ["All conditions are optimal."];
  }

  function toggleCategory(category) {
    // support explicit checked value when passed from an input event
    return (checked) => {
      if (typeof checked === "boolean") {
        selectedCategories.update((categories) =>
          checked
            ? [...new Set([...categories, category])]
            : categories.filter((c) => c !== category),
        );
      } else {
        // fallback toggle behavior
        selectedCategories.update((categories) =>
          categories.includes(category)
            ? categories.filter((c) => c !== category)
            : [...categories, category],
        );
      }
    };
  }

  function toggleStatus(status) {
    // support explicit checked value when passed from an input event
    return (checked) => {
      if (typeof checked === "boolean") {
        selectedStatus.update((statuses) =>
          checked
            ? [...new Set([...statuses, status])]
            : statuses.filter((s) => s !== status),
        );
      } else {
        // fallback toggle behavior
        selectedStatus.update((statuses) =>
          statuses.includes(status)
            ? statuses.filter((s) => s !== status)
            : [...statuses, status],
        );
      }
    };
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
    [selectedCategories, selectedStatus, localizedPlants],
    ([$categories, $statuses, $plants]) => {
      const res = $plants.filter(
        (plant) =>
          $categories.includes(plant.category) &&
          $statuses.includes(
            calculateStatus(plant.currentConditions, plant.optimalConditions),
          ),
      );
      // console.log(
      //   "[map] filteredPlants recompute",
      //   $categories,
      //   $statuses,
      //   "->",
      //   res.length,
      // );
      return res;
    },
  );

  function getConditionColor(current, min, max, criticalThreshold) {
    if (current >= min && current <= max) return "text-green-600";
    const midpoint = (min + max) / 2;
    return Math.abs(current - midpoint) > criticalThreshold
      ? "text-red-600"
      : "text-orange-600";
  }

  function viewPlantDetails(plantId) {
    goto(`/plant/${plantId}`);
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
  <div class="relative flex-1 bg-muted">
    <div class="absolute inset-0">
      <img
        src="/images/food-forest-map.jpg"
        alt="Food forest aerial view"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/10"></div>
    </div>

    <div class="absolute inset-0">
      {#each $filteredPlants as plant (plant.id)}
        {@const config = categoryConfig[plant.category]}
        {@const status = calculateStatus(
          plant.currentConditions,
          plant.optimalConditions,
        )}
        {@const statusColor = getStatusColor(status)}

        <button
          on:click={() => (selectedPlant = plant)}
          on:mouseenter={() => (hoveredPlantId = plant.id)}
          on:mouseleave={() => (hoveredPlantId = null)}
          class="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full {statusColor} text-white shadow-lg transition-transform hover:scale-110"
          style="left: {plant.position.x}%; top: {plant.position.y}%"
          aria-label="View {plant.name}"
        >
          <svelte:component this={config.icon} class="h-5 w-5" />
        </button>

        {#if hoveredPlantId === plant.id}
          <div
            class="absolute rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg whitespace-nowrap pointer-events-none z-50"
            style="left: {plant.position.x}%; top: calc({plant.position
              .y}% + 30px); transform: translateX(-50%);"
          >
            {plant.name}
          </div>
        {/if}
      {/each}
    </div>

    {#if selectedPlant}
      <div
        class="map-overlay absolute right-6 top-6 bottom-6 w-96 max-w-[95%] rounded-lg border border-border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md shadow-lg z-50 overflow-y-auto pointer-events-auto"
      >
        <div class="p-6">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex-1">
              <div
                class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold {categoryConfig[
                  selectedPlant.category
                ].color} text-primary-foreground"
              >
                {categoryConfig[selectedPlant.category].label}
              </div>
              <h2 class="text-2xl font-bold text-card-foreground">
                {selectedPlant.name}
              </h2>
              <p class="text-sm italic text-muted-foreground">
                {selectedPlant.scientificName}
              </p>
            </div>
            <button
              on:click={() => (selectedPlant = null)}
              class="p-2 hover:bg-muted rounded-lg"
              aria-label="Close details"><X class="h-4 w-4" /></button
            >
          </div>

          <div class="space-y-6">
            <div
              class="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={selectedPlant.image || "/placeholder.svg"}
                alt={selectedPlant.name}
                class="w-full h-full object-cover"
              />
            </div>

            <div
              class="rounded-lg p-4 {calculateStatus(
                selectedPlant.currentConditions,
                selectedPlant.optimalConditions,
              ) === 'good'
                ? 'bg-green-50 border border-green-200'
                : calculateStatus(
                      selectedPlant.currentConditions,
                      selectedPlant.optimalConditions,
                    ) === 'attention'
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-red-50 border border-red-200'}"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-card-foreground">
                  Overall Status
                </h3>
                <div
                  class="px-2 py-1 rounded text-xs font-semibold {getStatusColor(
                    calculateStatus(
                      selectedPlant.currentConditions,
                      selectedPlant.optimalConditions,
                    ),
                  )} text-white"
                >
                  {calculateStatus(
                    selectedPlant.currentConditions,
                    selectedPlant.optimalConditions,
                  ) === "good"
                    ? "Optimal"
                    : calculateStatus(
                          selectedPlant.currentConditions,
                          selectedPlant.optimalConditions,
                        ) === "attention"
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
                class="space-y-2 rounded-lg bg-blue-50 border border-blue-200 p-4"
              >
                {#each generateAdvice(selectedPlant) as advice}
                  <p class="text-sm text-blue-900">{advice}</p>
                {/each}
              </div>
            </div>

            <div>
              <button
                on:click={() => viewPlantDetails(selectedPlant.id)}
                class="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >View Full Details <ExternalLink class="h-4 w-4" /></button
              >

              <div class="mb-3 flex items-center gap-2">
                <MessageCircle class="h-4 w-4" />
                <h3 class="text-sm font-semibold text-card-foreground">
                  Comments ({comments[selectedPlant.id]?.length || 0})
                </h3>
              </div>

              <div class="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {#each comments[selectedPlant.id] || [] as comment}
                  <div class="rounded-lg bg-muted p-2">
                    <p class="text-sm text-muted-foreground">{comment}</p>
                  </div>
                {/each}
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={commentText}
                  on:keypress={(e) => e.key === "Enter" && addComment()}
                  placeholder="Add a comment..."
                  class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  on:click={addComment}
                  class="px-3 py-2 rounded-lg border border-border hover:bg-muted"
                  ><Send class="h-3 w-3" /></button
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.map-overlay::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :global(.map-overlay::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.map-overlay::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 9999px;
    border: 1px solid transparent;
    background-clip: padding-box;
    transition: background-color 120ms ease;
  }

  :global(.map-overlay:hover::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.12);
  }

  :global(.dark .map-overlay::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.06);
  }

  :global(.dark .map-overlay:hover::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.12);
  }

  :global(.map-overlay) {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.06) transparent;
  }

  :global(.dark .map-overlay) {
    scrollbar-color: rgba(255, 255, 255, 0.06) transparent;
  }
</style>
