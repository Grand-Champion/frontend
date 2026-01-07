<script>
  import PlantList from "$lib/components/plant-list.svelte";
  import { language, t } from "$lib/stores/language";

  $: pageTitle = `${t("plantsList", $language)} - Food Forest`;

  export let data;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<PlantList forestData={data.forestData} />
