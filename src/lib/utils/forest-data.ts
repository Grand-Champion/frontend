import { PUBLIC_API_URL } from '$env/static/public';

/**
 * Fetch de forest data van species
 * Gebruikt forests/:id/species om alleen soorten in het bos te krijgen
 */
export async function fetchLatest(forestId: number = 1) {
  try {
    const [forestRes, speciesRes] = await Promise.all([
      fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/${forestId}`),
      fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/${forestId}/species`)
    ]);

    if (!forestRes.ok || !speciesRes.ok) {
      return null;
    }

    const forestJson = await forestRes.json();
    const speciesJson = await speciesRes.json();

    const speciesMap: Record<number, any> = {};
    speciesJson.data?.forEach((species: any) => {
      speciesMap[species.id] = species;
    });

    if (forestJson.data?.plants) {
      forestJson.data.plants = forestJson.data.plants.map((plant: any) => ({
        ...plant,
        conditions: plant.conditions ? [...plant.conditions] : [],
        species: speciesMap[plant.speciesId] || null
      }));
    }

    return { ...forestJson };
  } catch (err) {
    console.error('Error fetching latest forest data', err);
    return null;
  }
}
