<script>
  import { derived, writable } from "svelte/store";
  import {
    Leaf,
    Trees,
    Flower2,
    Sprout,
    Search,
    ChevronDown,
    List,
    Grid2x2,
  } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";
  import { language, t } from "$lib/stores/language";

  // API data
  export let forestData;

  // Get plants array from API
  $: plants = forestData?.data?.plants || [];

  // Backend species types (lowercase: tree, shrub, herb, vegetable)
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

  let speciesOpen = true;
  let statusOpen = true;
  const searchTerm = writable("");
  let showFilters = false;
  // Mobile toggle between 1 or 2 columns
  let mobileTwoCols = false;

  // Calculate plant status based on conditions vs species optimal ranges
  function getStatus(plant) {
    if (!plant.conditions || !plant.conditions[0] || !plant.species)
      return "critical";

    let issuesCount = 0;
    const conditions = plant.conditions[0];
    const species = plant.species;

    // Check elke condition tegen min/max ranges van species
    if (
      conditions.temperature < species.minTemperature ||
      conditions.temperature > species.maxTemperature
    ) {
      issuesCount++;
    }
    if (
      conditions.humidity < species.minHumidity ||
      conditions.humidity > species.maxHumidity
    ) {
      issuesCount++;
    }
    if (
      conditions.soilMoisture < species.minSoilMoisture ||
      conditions.soilMoisture > species.maxSoilMoisture
    ) {
      issuesCount++;
    }
    if (
      conditions.soilPH < species.minSoilPH ||
      conditions.soilPH > species.maxSoilPH
    ) {
      issuesCount++;
    }
    if (
      conditions.sunlight < species.minSunlight ||
      conditions.sunlight > species.maxSunlight
    ) {
      issuesCount++;
    }

    if (issuesCount === 0) return "good";
    if (issuesCount <= 2) return "attention";
    return "critical";
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
    [selectedCategories, selectedStatus, searchTerm],
    ([$categories, $statuses, $searchTerm]) => {
      if (!plants || plants.length === 0) return [];

      const term = ($searchTerm || "").trim().toLowerCase();

      return plants.filter((plant) => {
        const inCategory =
          $categories.includes(plant.species?.type?.toLowerCase() || "tree") &&
          $statuses.includes(getStatus(plant));

        if (!inCategory) return false;

        if (!term) return true;

        const name = (plant.species?.name || "").toLowerCase();
        const sci = (plant.species?.scientificName || "").toLowerCase();
        return name.includes(term) || sci.includes(term);
      });
    },
  );
</script>

<svelte:body class:overflow-hidden={showFilters} />
<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape" && showFilters) showFilters = false;
  }}
/>

<div class="flex h-full w-full">
  <!-- Left Sidebar - Filters (shared) -->
  <div
    class="hidden lg:block w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <Filters />
  </div>

  <!-- Main Content - Species Grid -->
  <div class="flex-1 overflow-y-auto bg-background p-6">
    <!-- Mobile Filters Toggle -->
    <div
      class="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-4 pb-[env(safe-area-inset-bottom)]"
    >
      <button
        class="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        on:click={() => (showFilters = !showFilters)}
      >
        <div class="flex items-center justify-between">
          <span>{t("filters", $language)}</span>
          <ChevronDown
            class={"w-4 h-4 transition-transform " +
              (showFilters ? "rotate-180" : "")}
          />
        </div>
      </button>
    </div>

    {#if showFilters}
      <div
        class="lg:hidden fixed left-0 right-0 bottom-0 top-[calc(env(safe-area-inset-top)+4rem)] z-30 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        role="button"
        tabindex="0"
        on:click={() => (showFilters = false)}
        on:keydown={(e) =>
          (e.key === "Enter" || e.key === " ") && (showFilters = false)}
      ></div>
      <div
        class="lg:hidden fixed bottom-20 left-4 right-4 z-40 border border-border bg-card/90 rounded-lg px-4 pb-4 pt-3 shadow-xl backdrop-blur-lg"
      >
        <Filters />
      </div>
    {/if}

    <div class="flex items-center gap-2 mb-4">
      <div class="flex-1">
        <div
          class="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
        >
          <Search class="w-4 h-4 text-muted-foreground" />
          <input
            class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            type="search"
            placeholder={t("searchSpecies", $language)}
            bind:value={$searchTerm}
          />
        </div>
      </div>
      <!-- Mobile column toggle: segmented switch (1 or 2 per row) -->
      <div class="lg:hidden">
        <div
          class="inline-flex items-center rounded-lg border border-border bg-card overflow-hidden"
          role="group"
          aria-label="Mobile grid column switch"
        >
          <button
            class={`px-3 h-9 flex items-center justify-center transition-colors ${
              mobileTwoCols
                ? "text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted"
                : "bg-primary text-primary-foreground hover:bg-primary/80"
            }`}
            title="1 per row"
            aria-label="Single column"
            aria-pressed={!mobileTwoCols}
            on:click={() => (mobileTwoCols = false)}
          >
            <List class="w-4 h-4" />
          </button>
          <button
            class={`px-3 h-9 flex items-center justify-center transition-colors border-l border-border ${
              mobileTwoCols
                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                : "text-muted-foreground hover:text-foreground hover:bg-primary/10 dark:hover:bg-muted"
            }`}
            title="2 per row"
            aria-label="Two columns"
            aria-pressed={mobileTwoCols}
            on:click={() => (mobileTwoCols = true)}
          >
            <Grid2x2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div
      class={"grid " +
        (mobileTwoCols ? "grid-cols-2" : "grid-cols-1") +
        " md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12 lg:pb-6"}
    >
      {#each $filteredPlants as plant (plant.id)}
        {@const category = plant.species?.type?.toLowerCase() || "tree"}
        {@const config = categoryConfig[category]}
        {@const status = getStatus(plant)}
        {@const statusColor = getStatusColor(status)}
        <button
          on:click={() => viewPlant(plant.id)}
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
        >
          <div
            class="relative aspect-video w-full overflow-hidden bg-linear-to-br from-muted to-muted/50"
          >
            <img
              src={plant.image || "/placeholder.svg"}
              alt={plant.species?.name || "Plant"}
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
              style={`background-color: ${config?.color || "var(--category-tree)"};`}
            >
              {config?.label || t("unknown", $language)}
            </div>
            <h3 class="text-lg font-bold text-card-foreground mb-1">
              {plant.species?.name || t("unknown", $language)}
            </h3>
            <p class="text-sm italic text-muted-foreground mb-3">
              {plant.species?.scientificName || ""}
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground"
                  >{t("stage", $language)}:</span
                >
                <span class="font-medium text-card-foreground"
                  >{plant.plantStage || t("unknown", $language)}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground"
                  >{t("water", $language)}:</span
                >
                <span class="font-medium text-card-foreground"
                  >{plant.species?.maintenanceLevel ||
                    t("low", $language)}</span
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
