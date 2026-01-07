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
    const name = data.get('name');
    const scientificName = data.get('scientificName');
    const description = data.get('description');
    const image = data.get('image');
    const category = data.get('category');

    try {
      const response = await fetch(`${PUBLIC_API_URL}/forests/api/v1/species/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          scientificName,
          description,
          image,
          category,
        }),
      });

      if (!response.ok) {
        return fail(400, { error: `Failed to update species: ${response.status}` });
      }

      throw redirect(303, '/species');
    } catch (err) {
      if (err instanceof Response) throw err;
      return fail(500, { error: 'Internal server error' });
    }
  },
};