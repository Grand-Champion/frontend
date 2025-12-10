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
      color: "bg-emerald-600",
    },
    Shrub: {
      label: t("shrubs", $language),
      icon: Sprout,
      color: "bg-teal-600",
    },
    Plant: { label: t("herbs", $language), icon: Leaf, color: "bg-lime-600" },
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
        return "bg-green-500";
      case "attention":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  async function viewSpecies(speciesId) {
    await goto(`/plant/${speciesId}`);
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
          on:click={() => viewSpecies(plant.id)}
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
                <span class="text-muted-foreground">Height:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.height || "N/A"}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sun:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.species ? `${plant.species.minSunlight}-${plant.species.maxSunlight}h` : 'N/A'}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Maintenance:</span>
                <span class="font-medium text-card-foreground"
                  >{plant.species?.maintenanceLevel || 'Low'}</span
                >
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
