import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

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

    // Get forest ID from params, or use stored preference if available
    let forestId = params.forestId;
    if (!forestId && browser) {
      forestId = localStorage.getItem('selectedForestId') || '1';
    }
    forestId = forestId || 1;

    return {
      forestsData,
      forestId
    };

  } catch (error) {
    console.error('Error loading data:', error);
    return {
      forestsData: null,
      error: 'Backend is not reachable. Is it running on port 3011?'
    };
  }
}

