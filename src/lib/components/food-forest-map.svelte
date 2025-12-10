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

  
   // Bepaal de category van een plant op basis van species.
  function getCategory(plant) {
    if (!plant.species || !plant.species.type) return 'tree';
    
    const type = plant.species.type.toLowerCase();
    
    // Map database type naar frontend category
    if (type === 'tree') return 'tree';
    if (type === 'shrub') return 'shrub';
    if (type === 'plant') return 'herb'; // Database "Plant" → Frontend "herb"
    return 'vegetable';
  }

  // calculate status based on species optimal ranges
  function getStatus(plant) {
    if (!plant.conditions) return 'critical';
    if (!plant.species) return 'critical';
    
    const c = plant.conditions;
    const s = plant.species;
    let issuesCount = 0;
    
    // Check conditions met species ranges
    if (s.minTemperature !== null && s.maxTemperature !== null) {
      if (c.temperature < s.minTemperature || c.temperature > s.maxTemperature) {
        issuesCount++;
      }
    }
    
    if (s.minHumidity !== null && s.maxHumidity !== null) {
      if (c.humidity < s.minHumidity || c.humidity > s.maxHumidity) {
        issuesCount++;
      }
    }
    
    if (s.minSoilMoisture !== null && s.maxSoilMoisture !== null) {
      if (c.soilMoisture < s.minSoilMoisture || c.soilMoisture > s.maxSoilMoisture) {
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
    if (issuesCount === 0) return 'good';
    if (issuesCount <= 2) return 'attention';
    return 'critical';
  }

  // Dit is een test voor hoe we van engels naar nederlands kunnen translaten
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

  // Local UI state
  let selectedPlant = null;
  let hoveredPlantId = null;
  const comments = {};
  let commentText = "";

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

  function generateAdvice(plant) {
    const advice = [];
    
    // Check of conditions bestaan
    if (!plant.conditions) {
      return ["No condition data available."];
    }
    
    // Check of specie data bestaat
    if (!plant.species) {
      return ["No species data available for optimal range comparison."];
    }
    
    const c = plant.conditions;
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
          $categories.includes(getCategory(plant)) &&
          $statuses.includes(getStatus(plant))
      );
    },
  );

  async function viewPlantDetails(plantId) {
    await goto(`/plant/${plantId}`);
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
        {@const config = categoryConfig[getCategory(plant)]}
        {@const status = getStatus(plant)}
        {@const statusColor = getStatusColor(status)}

        <button
          on:click={() => (selectedPlant = plant)}
          on:mouseenter={() => (hoveredPlantId = plant.id)}
          on:mouseleave={() => (hoveredPlantId = null)}
          class="absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full {statusColor} text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
          style="left: {plant.posX}%; top: {plant.posY}%"
          aria-label="View Plant {plant.id}"
        >
          <svelte:component this={config.icon} class="h-5 w-5" />
        </button>

        {#if hoveredPlantId === plant.id}
          <div
            class="absolute rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg whitespace-nowrap pointer-events-none z-50"
            style="left: {plant.posX}%; top: calc({plant.posY}% + 30px); transform: translateX(-50%);"
          >
            Plant {plant.id} - {plant.plantStage}
          </div>
        {/if}
      {/each}
    </div>

    {#if selectedPlant}
      <div
        class="map-overlay absolute right-6 top-6 bottom-6 w-96 max-w-[95%] rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-lg z-50 overflow-y-auto pointer-events-auto"
      >
        <div class="p-6">
          <div class="mb-4 flex items-start justify-between">
            <div class="flex-1">
              <div
                class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold {categoryConfig[
                  getCategory(selectedPlant)
                ].color} text-primary-foreground"
              >
                {categoryConfig[getCategory(selectedPlant)].label}
              </div>
              <h2 class="text-2xl font-bold text-card-foreground">
                {selectedPlant.species?.name || `Plant ${selectedPlant.id}`}
              </h2>
              <p class="text-sm italic text-muted-foreground">
                {selectedPlant.species?.scientificName || `Species ${selectedPlant.speciesId}`}
              </p>
            </div>
            <button
              on:click={() => (selectedPlant = null)}
              class="p-2 hover:bg-muted rounded-lg cursor-pointer"
              aria-label="Close details"><X class="h-4 w-4" /></button
            >
          </div>

          <div class="space-y-6">
            <div
              class="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={selectedPlant.image || "/placeholder.svg"}
                alt="Plant {selectedPlant.id}"
                class="w-full h-full object-cover"
              />
            </div>

            <div
              class="rounded-lg p-4 border {getStatus(selectedPlant) === 'good'
                ? 'bg-green-500/10 border-green-500/30'
                : getStatus(selectedPlant) === 'attention'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-red-500/10 border-red-500/30'}"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-card-foreground">
                  Overall Status
                </h3>
                <div
                  class="px-2 py-1 rounded text-xs font-semibold {getStatusColor(
                    getStatus(selectedPlant)
                  )} text-white"
                >
                  {getStatus(selectedPlant) === "good"
                    ? "Optimal"
                    : getStatus(selectedPlant) === "attention"
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
                class="space-y-2 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4"
              >
                {#each generateAdvice(selectedPlant) as advice, i (i)}
                  <p class="text-sm text-foreground">{advice}</p>
                {/each}
              </div>
            </div>

            <div>
              <button
                on:click={() => viewPlantDetails(selectedPlant.id)}
                class="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer"
                >View Full Details <ExternalLink class="h-4 w-4" /></button
              >

              <div class="mb-3 flex items-center gap-2">
                <MessageCircle class="h-4 w-4" />
                <h3 class="text-sm font-semibold text-card-foreground">
                  Comments ({comments[selectedPlant.id]?.length || 0})
                </h3>
              </div>

              <div class="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {#each comments[selectedPlant.id] || [] as comment, i (i)}
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
                  class="px-3 py-2 rounded-lg border border-border hover:bg-muted cursor-pointer"
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
