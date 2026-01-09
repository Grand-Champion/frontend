import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  try {
    const messagesResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/messages`
    );
    
    if (!messagesResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch forest data: ${messagesResponse.status}` 
      };
    }
    
    const messagesData = await messagesResponse.json();

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
      messagesData
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}