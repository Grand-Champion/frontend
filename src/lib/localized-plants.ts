import { derived } from 'svelte/store';
import { language } from './stores/language';
import { plants } from './plant-data';
import { plantsNL } from './plant-data-nl';
import type { Plant } from './plant-data';

// Create a derived store that returns the correct plant data based on language
export const localizedPlants = derived<typeof language, Plant[]>(
    language,
    ($language) => {
        return $language === 'nl' ? plantsNL : plants;
    }
);

// Helper function to get a single plant by ID in the current language
export function getLocalizedPlant(id: number, lang: 'en' | 'nl'): Plant | undefined {
    const plantData = lang === 'nl' ? plantsNL : plants;
    return plantData.find(p => p.id === id);
}
