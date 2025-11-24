export type PlantCategory = "tree" | "shrub" | "herb" | "vegetable"
export type MaintenanceLevel = "high" | "medium" | "low"
export type PlantStage = "seedling" | "growing" | "flowering" | "fruiting" | "dormant"
export type StatusLevel = "good" | "attention" | "critical"

export interface OptimalConditions {
  temperature: { min: number; max: number }
  humidity: { min: number; max: number }
  soilPH: { min: number; max: number }
  soilMoisture: { min: number; max: number }
  sunlightHours: { min: number; max: number }
}

export interface CurrentConditions {
  stage: PlantStage
  harvestDays: number
  temperature: number
  humidity: number
  soilPH: number
  soilMoisture: number
  sunlightHours: number
  status: StatusLevel
}

export interface Plant {
  id: number
  name: string
  category: PlantCategory
  scientificName: string
  description: string
  position: { x: number; y: number }
  harvestSeason: string
  sunRequirement: string
  waterNeeds: string
  height: string
  image: string
  maintenance: MaintenanceLevel
  optimalConditions: OptimalConditions
  currentConditions: CurrentConditions
}

export const plants: Plant[] = [
  {
    id: 1,
    name: "Apple Tree",
    category: "tree",
    scientificName: "Malus domestica",
    description:
      "A deciduous tree producing sweet, crisp apples. Excellent for fresh eating and cooking. Provides shade and habitat for beneficial insects.",
    position: { x: 25, y: 30 },
    harvestSeason: "Late Summer - Fall",
    sunRequirement: "Full Sun",
    waterNeeds: "Moderate",
    height: "15-25 feet",
    image: "/apple-tree-with-red-apples.jpg",
    maintenance: "medium",
    optimalConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 6.0, max: 7.0 },
      soilMoisture: { min: 40, max: 60 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "fruiting",
      harvestDays: 45,
      temperature: 22,
      humidity: 58,
      soilPH: 6.5,
      soilMoisture: 52,
      sunlightHours: 7,
      status: "good",
    },
  },
  {
    id: 2,
    name: "Blueberry Bush",
    category: "shrub",
    scientificName: "Vaccinium corymbosum",
    description:
      "A productive shrub bearing sweet, antioxidant-rich berries. Prefers acidic soil and provides beautiful fall foliage.",
    position: { x: 45, y: 55 },
    harvestSeason: "Summer",
    sunRequirement: "Full Sun to Part Shade",
    waterNeeds: "High",
    height: "4-6 feet",
    image: "/blueberry-bush-with-ripe-blue-berries.jpg",
    maintenance: "medium",
    optimalConditions: {
      temperature: { min: 18, max: 26 },
      humidity: { min: 60, max: 80 },
      soilPH: { min: 4.5, max: 5.5 },
      soilMoisture: { min: 60, max: 80 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "fruiting",
      harvestDays: 21,
      temperature: 24,
      humidity: 72,
      soilPH: 5.8,
      soilMoisture: 45,
      sunlightHours: 7,
      status: "good",
    },
  },
  {
    id: 3,
    name: "Rosemary",
    category: "herb",
    scientificName: "Rosmarinus officinalis",
    description:
      "An aromatic evergreen herb with needle-like leaves. Used in cooking and has medicinal properties. Attracts pollinators.",
    position: { x: 70, y: 40 },
    harvestSeason: "Year-round",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    height: "2-4 feet",
    image: "/rosemary-herb-plant-with-purple-flowers.jpg",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 15, max: 28 },
      humidity: { min: 40, max: 60 },
      soilPH: { min: 6.0, max: 7.5 },
      soilMoisture: { min: 20, max: 40 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "growing",
      harvestDays: 0,
      temperature: 26,
      humidity: 48,
      soilPH: 6.8,
      soilMoisture: 32,
      sunlightHours: 8,
      status: "good",
    },
  },
  {
    id: 4,
    name: "Tomato",
    category: "vegetable",
    scientificName: "Solanum lycopersicum",
    description:
      "A warm-season vegetable producing juicy, flavorful fruits. Requires support and regular watering for best production.",
    position: { x: 60, y: 70 },
    harvestSeason: "Summer",
    sunRequirement: "Full Sun",
    waterNeeds: "High",
    height: "3-6 feet",
    image: "/tomato-plant-with-ripe-red-tomatoes.jpg",
    maintenance: "high",
    optimalConditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 60, max: 80 },
      soilPH: { min: 6.0, max: 6.8 },
      soilMoisture: { min: 60, max: 80 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "flowering",
      harvestDays: 60,
      temperature: 12,
      humidity: 35,
      soilPH: 5.2,
      soilMoisture: 25,
      sunlightHours: 4,
      status: "critical",
    },
  },
  {
    id: 5,
    name: "Pear Tree",
    category: "tree",
    scientificName: "Pyrus communis",
    description:
      "A beautiful flowering tree that produces sweet, juicy pears. Provides spring blossoms and fall harvest.",
    position: { x: 35, y: 65 },
    harvestSeason: "Fall",
    sunRequirement: "Full Sun",
    waterNeeds: "Moderate",
    height: "15-20 feet",
    image: "/pear-tree-with-yellow-pears.jpg",
    maintenance: "medium",
    optimalConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 6.0, max: 7.0 },
      soilMoisture: { min: 40, max: 60 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "fruiting",
      harvestDays: 90,
      temperature: 23,
      humidity: 62,
      soilPH: 6.4,
      soilMoisture: 55,
      sunlightHours: 7,
      status: "good",
    },
  },
  {
    id: 6,
    name: "Lavender",
    category: "herb",
    scientificName: "Lavandula angustifolia",
    description:
      "A fragrant perennial herb with purple flowers. Excellent for attracting pollinators and has calming properties.",
    position: { x: 80, y: 25 },
    harvestSeason: "Summer",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    height: "1-3 feet",
    image: "/purple-lavender.png",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 18, max: 30 },
      humidity: { min: 30, max: 50 },
      soilPH: { min: 6.5, max: 8.0 },
      soilMoisture: { min: 20, max: 40 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "flowering",
      harvestDays: 14,
      temperature: 28,
      humidity: 42,
      soilPH: 7.2,
      soilMoisture: 28,
      sunlightHours: 8,
      status: "good",
    },
  },
  {
    id: 7,
    name: "Raspberry Bush",
    category: "shrub",
    scientificName: "Rubus idaeus",
    description:
      "A thorny cane producing sweet red berries. Spreads through runners and provides abundant summer harvest.",
    position: { x: 50, y: 45 },
    harvestSeason: "Summer",
    sunRequirement: "Full Sun",
    waterNeeds: "Moderate",
    height: "4-6 feet",
    image: "/raspberry-bush-with-red-raspberries.jpg",
    maintenance: "medium",
    optimalConditions: {
      temperature: { min: 16, max: 24 },
      humidity: { min: 60, max: 80 },
      soilPH: { min: 5.5, max: 6.5 },
      soilMoisture: { min: 50, max: 70 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "fruiting",
      harvestDays: 28,
      temperature: 20,
      humidity: 68,
      soilPH: 6.0,
      soilMoisture: 58,
      sunlightHours: 7,
      status: "good",
    },
  },
  {
    id: 8,
    name: "Kale",
    category: "vegetable",
    scientificName: "Brassica oleracea",
    description: "A nutrient-dense leafy green that thrives in cool weather. Frost actually improves its flavor.",
    position: { x: 65, y: 60 },
    harvestSeason: "Fall - Spring",
    sunRequirement: "Full Sun to Part Shade",
    waterNeeds: "Moderate",
    height: "1-2 feet",
    image: "/kale-plant-with-dark-green-curly-leaves.jpg",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 10, max: 20 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 6.0, max: 7.5 },
      soilMoisture: { min: 50, max: 70 },
      sunlightHours: { min: 4, max: 6 },
    },
    currentConditions: {
      stage: "growing",
      harvestDays: 35,
      temperature: 16,
      humidity: 58,
      soilPH: 6.8,
      soilMoisture: 62,
      sunlightHours: 5,
      status: "good",
    },
  },
  {
    id: 9,
    name: "Hazelnut",
    category: "tree",
    scientificName: "Corylus avellana",
    description:
      "A small tree or large shrub producing nutritious nuts. Provides early spring catkins and fall harvest.",
    position: { x: 20, y: 50 },
    harvestSeason: "Fall",
    sunRequirement: "Full Sun to Part Shade",
    waterNeeds: "Moderate",
    height: "10-15 feet",
    image: "/hazelnut-tree-with-nuts.jpg",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 12, max: 22 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 6.0, max: 7.5 },
      soilMoisture: { min: 40, max: 60 },
      sunlightHours: { min: 5, max: 7 },
    },
    currentConditions: {
      stage: "growing",
      harvestDays: 120,
      temperature: 19,
      humidity: 64,
      soilPH: 6.6,
      soilMoisture: 48,
      sunlightHours: 6,
      status: "good",
    },
  },
  {
    id: 10,
    name: "Thyme",
    category: "herb",
    scientificName: "Thymus vulgaris",
    description:
      "A low-growing aromatic herb perfect for ground cover. Used in cooking and attracts beneficial insects.",
    position: { x: 75, y: 35 },
    harvestSeason: "Year-round",
    sunRequirement: "Full Sun",
    waterNeeds: "Low",
    height: "6-12 inches",
    image: "/thyme-herb-plant-with-small-leaves.jpg",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 15, max: 28 },
      humidity: { min: 40, max: 60 },
      soilPH: { min: 6.0, max: 8.0 },
      soilMoisture: { min: 20, max: 40 },
      sunlightHours: { min: 6, max: 8 },
    },
    currentConditions: {
      stage: "growing",
      harvestDays: 0,
      temperature: 24,
      humidity: 52,
      soilPH: 7.0,
      soilMoisture: 30,
      sunlightHours: 7,
      status: "good",
    },
  },
  {
    id: 11,
    name: "Elderberry",
    category: "shrub",
    scientificName: "Sambucus nigra",
    description: "A fast-growing shrub with clusters of dark berries. Used for immune support and attracts wildlife.",
    position: { x: 40, y: 35 },
    harvestSeason: "Late Summer",
    sunRequirement: "Full Sun to Part Shade",
    waterNeeds: "Moderate",
    height: "8-12 feet",
    image: "/elderberry-bush-with-dark-purple-berries.jpg",
    maintenance: "low",
    optimalConditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 5.5, max: 6.5 },
      soilMoisture: { min: 50, max: 70 },
      sunlightHours: { min: 5, max: 7 },
    },
    currentConditions: {
      stage: "fruiting",
      harvestDays: 42,
      temperature: 22,
      humidity: 66,
      soilPH: 6.2,
      soilMoisture: 64,
      sunlightHours: 6,
      status: "good",
    },
  },
  {
    id: 12,
    name: "Lettuce",
    category: "vegetable",
    scientificName: "Lactuca sativa",
    description: "A cool-season leafy green perfect for salads. Quick-growing and can be succession planted.",
    position: { x: 55, y: 75 },
    harvestSeason: "Spring - Fall",
    sunRequirement: "Part Shade",
    waterNeeds: "Moderate",
    height: "6-12 inches",
    image: "/green-lettuce-plant.png",
    maintenance: "medium",
    optimalConditions: {
      temperature: { min: 10, max: 20 },
      humidity: { min: 50, max: 70 },
      soilPH: { min: 6.0, max: 7.0 },
      soilMoisture: { min: 60, max: 80 },
      sunlightHours: { min: 4, max: 6 },
    },
    currentConditions: {
      stage: "growing",
      harvestDays: 25,
      temperature: 24,
      humidity: 45,
      soilPH: 6.5,
      soilMoisture: 50,
      sunlightHours: 7,
      status: "good",
    },
  },
]
