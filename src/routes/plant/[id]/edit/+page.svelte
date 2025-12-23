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
  import { jwt } from "$lib/stores/jwt.js";

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
  let formulier;
  async function stuurUpdate(){
    const headers = new Headers();
    headers.set("Authorization", $jwt);
    const data = new URLSearchParams(new FormData(formulier));
    const request = await fetch(PUBLIC_API_URL + "/forests/api/v1/plants/" + plant.id, {
      body: data,
      method: "PATCH",
      headers
    });
    if(!request.ok){
      alert(request.statusText);
    } else{
      goto("/plant/"+plant.id);
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
            <form action="javascript://" bind:this={formulier} onsubmit={stuurUpdate} >
              <PlantForm {plant} {forest} {species} />
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
