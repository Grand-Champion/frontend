<script>
  import { derived } from "svelte/store";
  import { localizedPlants } from "$lib/localized-plants";
  import { Leaf, Trees, Flower2, Sprout, ChevronDown } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";
  import { language, t } from "$lib/stores/language";

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

  let speciesOpen = true;
  let statusOpen = true;

  function calculateStatus(current, optimal) {
    let issueCount = 0;
    let criticalCount = 0;

    const tempDiff = Math.max(
      optimal.temperature.min - current.temperature,
      current.temperature - optimal.temperature.max,
      0,
    );
    if (tempDiff > 0) {
      if (tempDiff > 5) criticalCount++;
      else issueCount++;
    }

    const humidityDiff = Math.max(
      optimal.humidity.min - current.humidity,
      current.humidity - optimal.humidity.max,
      0,
    );
    if (humidityDiff > 0) {
      if (humidityDiff > 15) criticalCount++;
      else issueCount++;
    }

    const phDiff = Math.max(
      optimal.soilPH.min - current.soilPH,
      current.soilPH - optimal.soilPH.max,
      0,
    );
    if (phDiff > 0) {
      if (phDiff > 0.5) criticalCount++;
      else issueCount++;
    }

    const moistureDiff = Math.max(
      optimal.soilMoisture.min - current.soilMoisture,
      current.soilMoisture - optimal.soilMoisture.max,
      0,
    );
    if (moistureDiff > 0) {
      if (moistureDiff > 20) criticalCount++;
      else issueCount++;
    }

    const sunlightDiff = Math.max(
      optimal.sunlightHours.min - current.sunlightHours,
      current.sunlightHours - optimal.sunlightHours.max,
      0,
    );
    if (sunlightDiff > 0) {
      if (sunlightDiff > 2) criticalCount++;
      else issueCount++;
    }

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

  function toggleCategory(category) {
    selectedCategories.update((categories) => {
      if (categories.includes(category)) {
        return categories.filter((c) => c !== category);
      } else {
        return [...categories, category];
      }
    });
  }

  function toggleStatus(status) {
    selectedStatus.update((statuses) => {
      if (statuses.includes(status)) {
        return statuses.filter((s) => s !== status);
      } else {
        return [...statuses, status];
      }
    });
  }

  function viewPlant(plantId) {
    goto(`/plant/${plantId}`);
  }

  const filteredPlants = derived(
    [selectedCategories, selectedStatus, localizedPlants],
    ([$categories, $statuses, $plants]) => {
      const res = $plants.filter((plant) => {
        const status = calculateStatus(
          plant.currentConditions,
          plant.optimalConditions,
        );
        return (
          $categories.includes(plant.category) && $statuses.includes(status)
        );
      });
      // console.log(
      //   "[species-list] filteredPlants recompute",
      //   $categories,
      //   $statuses,
      //   "->",
      //   res.length,
      // );
      return res;
    },
  );
</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar - Filters (shared) -->
  <div
    class="w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <Filters />
  </div>

  <!-- Main Content - Species Grid -->
  <div class="flex-1 overflow-y-auto bg-background p-6">
    <div
      class="grid gap-6"
      style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"
    >
      {#each $filteredPlants as plant (plant.id)}
        {@const config = categoryConfig[plant.category]}
        {@const status = calculateStatus(
          plant.currentConditions,
          plant.optimalConditions,
        )}
        {@const statusColor = getStatusColor(status)}
        <button
          on:click={() => viewPlant(plant.id)}
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full cursor-pointer"
        >
          <div
            class="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50"
          >
            <img
              src={plant.image || "/placeholder.svg"}
              alt={plant.name}
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 right-2">
              <div
                class="h-4 w-4 rounded-full {statusColor} border-2 border-white shadow-md"
              ></div>
            </div>
          </div>
          <div class="p-4">
            <div
              class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold {config.color} text-white"
            >
              {config.label}
            </div>
            <h3 class="text-lg font-bold text-card-foreground mb-1">
              {plant.name}
            </h3>
            <p class="text-sm italic text-muted-foreground mb-3">
              {plant.scientificName}
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Harvest:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.harvestSeason}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Height:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.height}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sun:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.sunRequirement}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Water:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.waterNeeds}</span
                >
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
