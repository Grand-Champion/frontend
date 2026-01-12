import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  try {
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

    const forestResponse = await fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/${params.forestId}`);

    if (!forestResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch forest data: ${forestResponse.status}` 
      };
    }
    
    const forestData = await forestResponse.json();

    return {
      forestData,
      speciesData
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
