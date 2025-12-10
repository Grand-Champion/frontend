<script>
  import SpeciesList from "$lib/components/species-list.svelte";
  import { language, t } from "$lib/stores/language";

  $: pageTitle = `${t("speciesList", $language)} - Food Forest`;

  export let data;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<SpeciesList forestData={data.forestData} />
