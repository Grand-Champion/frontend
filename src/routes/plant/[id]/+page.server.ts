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
        forestData: null,
        error: `Failed to fetch plant data: ${plantResponse.status}` 
      };
    }
    
    const plantData = await plantResponse.json();

    
    const forestResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/forests/${plantData.data.foodForestId}`
    );
    
    if (!forestResponse.ok) {
      return { 
        forestData: null, 
        plantData,
        error: `Failed to fetch plant data: ${plantResponse.status}` 
      };
    }
    
    const forestData = await forestResponse.json();

    return {
      plantData,
      forestData
    };
  } catch (error) {
    console.error('Error loading plant data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
