import { PUBLIC_API_URL } from '$env/static/public';

export async function load({ fetch }) {
  try {
    const speciesResponse = await fetch(
      `${PUBLIC_API_URL}/forests/api/v1/species`
    );

    if (!speciesResponse.ok) {
      return {
        speciesData: null,
        error: `Failed to fetch species data: ${speciesResponse.status}`
      };
    }

    const speciesData = await speciesResponse.json();

    return {
      speciesData
    };
  } catch (error) {
    return {
      speciesData: null,
      error: `Error fetching species data: ${error.message}`
    };
  }
}
