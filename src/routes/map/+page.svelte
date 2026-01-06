<script>
    import FoodForestMap from "$lib/components/food-forest-map.svelte";
    import { language, t } from "$lib/stores/language";
    import { PUBLIC_API_URL } from '$env/static/public';
    import { onMount } from 'svelte';

    export let data;
    let forestData = data?.forestData ?? null;

    $: pageTitle = `${t("mapView", $language)} - Food Forest`;

    async function fetchLatest() {
        try {
            const [forestRes, speciesRes] = await Promise.all([
                fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/1`),
                fetch(`${PUBLIC_API_URL}/forests/api/v1/species`)
            ]);
            if (!forestRes.ok || !speciesRes.ok) return;
            
            const forestJson = await forestRes.json();
            const speciesJson = await speciesRes.json();
            
            const speciesMap = {};
            speciesJson.data?.forEach(species => {
                speciesMap[species.id] = species;
            });
            
            if (forestJson.data?.plants) {
                // Maak nieuwe object referenties voor elke plant zodat Svelte reactivity werkt
                forestJson.data.plants = forestJson.data.plants.map(plant => ({
                    ...plant,
                    conditions: plant.conditions ? [...plant.conditions] : [],
                    species: speciesMap[plant.speciesId] || null
                }));
            }
            
            forestData = {...forestJson};
        } catch (err) {
            console.error('Error fetching latest forest data', err);
        }
    }

    onMount(() => {
           const interval = setInterval(fetchLatest, 5000);
        return () => clearInterval(interval);
    });
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

<FoodForestMap forestData={forestData} />
