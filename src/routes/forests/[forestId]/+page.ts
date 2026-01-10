import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  try {
    const forestResponse = await fetch(`${PUBLIC_API_URL}/forests/api/v1/forests/${params.forestId}`);

    if (!forestResponse.ok) {
      return { 
        forestData: null,
        error: `Failed to fetch forest data: ${forestResponse.status}` 
      };
    }
    
    const forestData = await forestResponse.json();

    return {
      forestData
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
