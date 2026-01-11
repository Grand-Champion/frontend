<script>
  import PlantList from "$lib/components/plant-list.svelte";
  import { language, t } from "$lib/stores/language";
  import { onMount, onDestroy } from "svelte";
  import { fetchLatest } from "$lib/utils/forest-data";

  export let data;
  let forestData = data?.forestData ?? null;
  let forestId = data?.forestId;
  let intervalId;

  $: pageTitle = `${t("plantsList", $language)} - Food Forest`;

  async function loadForestData(id) {
    const result = await fetchLatest(id);
    if (result) forestData = result;
  }

  onMount(() => {
    if (forestId) {
      loadForestData(forestId);
      intervalId = setInterval(() => loadForestData(forestId), 5000);
    }
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<PlantList {forestData} />
