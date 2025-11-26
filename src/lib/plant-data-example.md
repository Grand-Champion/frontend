## Fillable

{
    id: ,
    name: "",
    category: "tree,shrub,herb,vegatable",
    scientificName: "",
    description: "",
    position: { x: , y:  },
    harvestSeason: "",
    sunRequirement: "",
    waterNeeds: "",
    height: "",
    image: "",
    maintenance: "high,medium,low",
    optimalConditions: {
      temperature: { min: , max:  },
      humidity: { min: , max:  },
      soilPH: { min: , max:  },
      soilMoisture: { min: , max:  },
      sunlightHours: { min: , max:  },
    },
    currentConditions: {
      stage: "seedling,growing,flowering,fruiting,dormant",
      harvestDays: ,
      temperature: ,
      humidity: ,
      soilPH: ,
      soilMoisture: ,
      sunlightHours: ,
      status: "good,attention,critical",
    },
  },


## Example

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