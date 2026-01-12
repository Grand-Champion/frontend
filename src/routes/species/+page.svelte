<script>
  import SpeciesList from "$lib/components/species-list.svelte";
  import { language, t } from "$lib/stores/language";
  import { onMount } from 'svelte';
  import { fetchLatest } from "$lib/utils/forest-data";

  export let data;
  let forestData = data?.forestData ?? null;

  $: pageTitle = `${t("species", $language)} - Food Forest`;

  onMount(() => {
    const interval = setInterval(async () => {
      const result = await fetchLatest(1);
      if (result) forestData = result;
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<SpeciesList speciesData={data.speciesData} />
