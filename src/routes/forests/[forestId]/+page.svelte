<script>
  import { Trees, ListTree, Sprout, Leaf } from "lucide-svelte";
  import { language, t } from "$lib/stores/language";
  import { jwt } from "$lib/stores/jwt";
  import { getPayload } from "$lib/Auth";
    import { goto } from "$app/navigation";
  export let data;
  $: forestId = data.forestId;
  $: forestData = data.forestData?.data;

  $: pageTitle = `${t("home", $language)} - ${forestData?.name}`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="min-h-screen bg-background overflow-y-auto">
  <div class="container mx-auto px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16">
    <!-- Header -->
    <div class="text-center mb-10 sm:mb-14 md:mb-16">
      <div class="flex justify-center mb-4 sm:mb-6">
        <div class="relative">
          <Trees class="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
          <Sprout
            class="w-8 h-8 sm:w-10 sm:h-10 text-secondary absolute -bottom-2 -right-2"
          />
        </div>
      </div>
      <h1
        class="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4"
      >
        {forestData?.name || "Loading..."}
      </h1>
      <p
        class="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2"
      >
        {t("monitorManage", $language)}
      </p>
    </div>

    <!-- Navigation Cards -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto mb-10 sm:mb-14 md:mb-16"
    >
      <!-- Map View Card -->
      <a
        href="/forests/{forestId}/map"
        class="group bg-card rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-border"
      >
        <div class="bg-primary p-5 sm:p-6 md:p-8 text-primary-foreground">
          <Trees
            class="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">
            {t("gardenMap", $language)}
          </h2>
          <p class="opacity-90 text-sm sm:text-base">
            {t("interactiveLayout", $language)}
          </p>
        </div>
        <div class="p-4 sm:p-5 md:p-6">
          <ul
            class="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base"
          >
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-2 sm:mr-3"></span>
              {t("viewPlantLocations", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-2 sm:mr-3"></span>
              {t("monitorPlantHealth", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-primary rounded-full mr-2 sm:mr-3"></span>
              {t("filterByCategory", $language)}
            </li>
          </ul>
        </div>
      </a>

      <!-- Species List Card -->
      <a
        href="/forests/{forestId}/plants"
        class="group bg-card rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-border"
      >
        <div class="bg-secondary p-5 sm:p-6 md:p-8 text-secondary-foreground">
          <ListTree
            class="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
          />
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">
            {t("plantsList", $language)}
          </h2>
          <p class="opacity-90 text-sm sm:text-base">
            {t("detailedInfo", $language)}
          </p>
        </div>
        <div class="p-4 sm:p-5 md:p-6">
          <ul
            class="space-y-1 sm:space-y-2 text-muted-foreground text-sm sm:text-base"
          >
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-2 sm:mr-3"
              ></span>
              {t("browseSpecies", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-2 sm:mr-3"
              ></span>
              {t("viewDetailedData", $language)}
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-secondary rounded-full mr-2 sm:mr-3"
              ></span>
              {t("trackHarvest", $language)}
            </li>
          </ul>
        </div>
      </a>
    </div>

    <!-- Quick Stats -->
    <div class="max-w-4xl mx-auto">
      <div
        class="bg-card rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 border border-border"
      >
        <h3
          class="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center"
        >
          {t("gardenOverview", $language)}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div class="text-center">
            <div class="flex justify-center mb-2 sm:mb-3">
              <Trees
                class="w-6 h-6 sm:w-8 sm:h-8"
                style="color: var(--category-tree)"
              />
            </div>
            <div class="text-2xl sm:text-3xl font-bold text-foreground">3</div>
            <div class="text-xs sm:text-sm text-muted-foreground">
              {t("trees", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2 sm:mb-3">
              <Sprout
                class="w-6 h-6 sm:w-8 sm:h-8"
                style="color: var(--category-shrub)"
              />
            </div>
            <div class="text-2xl sm:text-3xl font-bold text-foreground">3</div>
            <div class="text-xs sm:text-sm text-muted-foreground">
              {t("shrubs", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2 sm:mb-3">
              <Leaf
                class="w-6 h-6 sm:w-8 sm:h-8"
                style="color: var(--category-herb)"
              />
            </div>
            <div class="text-2xl sm:text-3xl font-bold text-foreground">3</div>
            <div class="text-xs sm:text-sm text-muted-foreground">
              {t("herbs", $language)}
            </div>
          </div>
          <div class="text-center">
            <div class="flex justify-center mb-2 sm:mb-3">
              <svg
                class="w-6 h-6 sm:w-8 sm:h-8"
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
            <div class="text-2xl sm:text-3xl font-bold text-foreground">3</div>
            <div class="text-xs sm:text-sm text-muted-foreground">
              {t("vegetables", $language)}
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Button -->
      {#if (getPayload($jwt).id === forestData.ownerId || getPayload($jwt).role === "admin" )}
        <div class="mt-8 flex justify-center">
          <button
            onclick={goto("/forests/"+ forestData.id+ "/edit")}
            class="bg-primary text-primary-foreground px-8 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer min-w-48"
          >
            {t("edit", $language)}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
