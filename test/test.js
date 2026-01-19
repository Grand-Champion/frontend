import assert from "assert";
import dotenv from "dotenv";
import { calculateConditionStatus } from "../src/lib/utils/plant-helpers.ts";

dotenv.config();
const API_URL = process.env.PUBLIC_API_URL || "http://localhost:3011";

// Fetch alle forests met de plants
async function fetchAllForests() {
  try {
    const forestsResponse = await fetch(`${API_URL}/forests/api/v1/forests`);
    const forestsData = await forestsResponse.json();
    
    if (!forestsData?.data || forestsData.data.length === 0) {
      return [];
    }
    
    // Pak forest data van alle forests
    const forestPromises = forestsData.data.map(forest => 
      fetch(`${API_URL}/forests/api/v1/forests/${forest.id}`).then(res => res.json())
    );
    
    const allForests = await Promise.all(forestPromises);
    return allForests.map(f => f.data);
  } catch (error) {
    console.error("Error fetching forest data:", error);
    throw error;
  }
}

//voorbeeld test
describe("#voorbeeld test", function () {
  it("2 + 2 is gelijk aan 4", function () {
    assert.equal(2 + 2, 4);
  });
});

// Test of de plants array niet leeg is
describe("Planten data tests", function () {
  let allForests;

  // Doet fetch calls voordat tests beginnen
  before(async function () {
    this.timeout(10000);
    allForests = await fetchAllForests();
  });

  it("minimaal 1 forest bevat planten", function () {
    assert.ok(allForests.length > 0, "Er moet minimaal 1 forest zijn");
    
    const hasForestWithPlants = allForests.some(forest => {
      const hasPlants = forest.plants && forest.plants.length > 0;
      return hasPlants;
    });
    assert.ok(hasForestWithPlants, "Minimaal 1 forest moet plants hebben");
  });

  // Test of de planten een naam hebben 
  it("elke plant heeft een naam", function () {
    assert.ok(allForests.length > 0, "Er zijn geen forests");
    
    allForests.forEach((forest, forestIndex) => {
      if (forest.plants && forest.plants.length > 0) {
        forest.plants.forEach((plant) => {
          const plantName = plant.name || plant.species?.name;
          assert.ok(plantName, `Forest ${forestIndex}: Plant met ID ${plant.id} moet een naam hebben`);
        });
      }
    });
  });

  // Test of geen planten op dezelfde plek staan
  it("planten overlappen niet", function () {
    assert.ok(allForests.length > 0, "Er zijn geen forests");
    
    allForests.forEach((forest, forestIndex) => {
      if (forest.plants && forest.plants.length > 1) {
        const plants = forest.plants;
        
        plants.forEach((plant1, index) => {
          plants.slice(index + 1).forEach((plant2) => {
            const zelfdePositie = plant1.posX === plant2.posX && 
                                  plant1.posY === plant2.posY;
            assert.ok(!zelfdePositie, 
              `Forest ${forestIndex}: Plant ${plant1.id} en Plant ${plant2.id} staan op dezelfde plek`);
          });
        });
      }
    });
  });

  // Test of elke plant een species heeft in alle forests
  it("elke plant heeft species informatie in alle forests", function () {
    assert.ok(allForests.length > 0, "Er zijn geen forests");
    
    allForests.forEach((forest, forestIndex) => {
      if (forest.plants && forest.plants.length > 0) {
        forest.plants.forEach((plant) => {
          const plantName = plant.name || plant.species?.name || `Plant ${plant.id}`;
          assert.ok(plant.species, `Forest ${forestIndex}: Plant "${plantName}" moet species informatie hebben`);
          assert.ok(plant.species.name, `Forest ${forestIndex}: Plant "${plantName}" moet een species naam hebben`);
        });
      }
    });
  });
});

// Frontend utility tests
describe("Tests Frontend logica", function () {
  
  // checkt of de plant condition logica klopt
  it("calculateConditionStatus geeft 'optimal' als alles binnen range is", function () {
    const conditions = {
      temperature: 22,
      humidity: 60,
      soilMoisture: 50,
      sunlight: 8
    };
    
    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10
    };
    
    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, 'optimal', "Status moet 'optimal' zijn als alle conditions binnen range zijn");
  });
  
  // checkt critical status wanneer alle conditions fout zijn is
  it("calculateConditionStatus geeft 'critical' als alles buiten range is", function () {
    const conditions = {
      temperature: 50,    
      humidity: 10,       
      soilMoisture: 100,  
      sunlight: 0         
    };
    
    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10
    };
    
    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, 'critical', "Status moet 'critical' zijn als alle conditions buiten range zijn");
  });
});