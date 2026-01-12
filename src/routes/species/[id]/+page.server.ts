import { PUBLIC_API_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';

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