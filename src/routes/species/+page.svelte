<script>
  import SpeciesList from "$lib/components/species-list.svelte";
  import { language, t } from "$lib/stores/language";

  $: pageTitle = `${t("speciesList", $language)} - Food Forest`;

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>
  
  export let data;
</script>

<SpeciesList forestData={data.forestData} />
