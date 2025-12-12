<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { language, t } from "$lib/stores/language";
  import {
    ArrowLeft
  } from "lucide-svelte";
  import SelectOption from "$lib/components/SelectOption.svelte";
  import PlantLocationSelector from "$lib/components/PlantLocationSelector.svelte";
  import { PUBLIC_API_URL } from '$env/static/public';

  export let data;

  //Pak plant uit de API data
  $: plant = data.plantData?.data;
  $: forest = data.forestData?.data;
  $: species = data.speciesData?.data;

  function goBack() {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/");
    }
  }

  $: pageTitle = `${t("edit", $language)} ${plant?.name || "plant"} - Food Forest`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

{#if plant}
  <div class="bg-background">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <!-- Back button -->
      <button
        onclick={goBack}
        class="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        {t("back", $language)}
      </button>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-foreground mb-2">
          {plant.species?.name || "Unknown Plant"}
        </h1>
        <p class="text-xl italic text-muted-foreground">
          {plant.species?.scientificName || ""}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <form action="javascript://"><!-- TODO: Submit logica -->
              <h2 class="text-xl font-semibold text-card-foreground mb-4">
                {t("generalInformation", $language)}
              </h2>
              <div class="space-y-3">
                <div class="flex justify-between py-2">
                  <label for="stage">{t("currentStage", $language)}</label>
                  <select name="stage" id="stage" class="border rounded-l">
                    <SelectOption value="Young" currentValue={plant.stage} />
                    <SelectOption value="Growing" currentValue={plant.stage} />
                    <SelectOption value="Blooming" currentValue={plant.stage} />
                    <SelectOption value="Mature" currentValue={plant.stage} />
                    <SelectOption value="Fruit-bearing" currentValue={plant.stage} />
                  </select>
                </div>
                <div class="flex justify-between py-2">
                  <label for="plantHealth">{t("health", $language)}</label>
                  <input type="text" name="plantHealth" id="plantHealth" value={plant.plantHealth} class="border rounded-l" />
                </div>
                <div class="flex justify-between py-2">
                  <label for="height">{t("height", $language)}</label>
                  <input type="text" name="height" id="height" value={plant.height} class="border rounded-l" />
                </div>
                <div class="flex justify-between py-2">
                  <label for="harvestPrediction">{t("harvestPrediction", $language)}</label>
                  <input type="text" name="harvestPrediction" id="harvestPrediction" value={plant.harvestPrediction} class="border rounded-l" />
                </div>
                <div class="flex justify-between py-2">
                  <label for="speciesId">{t("species", $language)}</label>
                  <select name="speciesId" id="speciesId" class="border rounded-l">
                    {#each species as s}
                      <SelectOption value={s.id} name="{s.name} ({s.scientificName})" currentValue={plant.speciesId} />
                    {/each}
                  </select>
                </div>
                
              </div>
              <h2 class="text-xl font-semibold text-card-foreground mb-4">
                {t("location", $language)}
              </h2>
              <div class="space-y-3">
                <PlantLocationSelector {forest} {plant} />
              </div>
              <div class="space-y-3">
                <input type="submit" value="{t("save", $language)}" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="bg-background py-20">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground mb-2">Plant Not Found</h1>
      <button
        onclick={() => goto("/")}
        class="text-primary hover:underline cursor-pointer"
      >
        Go back to map
      </button>
    </div>
  </div>
{/if}
