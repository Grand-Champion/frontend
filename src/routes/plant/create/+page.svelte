<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { language, t } from "$lib/stores/language";
  import {
    ArrowLeft
  } from "lucide-svelte";
  import { PUBLIC_API_URL } from '$env/static/public';
  import PlantForm from "$lib/components/PlantForm.svelte";

  export let data;

  //Pak plant uit de API data
  $: forest = data.forestData?.data;
  $: species = data.speciesData?.data;

  function goBack() {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/");
    }
  }
  let formulier;
  async function stuurUpdate(){
    const data = new URLSearchParams(new FormData(formulier));
    const request = await fetch(PUBLIC_API_URL + `/forests/api/v1/forests/${forest.id}/plants`, {
      body: data,
      method: "POST"
    });
    if(!request.ok){
      alert(request.statusText);
    } else{
      goto("/map");
    }
  }

  $: pageTitle = `${ t("createPlant", $language) } - Food Forest`;
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
          { t("createPlant", $language) }
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <form action="javascript://" bind:this={formulier} onsubmit={stuurUpdate} >
              <PlantForm {forest} {species} />
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
