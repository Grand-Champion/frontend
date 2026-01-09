<script>
  import { derived } from "svelte/store";
  import { Leaf, Trees, Flower2, Sprout } from "lucide-svelte";
  import { selectedCategories } from "$lib/stores/filters";
  import { goto } from "$app/navigation";
  import SpeciesFilters from "$lib/components/SpeciesFilters.svelte";
  import { language, t } from "$lib/stores/language";
  import { PUBLIC_API_URL } from '$env/static/public';

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
        const response = await fetch(`${PUBLIC_API_URL}/forests/api/v1/species/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Reload the page or update the list
          location.reload();
        } else {
          alert('Failed to delete species');
        }
      } catch (error) {
        alert('Error deleting species');
      }
    }
  }

  const filteredSpecies = derived(
    [selectedCategories],
    ([$categories]) => {
      if (!species || species.length === 0) return [];

      return species.filter(
        (spec) =>
          $categories.includes(spec.type?.toLowerCase() || "tree"),
      );
    },
  );
</script>

<div class="flex h-full w-full">
  <!-- Left Sidebar - Filters -->
  <div
    class="w-64 rounded-none border-y-0 border-l-0 bg-card border-r border-border"
  >
    <SpeciesFilters />
  </div>

  <!-- Main Content - Species Grid -->
  <div class="flex-1 overflow-y-auto bg-background p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-card-foreground">{t("species", $language)}</h1>
    </div>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
            on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/species/${spec.id}`) } }}
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
                  <span class="text-muted-foreground">{t("harvestSeason", $language) || "Harvest"}:</span>
                  <span class="font-medium text-card-foreground">{spec.harvestSeason}</span>
                </div>
              {/if}
              {#if spec.sunRequirement}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{t("sunRequirement", $language) || "Sun"}:</span>
                  <span class="font-medium text-card-foreground">{spec.sunRequirement}</span>
                </div>
              {/if}
              {#if spec.waterNeeds}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{t("waterNeeds", $language) || "Water"}:</span>
                  <span class="font-medium text-card-foreground">{spec.waterNeeds}</span>
                </div>
              {/if}
              {#if spec.maintenance}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{t("maintenanceLevel", $language) || "Maintenance Level"}:</span>
                  <span class="font-medium text-card-foreground">{spec.maintenance}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

  <style>
  </style>