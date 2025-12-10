<script>
  import { derived } from "svelte/store";
  import { Leaf, Trees, Flower2, Sprout } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";
  import { language, t } from "$lib/stores/language";

  // API data
  export let forestData;

  // Get plants array from API
  $: plants = forestData?.data?.plants || [];

  // Gebruik backend species types direct (Tree, Shrub, Plant)
  $: categoryConfig = {
    Tree: {
      label: t("trees", $language),
      icon: Trees,
      color: "var(--category-tree)",
    },
    Shrub: {
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

  let speciesOpen = true;
  let statusOpen = true;

  // Calculate plant status based on conditions vs species optimal ranges
  function getStatus(plant) {
    if (!plant.conditions || !plant.species) return 'critical';
    
    let issuesCount = 0;
    const conditions = plant.conditions;
    const species = plant.species;

    // Check elke condition tegen min/max ranges van species
    if (conditions.temperature < species.minTemperature || conditions.temperature > species.maxTemperature) {
      issuesCount++;
    }
    if (conditions.humidity < species.minHumidity || conditions.humidity > species.maxHumidity) {
      issuesCount++;
    }
    if (conditions.soilMoisture < species.minSoilMoisture || conditions.soilMoisture > species.maxSoilMoisture) {
      issuesCount++;
    }
    if (conditions.soilPH < species.minSoilPH || conditions.soilPH > species.maxSoilPH) {
      issuesCount++;
    }
    if (conditions.sunlight < species.minSunlight || conditions.sunlight > species.maxSunlight) {
      issuesCount++;
    }

    if (issuesCount === 0) return 'good';
    if (issuesCount <= 2) return 'attention';
    return 'critical';
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
    [selectedCategories, selectedStatus],
    ([$categories, $statuses]) => {
      if (!plants || plants.length === 0) return [];
      
      return plants.filter((plant) =>
        $categories.includes(plant.species?.type || 'Tree') &&
        $statuses.includes(getStatus(plant))
      );
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
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {#each $filteredPlants as plant (plant.id)}
        {@const category = plant.species?.type || 'Tree'}
        {@const config = categoryConfig[category]}
        {@const status = getStatus(plant)}
        {@const statusColor = getStatusColor(status)}
        <button
          on:click={() => viewPlant(plant.id)}
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
        >
          <div
            class="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-muted to-muted/50"
          >
            <img
              src={plant.image || "/placeholder.svg"}
              alt={plant.species?.name || 'Plant'}
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 right-2">
              <div
                class="h-4 w-4 rounded-full border-2 border-white shadow-md"
                style={`background-color: ${statusColor};`}
              ></div>
            </div>
          </div>
          <div class="p-4">
            <div
              class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold text-white"
              style={`background-color: ${config.color};`}
            >
              {config.label}
            </div>
            <h3 class="text-lg font-bold text-card-foreground mb-1">
              {plant.species?.name || 'Unknown'}
            </h3>
            <p class="text-sm italic text-muted-foreground mb-3">
              {plant.species?.scientificName || ''}
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Stage:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.plantStage || "Unknown"}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Water:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.species?.maintenanceLevel || 'Low'}</span
                >
              </div>
            </div>
            <div class="mt-3 text-xs">
              <div
                class="inline-block px-2 py-1 rounded-full font-semibold text-white"
                style={`background-color: ${getStatusColor(status)};`}
              >
                {status === "good"
                  ? t("good", $language)
                  : status === "attention"
                    ? t("needsAttention", $language)
                    : t("critical", $language)}
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
