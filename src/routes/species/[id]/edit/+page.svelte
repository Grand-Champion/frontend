<script>
  import { language, t } from "$lib/stores/language";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import ImageInput from "$lib/components/ImageInput.svelte";

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
          <option value="tree">{t("trees", $language)}</option>
          <option value="shrub">{t("shrubs", $language)}</option>
          <option value="herb">{t("herbs", $language)}</option>
          <option value="vegetable">{t("vegetables", $language)}</option>
        </select>
      </div>

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}

      <div class="actions">
        <button type="submit">{t("update", $language)}</button>
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