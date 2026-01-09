import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  try {
    const forestsResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/forests`
    );
    
    if (!forestsResponse.ok) {
      return { 
        forestsData: null, 
        error: `Failed to fetch forests data: ${forestsResponse.status}` 
      };
    }
    
    const forestsData = await forestsResponse.json();

    return {
      forestsData,
      forestId: 1
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return { 
      forestsData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
