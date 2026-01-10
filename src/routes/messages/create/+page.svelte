<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { language, t } from "$lib/stores/language";
  import {
    ArrowLeft
  } from "lucide-svelte";
  import { PUBLIC_API_URL } from '$env/static/public';
  import MessageForm from "$lib/components/MessageForm.svelte";
  import { getPayload, headers } from "$lib/Auth";
  import { jwt } from "$lib/stores/jwt";

  export let data;

  //Pak plant uit de API data
  $: forest = data.forestData?.data;

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
    console.log(forest.id);
    const request = await fetch(PUBLIC_API_URL + `/forests/api/v1/forests/${forest.id}/messages`, {
      body: data,
      method: "POST",
      headers: headers($jwt)
    });
    if(!request.ok){
      alert(request.statusText);
    } else{
      goto("/messages");
    }
  }

  $: pageTitle = `${ t("createMessage", $language) } - Food Forest`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="scrollable-container">
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
          { t("createMessage", $language) }
        </h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-card border border-border rounded-xl p-6">
            <form action="javascript://" bind:this={formulier} onsubmit={stuurUpdate} >
              <MessageForm user={getPayload($jwt)} {forest} />
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .scrollable-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
  }
</style>