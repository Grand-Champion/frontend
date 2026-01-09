<script>
  import { language, t } from "$lib/stores/language";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import ImageInput from "$lib/components/ImageInput.svelte";
  import { jwt } from "$lib/stores/jwt";

  $: pageTitle = `${t("editSpecies", $language)} - Food Forest`;

  export let data;
  export let form;

  $: species = data.species;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="edit-species">
  <h1>{t("editSpecies", $language)}</h1>

  {#if species}
    <form method="POST" action="?/update" use:enhance>
      <input type="hidden" value={$jwt} name="jwt" />
      <div class="form-group">
        <label for="name">{t("name", $language)}</label>
        <input type="text" id="name" name="name" value="{species.name || ''}" required />
      </div>

      <div class="form-group">
        <label for="scientificName">{t("scientificName", $language)}</label>
        <input type="text" id="scientificName" name="scientificName" value="{species.scientificName || ''}" />
      </div>

      <div class="form-group">
        <label for="description">{t("description", $language)}</label>
        <textarea id="description" name="description">{species.description || ''}</textarea>
      </div>

      <div class="form-group">
        <ImageInput image="{species.image}" name="image" />
      </div>

      <div class="form-group">
        <label for="type">{t("category", $language)}</label>
        <select id="type" name="type" value="{species.type || ''}">
          <option value="Tree">{t("trees", $language)}</option>
          <option value="Shrub">{t("shrubs", $language)}</option>
          <option value="Herb">{t("herbs", $language)}</option>
          <option value="Vegetable">{t("vegetables", $language)}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="harvestSeason">{t("harvestSeason", $language) || "Harvest Season"}</label>
        <select id="harvestSeason" name="harvestSeason" value="{species.harvestSeason || ''}">
          <option value="">{t('harvestSeason', $language) || "Select..."}</option>
          <option value="Spring">{t('spring', $language) || "Spring"}</option>
          <option value="Summer">{t('summer', $language) || "Summer"}</option>
          <option value="Autumn">{t('autumn', $language) || "Autumn"}</option>
          <option value="Winter">{t('winter', $language) || "Winter"}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="sunRequirement">{t("sunRequirement", $language) || "Sun Requirement"}</label>
        <select id="sunRequirement" name="sunRequirement" value="{species.sunRequirement || ''}">
          <option value="">{t('sunRequirement', $language) || "Select..."}</option>
          <option value="Full sun">{t('fullSun', $language) || "Full Sun"}</option>
          <option value="Full sun to partial shade">{t('fullSunToPartialShade', $language) || "Full Sun to Partial Shade"}</option>
          <option value="Full shade">{t('fullShade', $language) || "Full Shade"}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="waterNeeds">{t("waterNeeds", $language) || "Water Needs"}</label>
        <select id="waterNeeds" name="waterNeeds" value="{species.waterNeeds || ''}">
          <option value="">{t('waterNeeds', $language) || "Select..."}</option>
          <option value="High">{t('high', $language) || "High"}</option>
          <option value="Medium">{t('medium', $language) || "Medium"}</option>
          <option value="Low">{t('low', $language) || "Low"}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="maintenance">{t("maintenanceLevel", $language) || "Maintenance Level"}</label>
        <select id="maintenance" name="maintenance" value="{species.maintenance || ''}">
          <option value="">{t('maintenanceLevel', $language) || "Select..."}</option>
          <option value="High">{t('high', $language) || "High"}</option>
          <option value="Medium">{t('medium', $language) || "Medium"}</option>
          <option value="Low">{t('low', $language) || "Low"}</option>
        </select>
      </div>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <div class="actions">
        <button type="submit">{t("save", $language)}</button>
        <button type="button" on:click={() => goto('/species')}>{t("cancel", $language)}</button>
      </div>
    </form>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

<style>
  .edit-species {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input, textarea, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    color-scheme: light dark;
    background-color: var(--card);
    color: var(--card-foreground);
  }

  select option {
    background-color: var(--card);
    color: var(--card-foreground);
  }

  textarea {
    height: 100px;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"] {
    background-color: #4CAF50;
    color: white;
  }

  button[type="submit"]:hover {
    background-color: #45a049;
  }

  button[type="button"] {
    background-color: #f44336;
    color: white;
  }

  button[type="button"]:hover {
    background-color: #da190b;
  }

  .error {
    color: red;
    margin-bottom: 1rem;
  }
</style>