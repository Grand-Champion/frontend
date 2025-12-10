export async function load({ fetch, params }) {
  try {
    const plantId = params.id;
    
    // Fetch plant data vanaf backend
    const plantResponse = await fetch(
      `http://localhost:3011/forests/api/v1/plants/${plantId}`
    );
    
    if (!plantResponse.ok) {
      return { 
        plantData: null, 
        error: `Failed to fetch plant data: ${plantResponse.status}` 
      };
    }
    
    const plantData = await plantResponse.json();

    return {
      plantData,
    };
  } catch (error) {
    console.error('Error loading plant data:', error);
    return { 
      plantData: null, 
      error: 'Backend is not reachable. Is it running on port 3011?' 
    };
  }
}
