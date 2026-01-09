<script>
  import { Trees, ListTree, Sprout, Leaf } from "lucide-svelte";
  import { language, t } from "$lib/stores/language";

  $: pageTitle = `${t("home", $language)} - Food Forest`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-background overflow-y-auto">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="text-center mb-16">
      <div class="flex justify-center mb-6">
        <div class="relative">
          <Trees class="w-20 h-20 text-primary" />
          <Sprout
            class="w-10 h-10 text-secondary absolute -bottom-2 -right-2"
          />
        </div>
      </div>
      <h1 class="text-5xl font-bold text-foreground mb-4">
        {t("foodGarden", $language)}
      </h1>
      <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
        {t("monitorManage", $language)}
      </p>
    </div>

    <!-- Navigation Cards -->
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <!-- Map View Card -->
      <a
        href="/map"
        class="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-border"
      >
        <div class="bg-primary p-8 text-primary-foreground">
          <Trees
            class="w-16 h-16 mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-3xl font-bold mb-2">{t("gardenMap", $language)}</h2>
          <p class="opacity-90">
            {t("interactiveLayout", $language)}
          </p>
        </div>
        <div class="p-6">
          <ul class="space-y-2 text-muted-foreground">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
              {t("viewPlantLocations", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
              {t("monitorPlantHealth", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-3"></span>
              {t("filterByCategory", $language)}
            </li>
          </ul>
        </div>
      </a>

      <!-- Species List Card -->
      <a
        href="/plants"
        class="group bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-border"
      >
        <div class="bg-secondary p-8 text-secondary-foreground">
          <ListTree
            class="w-16 h-16 mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-3xl font-bold mb-2">{t("plantsList", $language)}</h2>
          <p class="opacity-90">{t("detailedInfo", $language)}</p>
        </div>
        <div class="p-6">
          <ul class="space-y-2 text-muted-foreground">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-3"></span>
              {t("browseSpecies", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-3"></span>
              {t("viewDetailedData", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-3"></span>
              {t("trackHarvest", $language)}
            </li>
          </ul>
        </div>
      </a>
    </div>

    <!-- Quick Stats -->
    <div class="mt-16 max-w-4xl mx-auto">
      <div class="bg-card rounded-2xl shadow-lg p-8 border border-border">
        <h3 class="text-2xl font-bold text-foreground mb-6 text-center">
          {t("gardenOverview", $language)}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Trees class="w-8 h-8" style="color: var(--category-tree)" />
            </div>
            <div class="text-3xl font-bold text-foreground">3</div>
            <div class="text-sm text-muted-foreground">
              {t("trees", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Sprout class="w-8 h-8" style="color: var(--category-shrub)" />
            </div>
            <div class="text-3xl font-bold text-foreground">3</div>
            <div class="text-sm text-muted-foreground">
              {t("shrubs", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <Leaf class="w-8 h-8" style="color: var(--category-herb)" />
            </div>
            <div class="text-3xl font-bold text-foreground">3</div>
            <div class="text-sm text-muted-foreground">
              {t("herbs", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2">
              <svg
                class="w-8 h-8"
                style="color: var(--category-vegetable)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="text-3xl font-bold text-foreground">3</div>
            <div class="text-sm text-muted-foreground">
              {t("vegetables", $language)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
