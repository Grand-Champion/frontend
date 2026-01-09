import { PUBLIC_API_URL } from '$env/static/public';
import { error, fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const response = await fetch(`${PUBLIC_API_URL}/forests/api/v1/species/${params.id}`);

    if (!response.ok) {
      throw error(404, 'Species not found');
    }

    const speciesData = await response.json();
    const species = speciesData.data || speciesData;
    
    console.log('Loaded species:', JSON.stringify(species, null, 2));

    return {
      species
    };
  } catch (err) {
    throw error(500, 'Failed to load species');
  }
}

export const actions = {
  update: async ({ request, params }) => {
    const data = await request.formData();
    
    // Convert FormData to object, filtering out empty values
    const body: any = {};
    
    for (const [key, value] of data.entries()) {
      // Skip empty strings and empty files
      if (value === '' || (value instanceof File && value.size === 0)) {
        continue;
      }
      body[key] = value;
    }

    console.log('Sending update with body:', body);

    try {
      const response = await fetch(`${PUBLIC_API_URL}/forests/api/v1/species/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error:', response.status, errorText);
        return fail(response.status, { error: `Failed to update species: ${response.status}` });
      }

      redirect(303, '/species');
    } catch (err) {
      // Only catch actual errors, not redirects
      if (err instanceof Error && !(err instanceof Response)) {
        console.error('Catch error:', err);
        return fail(500, { error: 'Internal server error' });
      }
      // Re-throw redirects and responses
      throw err;
    }
  },
};