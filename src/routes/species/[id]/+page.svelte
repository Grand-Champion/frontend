<script>
  import { language, t } from "$lib/stores/language";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { PUBLIC_API_URL } from '$env/static/public';
  import { ArrowLeft } from "lucide-svelte";

  export let data;

  $: species = data.species;
  $: pageTitle = `${species?.name || 'Species'} - Food Forest`;

  function goBack() {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/species");
    }
  }

  function handleEdit() {
    goto(`/species/${species.id}/edit`);
  }

  async function handleDelete() {
    if (confirm(t("confirmDeleteSpecies", $language))) {
      try {
        const response = await fetch(`${PUBLIC_API_URL}/forests/api/v1/species/${species.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          goto('/species');
        } else {
          alert('Failed to delete species');
        }
      } catch (error) {
        alert('Error deleting species');
      }
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="bg-background">
  <div class="max-w-5xl mx-auto px-6 py-8">
    {#if species}
      <!-- Back button -->
      <button
        onclick={goBack}
        class="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        {t("back", $language)}
      </button>

      <!-- Action Buttons -->
      <div class="mb-8 flex justify-end gap-6">
        <button
          onclick={handleEdit}
          class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {t("edit", $language)}
        </button>
        <button
          onclick={handleDelete}
          class="bg-[red] text-primary-foreground px-4 py-2 rounded-lg hover:bg-[#f00a] transition-colors cursor-pointer"
        >
          {t("delete", $language)}
        </button>
      </div>

    <!-- Species Card - matching plant card styling -->
    <div class="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] text-left w-full max-w-2xl mx-auto">
      <!-- Image Section -->
      <div class="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-muted to-muted/50">
        {#if species.image}
          <img
            src="{species.image}"
            alt="{species.name}"
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="w-full h-full flex items-center justify-center bg-muted">
            <span class="text-muted-foreground">No Image</span>
          </div>
        {/if}
      </div>

      <!-- Content Section -->
      <div class="p-6">
        <!-- Category Badge -->
        {#if species.type}
          <div class="mb-3 inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-primary">
            {species.type}
          </div>
        {/if}

        <!-- Title -->
        <h1 class="text-2xl font-bold text-card-foreground mb-2">
          {species.name}
        </h1>

        <!-- Scientific Name -->
        {#if species.scientificName}
          <p class="text-sm italic text-muted-foreground mb-4">
            {species.scientificName}
          </p>
        {/if}

        <!-- About Section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-card-foreground mb-2">{t("about", $language)}</h3>
          <div class="text-sm text-muted-foreground leading-relaxed">
            {#if species.description}
              <p>{species.description}</p>
            {:else}
              <p>{t("noDescription", $language)}</p>
            {/if}
          </div>
        </div>

        <!-- Growing Information Section -->
        <div>
          <h3 class="text-lg font-semibold text-card-foreground mb-3">{t("growingInformation", $language)}</h3>
          {#if species.optimalConditions || species.harvestSeason || species.sunRequirement || species.waterNeeds || species.height || species.maintenance}
            <div class="space-y-4">
              <!-- Optimal Conditions Grid -->
              {#if species.optimalConditions}
                <div>
                  <h4 class="text-md font-medium text-card-foreground mb-2">{t("optimalConditions", $language)}</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {#if species.optimalConditions.temperature}
                      <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span class="text-sm text-muted-foreground">{t("temperature", $language)}:</span>
                        <span class="text-sm font-medium text-card-foreground">
                          {species.optimalConditions.temperature.min}°C - {species.optimalConditions.temperature.max}°C
                        </span>
                      </div>
                    {/if}
                    {#if species.optimalConditions.humidity}
                      <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span class="text-sm text-muted-foreground">{t("humidity", $language)}:</span>
                        <span class="text-sm font-medium text-card-foreground">
                          {species.optimalConditions.humidity.min}% - {species.optimalConditions.humidity.max}%
                        </span>
                      </div>
                    {/if}
                    {#if species.optimalConditions.soilPH}
                      <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span class="text-sm text-muted-foreground">{t("soilPH", $language)}:</span>
                        <span class="text-sm font-medium text-card-foreground">
                          {species.optimalConditions.soilPH.min} - {species.optimalConditions.soilPH.max}
                        </span>
                      </div>
                    {/if}
                    {#if species.optimalConditions.soilMoisture}
                      <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span class="text-sm text-muted-foreground">{t("soilMoisture", $language)}:</span>
                        <span class="text-sm font-medium text-card-foreground">
                          {species.optimalConditions.soilMoisture.min}% - {species.optimalConditions.soilMoisture.max}%
                        </span>
                      </div>
                    {/if}
                    {#if species.optimalConditions.sunlightHours}
                      <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span class="text-sm text-muted-foreground">{t("sunlightHours", $language)}:</span>
                        <span class="text-sm font-medium text-card-foreground">
                          {species.optimalConditions.sunlightHours.min} - {species.optimalConditions.sunlightHours.max} hours
                        </span>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}

              <!-- Additional Growing Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#if species.harvestSeason}
                  <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span class="text-sm text-muted-foreground">{t("harvestSeason", $language)}:</span>
                    <span class="text-sm font-medium text-card-foreground">{species.harvestSeason}</span>
                  </div>
                {/if}
                {#if species.sunRequirement}
                  <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span class="text-sm text-muted-foreground">{t("sunRequirement", $language)}:</span>
                    <span class="text-sm font-medium text-card-foreground">{species.sunRequirement}</span>
                  </div>
                {/if}
                {#if species.waterNeeds}
                  <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span class="text-sm text-muted-foreground">{t("waterNeeds", $language)}:</span>
                    <span class="text-sm font-medium text-card-foreground">{species.waterNeeds}</span>
                  </div>
                {/if}
                {#if species.height}
                  <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span class="text-sm text-muted-foreground">{t("height", $language)}:</span>
                    <span class="text-sm font-medium text-card-foreground">{species.height}</span>
                  </div>
                {/if}
                {#if species.maintenance}
                  <div class="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span class="text-sm text-muted-foreground">{t("maintenanceLevel", $language)}:</span>
                    <span class="text-sm font-medium text-card-foreground">{species.maintenance}</span>
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <p class="text-sm text-muted-foreground">{t("noGrowingInfo", $language)}</p>
          {/if}
        </div>
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
</style>