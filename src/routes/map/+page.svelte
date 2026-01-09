<script>
    import FoodForestMap from "$lib/components/food-forest-map.svelte";
    import { language, t } from "$lib/stores/language";
    import { onMount } from "svelte";
    import { fetchLatest } from "$lib/utils/forest-data";

    export let data;
    let forestData = data?.forestData ?? null;

    $: pageTitle = `${t("mapView", $language)} - Food Forest`;

    let errorCount = 0;
    const maxErrors = 3;

    onMount(() => {
        const interval = setInterval(async () => {
            if (errorCount >= maxErrors) return;
            try {
                const result = await fetchLatest(1);
                if (result) {
                    forestData = result;
                    errorCount = 0;
                } else {
                    errorCount++;
                }
            } catch (err) {
                errorCount++;
                if (errorCount >= maxErrors) {
                    console.warn("Stopped polling due to repeated errors");
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    });
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<FoodForestMap {forestData} />
