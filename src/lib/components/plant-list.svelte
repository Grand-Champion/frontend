<script>
  import { derived } from "svelte/store";
  import {
    Leaf,
    Trees,
    Flower2,
    Sprout,
    Filter,
    X,
    Square,
    Columns,
    Grid2x2,
    Grid3x3,
    Search,
  } from "lucide-svelte";
  import { selectedCategories, selectedStatus } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import Filters from "$lib/components/Filters.svelte";
  import { language, t } from "$lib/stores/language";
  import { getStatus, getStatusColor } from "$lib/utils/plant-helpers";

  // API data
  export let forestData;

  // Get plants array from API
  $: plants = forestData?.data?.plants || [];

  // Search and layout state
  let searchQuery = "";
  let mobileColumns = 1;
  let cardSize = "large"; // 'large', 'medium', 'small'

  // Gebruik backend species types direct (lowercase: tree, shrub, herb, vegetable)
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

  let showFilters = false;

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
    goto(`/plants/${plantId}`);
  }

  // Update alle plant status en kleuren wanneer plants verandert
  $: plantStatus = plants.reduce((map, plant) => {
    const status = getStatus(plant);
    map[plant.id] = {
      status,
      color: getStatusColor(status),
    };
    return map;
  }, {});

  const filteredPlants = derived(
    [selectedCategories, selectedStatus],
    ([$categories, $statuses]) => {
      if (!plants || plants.length === 0) return [];

      return plants.filter((plant) => {
        const status = getStatus(plant);
        // 'unknown' is zelfde als 'critical' voor filters
        const normalizedStatus = status === "unknown" ? "critical" : status;

        // Apply category and status filters
        const matchesCategory = $categories.includes(
          plant.species?.type?.toLowerCase() || "tree",
        );
        const matchesStatus = $statuses.includes(normalizedStatus);

        // Apply search filter
        const matchesSearch =
          searchQuery.trim() === "" ||
          (plant.species?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (plant.species?.scientificName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchesCategory && matchesStatus && matchesSearch;
      });
    },
  );

  // Re-filter when searchQuery changes
  $: filteredPlantsWithSearch = $filteredPlants.filter((plant) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      (plant.species?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (plant.species?.scientificName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
</script>

<svelte:window
  on:keydown={(e) => e.key === "Escape" && (showFilters = false)}
/>

<div class="relative flex h-full w-full">
  <!-- Left Sidebar - Filters (desktop) -->
  <div
    class="hidden md:block w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <Filters />
  </div>

  <!-- Main Content - Species Grid -->
  <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24 md:pb-6">
    <div class="mb-4 md:mb-6 space-y-4">
      <h1 class="text-2xl md:text-3xl font-bold text-card-foreground">
        {t("plantsList", $language)}
      </h1>

      <!-- Search and Layout Controls -->
      <div class="flex flex-row gap-3 items-center">
        <div
          class="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground flex-1"
        >
          <Search class="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder={t("searchPlants", $language)}
            class="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        <!-- Desktop Card Size Toggle (hidden on mobile) -->
        <div
          class="hidden md:flex border border-border rounded-lg overflow-hidden"
        >
          <button
            on:click={() => (cardSize = "large")}
            class="p-2 transition-colors {cardSize === 'large'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground hover:bg-muted'}"
            aria-label="Large cards"
            title="Large"
          >
            <Square class="w-5 h-5" />
          </button>
          <div class="w-px bg-border"></div>
          <button
            on:click={() => (cardSize = "medium")}
            class="p-2 transition-colors {cardSize === 'medium'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground hover:bg-muted'}"
            aria-label="Medium cards"
            title="Medium"
          >
            <Grid2x2 class="w-5 h-5" />
          </button>
          <div class="w-px bg-border"></div>
          <button
            on:click={() => (cardSize = "small")}
            class="p-2 transition-colors {cardSize === 'small'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground hover:bg-muted'}"
            aria-label="Small cards"
            title="Small"
          >
            <Grid3x3 class="w-5 h-5" />
          </button>
        </div>

        <!-- Mobile Columns Toggle (hidden on desktop) -->
        <div
          class="md:hidden flex border border-border rounded-lg overflow-hidden"
        >
          <button
            on:click={() => (mobileColumns = 1)}
            class="p-2 transition-colors {mobileColumns === 1
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground hover:bg-muted'}"
            aria-label="1 column"
            title="1 column"
          >
            <Square class="w-5 h-5" />
          </button>
          <div class="w-px bg-border"></div>
          <button
            on:click={() => (mobileColumns = 2)}
            class="p-2 transition-colors {mobileColumns === 2
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground hover:bg-muted'}"
            aria-label="2 columns"
            title="2 columns"
          >
            <Columns class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div
      class="gap-4 md:gap-6"
      class:grid={true}
      class:grid-cols-1={mobileColumns === 1}
      class:grid-cols-2={mobileColumns === 2}
      class:sm:grid-cols-2={cardSize === "large"}
      class:lg:grid-cols-3={cardSize === "large"}
      class:xl:grid-cols-4={cardSize === "large"}
      class:sm:grid-cols-3={cardSize === "medium"}
      class:lg:grid-cols-4={cardSize === "medium"}
      class:xl:grid-cols-5={cardSize === "medium"}
      class:sm:grid-cols-4={cardSize === "small"}
      class:lg:grid-cols-5={cardSize === "small"}
      class:xl:grid-cols-6={cardSize === "small"}
    >
      {#each filteredPlantsWithSearch as plant (plant.id)}
        {@const category = plant.species?.type?.toLowerCase() || "tree"}
        {@const config = categoryConfig[category]}
        <button
          on:click={() => viewPlant(plant.id)}
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
        >
          <div
            class="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-muted to-muted/50"
          >
            <img
              src={plant.image || plant.species?.image || "/placeholder.svg"}
              alt={plant.species?.name || "Plant"}
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 right-2">
              <div
                class="h-4 w-4 rounded-full border-2 border-white shadow-md"
                style={`background-color: ${plantStatus[plant.id]?.color};`}
              ></div>
            </div>
          </div>
          <div class="p-4">
            <div
              class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold text-white"
              style={`background-color: ${config?.color || "var(--category-tree)"};`}
            >
              {config?.label || "Unknown"}
            </div>
            <h3 class="text-lg font-bold text-card-foreground mb-1">
              {plant.species?.name || "Unknown"}
            </h3>
            <p class="text-sm italic text-muted-foreground mb-3">
              {plant.species?.scientificName || ""}
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
                  >{plant.species?.maintenanceLevel || "Low"}</span
                >
              </div>
            </div>
            <div class="mt-3 text-xs">
              <div
                class="inline-block px-2 py-1 rounded-full font-semibold text-white"
                style={`background-color: ${plantStatus[plant.id]?.color};`}
              >
                {plantStatus[plant.id]?.status === "optimal"
                  ? t("optimal", $language)
                  : plantStatus[plant.id]?.status === "attention"
                    ? t("needsAttention", $language)
                    : t("critical", $language)}
              </div>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Mobile floating filter button -->
  <div class="md:hidden pointer-events-none">
    <div
      class="pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
    >
      <button
        class="inline-flex w-[92vw] max-w-md items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-card-foreground shadow-sm"
        on:click={() => (showFilters = true)}
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
      on:click={() => (showFilters = false)}
      on:keydown={(e) => e.key === "Enter" && (showFilters = false)}
    >
      <div
        role="presentation"
        class="w-full h-full bg-card/85 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto"
        on:click={(e) => e.stopPropagation()}
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
            on:click={() => (showFilters = false)}
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
