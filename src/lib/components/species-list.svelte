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
  import { selectedCategories } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import SpeciesFilters from "$lib/components/SpeciesFilters.svelte";
  import { language, t } from "$lib/stores/language";
  import { PUBLIC_API_URL } from "$env/static/public";

  // API data
  export let speciesData;

  // Get species array from API
  $: species = speciesData?.data || [];

  // Search and layout state
  let searchQuery = "";
  let mobileColumns = 1;
  let cardSize = "large"; // 'large', 'medium', 'small'

  // Category config for species types
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

  function handleEdit(id) {
    goto(`/species/${id}/edit`);
  }

  async function handleDelete(id) {
    if (confirm(t("confirmDeleteSpecies", $language))) {
      try {
        const response = await fetch(
          `${PUBLIC_API_URL}/forests/api/v1/species/${id}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          // Reload the page or update the list
          location.reload();
        } else {
          alert("Failed to delete species");
        }
      } catch (error) {
        alert("Error deleting species");
      }
    }
  }

  const filteredSpecies = derived([selectedCategories], ([$categories]) => {
    if (!species || species.length === 0) return [];

    return species.filter((spec) => {
      const matchesCategory = $categories.includes(
        spec.type?.toLowerCase() || "tree",
      );
      const matchesSearch =
        searchQuery.trim() === "" ||
        (spec.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spec.scientificName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (spec.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  });

  // Re-filter when searchQuery changes
  $: filteredSpeciesWithSearch = $filteredSpecies.filter((spec) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      (spec.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spec.scientificName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (spec.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  let showFilters = false;
</script>

<svelte:window
  on:keydown={(e) => e.key === "Escape" && (showFilters = false)}
/>

<div class="relative flex h-full w-full">
  <!-- Left Sidebar - Filters -->
  <div
    class="hidden md:block w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <SpeciesFilters />
  </div>

  <!-- Main Content - Species Grid -->
  <div class="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24 md:pb-6">
    <div class="mb-4 md:mb-6 space-y-4">
      <h1 class="text-2xl md:text-3xl font-bold text-card-foreground">
        {t("species", $language)}
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
            placeholder="Search species..."
            class="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />
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
            title="Large cards"
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
            title="Medium cards"
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
            title="Small cards"
          >
            <Grid3x3 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    <div
      class="grid gap-4 md:gap-6 sm:grid-cols-2 {cardSize === 'large'
        ? 'lg:grid-cols-3 xl:grid-cols-4'
        : cardSize === 'medium'
          ? 'lg:grid-cols-4 xl:grid-cols-5'
          : 'lg:grid-cols-5 xl:grid-cols-6'}"
      class:grid-cols-1={mobileColumns === 1}
      class:grid-cols-2={mobileColumns === 2}
    >
      {#each filteredSpeciesWithSearch as spec (spec.id)}
        {@const category = spec.type?.toLowerCase() || "tree"}
        {@const config = categoryConfig[category]}
        <div
          class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full"
        >
          <div
            class="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-muted to-muted/50 cursor-pointer"
            on:click={() => goto(`/species/${spec.id}`)}
            on:keydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goto(`/species/${spec.id}`);
              }
            }}
            role="button"
            tabindex="0"
          >
            <img
              src={spec.image || "/placeholder.svg"}
              alt={spec.name || "Species"}
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-4">
            <div
              class="mb-2 inline-block px-2 py-1 rounded text-xs font-semibold text-white"
              style={`background-color: ${config?.color || "var(--category-tree)"};`}
            >
              {config?.label || "Unknown"}
            </div>
            <h3 class="text-lg font-bold text-card-foreground mb-1">
              {spec.name || "Unknown"}
            </h3>
            {#if spec.scientificName}
              <p class="text-sm italic text-muted-foreground mb-3">
                {spec.scientificName}
              </p>
            {/if}
            {#if spec.description}
              <p class="text-sm text-muted-foreground mb-3">
                {spec.description}
              </p>
            {/if}
            <div class="space-y-2 text-sm mb-3">
              {#if spec.harvestSeason}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">
                    {t("harvestSeason", $language) || "Harvest"}:
                  </span>
                  <span class="font-medium text-card-foreground">
                    {spec.harvestSeason}
                  </span>
                </div>
              {/if}
              {#if spec.sunRequirement}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">
                    {t("sunRequirement", $language) || "Sun"}:
                  </span>
                  <span class="font-medium text-card-foreground">
                    {spec.sunRequirement}
                  </span>
                </div>
              {/if}
              {#if spec.waterNeeds}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">
                    {t("waterNeeds", $language) || "Water"}:
                  </span>
                  <span class="font-medium text-card-foreground">
                    {spec.waterNeeds}
                  </span>
                </div>
              {/if}
              {#if spec.maintenance}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">
                    {t("maintenanceLevel", $language) || "Maintenance Level"}:
                  </span>
                  <span class="font-medium text-card-foreground">
                    {spec.maintenance}
                  </span>
                </div>
              {/if}
            </div>
          </div>
        </div>
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
        class="w-full h-full bg-card/85 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto"
        role="presentation"
        on:click={(e) => e.stopPropagation()}
        on:keydown={(e) => e.stopPropagation()}
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
          <SpeciesFilters />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
</style>
