import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Language = 'en' | 'nl';

const storedLanguage = browser ? (localStorage.getItem('language') as Language) || 'en' : 'en';

export const language = writable<Language>(storedLanguage);

language.subscribe((value) => {
    if (browser) {
        localStorage.setItem('language', value);
    }
});

// Translation dictionary
export const translations = {
    en: {
        // Navigation
        home: 'Home',
        mapView: 'Map View',
        speciesList: 'Species List',
        light: 'Light',
        dark: 'Dark',
        english: 'English',
        dutch: 'Dutch',

        // Home page
        foodGarden: 'Food Garden',
        monitorManage: 'Monitor and manage your sustainable food forest ecosystem',
        gardenMap: 'Garden Map',
        interactiveLayout: 'Interactive visual layout of your food forest',
        viewPlantLocations: 'View plant locations',
        monitorPlantHealth: 'Monitor plant health status',
        filterByCategory: 'Filter by category and condition',
        detailedInfo: 'Detailed information about all your plants',
        browseSpecies: 'Browse all species',
        viewDetailedData: 'View detailed plant data',
        trackHarvest: 'Track harvest schedules',
        gardenOverview: 'Garden Overview',
        trees: 'Trees',
        shrubs: 'Shrubs',
        herbs: 'Herbs',
        vegetables: 'Vegetables',

        // Species list / Filters
        filterBySpecies: 'Filter by Species',
        filterByStatus: 'Filter by Status',
        good: 'Good',
        needsAttention: 'Needs Attention',
        critical: 'Critical',
        noPlants: 'No plants match your filters',
        adjustFilters: 'Try adjusting your filter settings',

        // Plant detail page
        back: 'Back',
        about: 'About',
        growingInformation: 'Growing Information',
        harvestSeason: 'Harvest Season',
        sunRequirement: 'Sun Requirement',
        waterNeeds: 'Water Needs',
        matureHeight: 'Mature Height',
        maintenanceLevel: 'Maintenance Level',
        overallStatus: 'Overall Status',
        optimal: 'Optimal',
        currentStage: 'Current Stage',
        harvestIn: 'Harvest In',
        ready: 'Ready',
        days: 'days',
        currentConditions: 'Current Conditions',
        temperature: 'Temperature',
        humidity: 'Humidity',
        soilPH: 'Soil pH',
        soilMoisture: 'Soil Moisture',
        sunlight: 'Sunlight',
        careAdvice: 'Care Advice',
        comments: 'Comments',
        addComment: 'Add a comment...',
        send: 'Send',

        // Maintenance levels
        maintenanceHigh: 'High',
        maintenanceMedium: 'Medium',
        maintenanceLow: 'Low',

        // Plant stages
        stageSeedling: 'Seedling',
        stageGrowing: 'Growing',
        stageFlowering: 'Flowering',
        stageFruiting: 'Fruiting',
        stageDormant: 'Dormant',

        // Care advice messages
        adviceTempTooCold: 'Temperature too cold. Move plant to warmer location or provide protection.',
        adviceTempTooHot: 'Temperature too hot. Provide shade or increase air circulation.',
        adviceHumidityTooLow: 'Humidity too low. Mist plant regularly or increase water in surrounding soil.',
        adviceHumidityTooHigh: 'Humidity too high. Improve air circulation to prevent fungal disease.',
        adviceSoilTooAcidic: 'Soil too acidic. Add lime or alkaline materials to raise pH.',
        adviceSoilTooAlkaline: 'Soil too alkaline. Add sulfur or acidifying materials to lower pH.',
        adviceSoilTooDry: 'Soil too dry. Water more frequently and deeply.',
        adviceSoilTooWet: 'Soil too wet. Reduce watering and improve drainage.',
        adviceNotEnoughSun: 'Not enough sunlight. Move plant to a sunnier location if possible.',
        adviceTooMuchSun: 'Too much direct sun. Provide partial shade during intense afternoon heat.',
        adviceOptimal: 'All conditions are optimal. Continue current care routine.'
    },
    nl: {
        // Navigation
        home: 'Home',
        mapView: 'Kaart',
        speciesList: 'Soorten',
        light: 'Licht',
        dark: 'Donker',
        english: 'Engels',
        dutch: 'Nederlands',

        // Home page
        foodGarden: 'Voedseltuin',
        monitorManage: 'Monitor en beheer je duurzame voedselbos ecosysteem',
        gardenMap: 'Tuinkaart',
        interactiveLayout: 'Interactieve visuele weergave van je voedselbos',
        viewPlantLocations: 'Bekijk plantlocaties',
        monitorPlantHealth: 'Monitor plantgezondheid',
        filterByCategory: 'Filter op categorie en conditie',
        detailedInfo: 'Gedetailleerde informatie over al je planten',
        browseSpecies: 'Bekijk alle soorten',
        viewDetailedData: 'Bekijk gedetailleerde plantgegevens',
        trackHarvest: 'Volg oogstschema\'s',
        gardenOverview: 'Tuinoverzicht',
        trees: 'Bomen',
        shrubs: 'Struiken',
        herbs: 'Kruiden',
        vegetables: 'Groenten',

        // Species list / Filters
        filterBySpecies: 'Filter op Soorten',
        filterByStatus: 'Filter op Status',
        good: 'Goed',
        needsAttention: 'Aandacht Nodig',
        critical: 'Kritiek',
        noPlants: 'Geen planten komen overeen met je filters',
        adjustFilters: 'Probeer je filterinstellingen aan te passen',

        // Plant detail page
        back: 'Terug',
        about: 'Over',
        growingInformation: 'Groei-informatie',
        harvestSeason: 'Oogstseizoen',
        sunRequirement: 'Zonbehoefte',
        waterNeeds: 'Waterbehoefte',
        matureHeight: 'Volwassen Hoogte',
        maintenanceLevel: 'Onderhoudsniveau',
        overallStatus: 'Algemene Status',
        optimal: 'Optimaal',
        currentStage: 'Huidige Fase',
        harvestIn: 'Oogst Over',
        ready: 'Klaar',
        days: 'dagen',
        currentConditions: 'Huidige Omstandigheden',
        temperature: 'Temperatuur',
        humidity: 'Luchtvochtigheid',
        soilPH: 'Bodem pH',
        soilMoisture: 'Bodemvocht',
        sunlight: 'Zonlicht',
        careAdvice: 'Verzorgingsadvies',
        comments: 'Reacties',
        addComment: 'Voeg een reactie toe...',
        send: 'Verstuur',

        // Maintenance levels
        maintenanceHigh: 'Hoog',
        maintenanceMedium: 'Gemiddeld',
        maintenanceLow: 'Laag',

        // Plant stages
        stageSeedling: 'Zaailing',
        stageGrowing: 'Groeiend',
        stageFlowering: 'Bloeiend',
        stageFruiting: 'Vruchtdragend',
        stageDormant: 'Rustend',

        // Care advice messages
        adviceTempTooCold: 'Temperatuur te koud. Verplaats plant naar warmere locatie of bied bescherming.',
        adviceTempTooHot: 'Temperatuur te heet. Bied schaduw of verhoog luchtcirculatie.',
        adviceHumidityTooLow: 'Luchtvochtigheid te laag. Besproei plant regelmatig of verhoog water in omliggende grond.',
        adviceHumidityTooHigh: 'Luchtvochtigheid te hoog. Verbeter luchtcirculatie om schimmelziekten te voorkomen.',
        adviceSoilTooAcidic: 'Grond te zuur. Voeg kalk of alkalische materialen toe om pH te verhogen.',
        adviceSoilTooAlkaline: 'Grond te alkalisch. Voeg zwavel of verzurende materialen toe om pH te verlagen.',
        adviceSoilTooDry: 'Grond te droog. Water vaker en dieper.',
        adviceSoilTooWet: 'Grond te nat. Verminder water geven en verbeter drainage.',
        adviceNotEnoughSun: 'Onvoldoende zonlicht. Verplaats plant naar zonnigere locatie indien mogelijk.',
        adviceTooMuchSun: 'Te veel direct zonlicht. Bied gedeeltelijke schaduw tijdens intense middaghitte.',
        adviceOptimal: 'Alle omstandigheden zijn optimaal. Blijf de huidige verzorging voortzetten.'
    }
};

export function t(key: keyof typeof translations.en, lang: Language): string {
    return translations[lang][key];
}
