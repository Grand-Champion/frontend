<script>
  import { language, t } from "$lib/stores/language";
  import ImageInput from "./ImageInput.svelte";
</script>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("generalInformation", $language)}
</h2>
<div class="space-y-3">
  <div class="flex justify-between py-2">
    <label for="name">{t("name", $language)}</label>
    <input type="text" id="name" name="name" required class="border rounded-l" />
  </div>

  <div class="flex justify-between py-2">
    <label for="scientificName">{t("scientificName", $language)}</label>
    <input type="text" id="scientificName" name="scientificName" class="border rounded-l" />
  </div>

  <div class="flex justify-between py-2">
    <label for="description">{t("description", $language)}</label>
    <textarea id="description" name="description" class="border rounded-l" rows="3"></textarea>
  </div>

  <div class="flex justify-between py-2">
    <label for="type">{t("category", $language)}</label>
    <select id="type" name="type" class="border rounded-l">
      <option value="tree" class="bg-card text-card-foreground">{t('trees', $language) || 'Tree'}</option>
      <option value="shrub" class="bg-card text-card-foreground">{t('shrubs', $language) || 'Shrub'}</option>
      <option value="herb" class="bg-card text-card-foreground">{t('herbs', $language) || 'Herb'}</option>
      <option value="vegetable" class="bg-card text-card-foreground">{t('vegetables', $language) || 'Vegetable'}</option>
    </select>
  </div>
</div>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("growingInformation", $language) || "Growing Information"}
</h2>
<div class="space-y-3">
  <div class="flex justify-between py-2">
    <label for="harvestSeason">{t("harvestSeason", $language) || "Harvest Season"}</label>
    <select id="harvestSeason" name="harvestSeason" class="border rounded-l">
      <option value="spring" class="bg-card text-card-foreground">{t('spring', $language) || "Spring"}</option>
      <option value="summer" class="bg-card text-card-foreground">{t('summer', $language) || "Summer"}</option>
      <option value="autumn" class="bg-card text-card-foreground">{t('autumn', $language) || "Autumn"}</option>
      <option value="winter" class="bg-card text-card-foreground">{t('winter', $language) || "Winter"}</option>
    </select>
  </div>

  <div class="flex justify-between py-2">
    <label for="sunRequirement">{t("sunRequirement", $language) || "Sun Requirement"}</label>
    <select id="sunRequirement" name="sunRequirement" class="border rounded-l">
      <option value="full_sun" class="bg-card text-card-foreground">{t('fullSun', $language) || "Full Sun"}</option>
      <option value="full_sun_to_partial_shade" class="bg-card text-card-foreground">{t('fullSunToPartialShade', $language) || "Full Sun to Partial Shade"}</option>
      <option value="full shade" class="bg-card text-card-foreground">{t('fullShade', $language) || "Full Shade"}</option>
    </select>
  </div>

  <div class="flex justify-between py-2">
    <label for="waterNeeds">{t("waterNeeds", $language) || "Water Needs"}</label>
    <select id="waterNeeds" name="waterNeeds" class="border rounded-l">
      <option value="high" class="bg-card text-card-foreground">{t('high', $language) || "High"}</option>
      <option value="medium" class="bg-card text-card-foreground">{t('medium', $language) || "Medium"}</option>
      <option value="low" class="bg-card text-card-foreground">{t('low', $language) || "Low"}</option>
    </select>
  </div>

  <div class="flex justify-between py-2">
    <label for="maintenance">{t("maintenanceLevel", $language) || "Maintenance Level"}</label>
    <select id="maintenance" name="maintenance" class="border rounded-l">
      <option value="high" class="bg-card text-card-foreground">{t('high', $language) || "High"}</option>
      <option value="medium" class="bg-card text-card-foreground">{t('medium', $language) || "Medium"}</option>
      <option value="low" class="bg-card text-card-foreground">{t('low', $language) || "Low"}</option>
    </select>
  </div>
</div>

<h2 class="text-xl font-semibold text-card-foreground mb-4">
  {t("image", $language)}
</h2>
<div class="space-y-3">
  <ImageInput name="image" />
</div>