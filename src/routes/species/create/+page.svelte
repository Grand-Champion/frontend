<script>
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { language, t } from "$lib/stores/language";
  import {
    ArrowLeft
  } from "lucide-svelte";
  import { PUBLIC_API_URL } from '$env/static/public';
  import SpeciesForm from "$lib/components/SpeciesForm.svelte";
  import { headers } from "$lib/Auth";
  import { jwt } from "$lib/stores/jwt";

  $: pageTitle = `${t("createSpecies", $language)} - Food Forest`;

  let errorMessage = "";
  let successMessage = "";
  let isSubmitting = false;

  function goBack() {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/species");
    }
  }

  let formulier;
  async function stuurUpdate(){
    errorMessage = "";
    successMessage = "";
    isSubmitting = true;

    try {
      const data = new URLSearchParams(new FormData(formulier));
      const request = await fetch(PUBLIC_API_URL + `/forests/api/v1/species`, {
        body: data,
        method: "POST",
        headers: headers($jwt)
      });

      if(!request.ok){
        errorMessage = t("errorCreatingSpecies", $language) || "Error creating species";
      } else{
        successMessage = t("speciesCreatedSuccessfully", $language) || "Species created successfully!";
        // Auto-hide success message and redirect after 2 seconds
        setTimeout(() => {
          goto("/species");
        }, 2000);
      }
    } catch (error) {
      errorMessage = t("networkError", $language) || "Network error occurred";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

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
        { t("createSpecies", $language) }
      </h1>
    </div>

    <!-- Messages -->
    {#if errorMessage}
      <div
        class="mb-6 px-4 py-3 rounded-lg"
        style={`background-color: color-mix(in oklch, var(--status-critical) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-critical) 32%, transparent); color: var(--status-critical);`}
      >
        {errorMessage}
      </div>
    {/if}

    {#if successMessage}
      <div
        class="mb-6 px-4 py-3 rounded-lg"
        style={`background-color: color-mix(in oklch, var(--status-good) 12%, transparent); border: 1px solid color-mix(in oklch, var(--status-good) 32%, transparent); color: var(--status-good);`}
      >
        {successMessage}
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-card border border-border rounded-xl p-6">
          <form action="javascript://" bind:this={formulier} onsubmit={stuurUpdate}>
            <SpeciesForm />
          </form>
          <div class="mt-6">
            <button
              type="submit"
              onclick={stuurUpdate}
              disabled={isSubmitting}
              class="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                {t('creating', $language) || 'Creating...'}
              {:else}
                {t('create', $language)}
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>