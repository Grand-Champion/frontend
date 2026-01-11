<script>
  import { derived } from "svelte/store";
  import { Leaf, Trees, Flower2, Sprout, Filter, X } from "lucide-svelte";
  import { selectedCategories } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import SpeciesFilters from "$lib/components/SpeciesFilters.svelte";
  import { language, t } from "$lib/stores/language";
  import { PUBLIC_API_URL } from "$env/static/public";

  // API data
  export let speciesData;

  // Get species array from API
  $: species = speciesData?.data || [];

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

    return species.filter((spec) =>
      $categories.includes(spec.type?.toLowerCase() || "tree"),
    );
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
    <div class="mb-4 md:mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-card-foreground">
        {t("species", $language)}
      </h1>
    </div>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      {#each $filteredSpecies as spec (spec.id)}
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
      class="md:hidden fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
      role="dialog"
      tabindex="0"
      aria-modal="true"
      aria-label={t("filter", $language) || "Filters"}
      on:click={() => (showFilters = false)}
      on:keydown={(e) => e.key === "Enter" && (showFilters = false)}
    >
      <div
        class="w-full rounded-t-3xl bg-card/85 backdrop-blur-xl border border-border shadow-2xl"
        on:click={(e) => e.stopPropagation()}
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-border"
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
        <div class="max-h-[70vh] overflow-y-auto p-4">
          <SpeciesFilters />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
</style>
