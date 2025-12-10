<script>
    import FoodForestMap from "$lib/components/food-forest-map.svelte";
    import { language, t } from "$lib/stores/language";

    $: pageTitle = `${t("mapView", $language)} - Food Forest`;

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>
    
    export let data;
    
    console.log('API data:', data);
</script>

<FoodForestMap forestData={data.forestData} />
