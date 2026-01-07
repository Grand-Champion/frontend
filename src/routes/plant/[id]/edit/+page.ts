import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  try {
    const plantId = params.id;
    
    // Fetch plant data vanaf backend
    const plantResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/plants/${plantId}`
    );
    
    if (!plantResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch plant data: ${plantResponse.status}` 
      };
    }
    
    const speciesResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/species`
    );
    
    if (!speciesResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch forest data: ${speciesResponse.status}` 
      };
    }
    
    const speciesData = await speciesResponse.json();

    const plantData = await plantResponse.json();

    const forestResponse = await fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/${plantData.data.foodForestId}`);

    if (!forestResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch forest data: ${forestResponse.status}` 
      };
    }
    
    const forestData = await forestResponse.json();

    return {
      plantData,
      forestData,
      speciesData
    };

  } catch (error) {
    console.error('Error loading plant data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
