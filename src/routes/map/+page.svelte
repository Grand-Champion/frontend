<script>
    import FoodForestMap from "$lib/components/food-forest-map.svelte";
    import { language, t } from "$lib/stores/language";

    $: pageTitle = `${t("mapView", $language)} - Food Forest`;
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<FoodForestMap />
