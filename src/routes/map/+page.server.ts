export async function load({ fetch }) {
  try {
    // Fetch forest data met plants
    const forestResponse = await fetch(
      "http://localhost:3011/forests/api/v1/forests/1"
    );
    if (!forestResponse.ok) {
      return { 
        forestData: null, 
        error: `Backend returned ${forestResponse.status}` 
      };
    }
    const forestData = await forestResponse.json();

    // Fetch species data 
    const speciesResponse = await fetch(
      "http://localhost:3011/forests/api/v1/species"
    );
    if (!speciesResponse.ok) {
      return { 
        forestData: null, 
        error: `Failed to fetch species data: ${speciesResponse.status}` 
      };
    }
    const speciesData = await speciesResponse.json();

    const speciesMap: Record<number, any> = {};
    speciesData.data.forEach((species: any) => {
      speciesMap[species.id] = species;
    });

    if (forestData.data && forestData.data.plants) {
      forestData.data.plants = forestData.data.plants.map((plant: any) => ({
        ...plant,
        species: speciesMap[plant.speciesId] || null
      }));
    }

    return {
      forestData,
    };
  } catch (error) {
    console.error('Error loading forest data:', error);
    return { 
      forestData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
