<script>
  import { language, t } from "$lib/stores/language";
  import PlantLocationSelector from "$lib/components/PlantLocationSelector.svelte";
  import SelectOption from "$lib/components/SelectOption.svelte";
    import ImageInput from "./ImageInput.svelte";
  const { plant, forest, species } = $props();
</script>


<h2 class="text-xl font-semibold text-card-foreground mb-4">
{t("generalInformation", $language)}
</h2>
<div class="space-y-3">
<div class="flex justify-between py-2">
    <label for="stage">{t("currentStage", $language)}</label>
    <select name="stage" id="stage" class="border rounded-l">
        <SelectOption value="Young" currentValue={plant?.stage} />
        <SelectOption value="Growing" currentValue={plant?.stage} />
        <SelectOption value="Blooming" currentValue={plant?.stage} />
        <SelectOption value="Mature" currentValue={plant?.stage} />
        <SelectOption value="Fruit-bearing" currentValue={plant?.stage} />
    </select>
</div>
<div class="flex justify-between py-2">
    <label for="plantHealth">{t("health", $language)}</label>
    <input type="text" name="plantHealth" id="plantHealth" value={plant?.plantHealth} class="border rounded-l" />
</div>
<div class="flex justify-between py-2">
    <label for="height">{t("height", $language)}</label>
    <input type="text" name="height" id="height" value={plant?.height} class="border rounded-l" />
</div>
<div class="flex justify-between py-2">
    <label for="harvestPrediction">{t("harvestPrediction", $language)}</label>
    <input type="text" name="harvestPrediction" id="harvestPrediction" value={plant?.harvestPrediction} class="border rounded-l" />
</div>
<div class="flex justify-between py-2">
    <label for="speciesId">{t("species", $language)}</label>
    <select name="speciesId" id="speciesId" class="border rounded-l">
    {#each species as s}
        <SelectOption value={s.id} name="{s.name} ({s.scientificName})" currentValue={plant?.speciesId} />
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
    <ImageInput image={plant?.image} />
</div>
<div class="space-y-3">
    <input type="submit" value="{t("save", $language)}" class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
</div>