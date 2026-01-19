import assert from "assert";
import { 
  calculateConditionStatus, 
  getStatus, 
  getStatusColor 
} from "../src/lib/utils/plant-helpers.ts";

describe("calculateConditionStatus", function () {
  it("geeft 'optimal' als alle conditions binnen range zijn", function () {
    const conditions = {
      temperature: 22,
      humidity: 60,
      soilMoisture: 50,
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "optimal");
  });

  it("geeft 'attention' als 1 condition buiten range is", function () {
    const conditions = {
      temperature: 35, // Buiten range
      humidity: 60,
      soilMoisture: 50,
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "attention");
  });

  it("geeft 'attention' als 2 conditions buiten range zijn", function () {
    const conditions = {
      temperature: 10, // Buiten range
      humidity: 20,    // Buiten range
      soilMoisture: 50,
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "attention");
  });

  it("geeft 'critical' als 3 conditions buiten range zijn", function () {
    const conditions = {
      temperature: 50, // Buiten range
      humidity: 10,    // Buiten range
      soilMoisture: 100, // Buiten range
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "critical");
  });

  it("geeft 'critical' als alle conditions buiten range zijn", function () {
    const conditions = {
      temperature: 50,
      humidity: 10,
      soilMoisture: 100,
      sunlight: 0,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "critical");
  });

  it("geeft 'unknown' als conditions null of undefined is", function () {
    const species = {
      minTemperature: 15,
      maxTemperature: 30,
    };

    assert.equal(calculateConditionStatus(null, species), "unknown");
    assert.equal(calculateConditionStatus(undefined, species), "unknown");
  });

  it("geeft 'unknown' als species null of undefined is", function () {
    const conditions = {
      temperature: 22,
      humidity: 60,
    };

    assert.equal(calculateConditionStatus(conditions, null), "unknown");
    assert.equal(calculateConditionStatus(conditions, undefined), "unknown");
  });

  it("detecteert te lage temperatuur correct", function () {
    const conditions = {
      temperature: 10, // Buiten range
      humidity: 60,
      soilMoisture: 50,
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "attention");
  });

  it("detecteert te hoge temperatuur correct", function () {
    const conditions = {
      temperature: 35, // Buiten range
      humidity: 60,
      soilMoisture: 50,
      sunlight: 8,
    };

    const species = {
      minTemperature: 15,
      maxTemperature: 30,
      minHumidity: 40,
      maxHumidity: 80,
      minSoilMoisture: 30,
      maxSoilMoisture: 70,
      minSunlight: 5,
      maxSunlight: 10,
    };

    const result = calculateConditionStatus(conditions, species);
    assert.equal(result, "attention");
  });
});

// Checkt of de backend status naar de goede frontend status word geconvert
describe("getStatus", function () {
  it("geeft 'optimal' als backend status 'good' is", function () {
    const plant = {
      conditions: [{ status: "good" }],
    };

    const result = getStatus(plant);
    assert.equal(result, "optimal");
  });

  it("geeft 'unknown' als backend status 'Unknown' is", function () {
    const plant = {
      conditions: [{ status: "Unknown" }],
    };

    const result = getStatus(plant);
    assert.equal(result, "unknown");
  });

  it("geeft lowercase versie van andere statussen", function () {
    const plant1 = { conditions: [{ status: "CRITICAL" }] };
    const plant2 = { conditions: [{ status: "Attention" }] };

    assert.equal(getStatus(plant1), "critical");
    assert.equal(getStatus(plant2), "attention");
  });

  it("geeft 'unknown' als er geen conditions zijn", function () {
    const plant1 = { conditions: [] };
    const plant2 = { conditions: null };
    const plant3 = {};

    assert.equal(getStatus(plant1), "unknown");
    assert.equal(getStatus(plant2), "unknown");
    assert.equal(getStatus(plant3), "unknown");
  });

  it("geeft 'unknown' als status niet bekend is", function () {
    const plant = {
      conditions: [{}],
    };

    const result = getStatus(plant);
    assert.equal(result, "unknown");
  });
});

  // test of kleuren kloppen
describe("getStatusColor", function () {
  it("geeft groene kleur voor 'optimal' status", function () {
    const color = getStatusColor("optimal");
    assert.equal(color, "var(--status-good)");
  });

  it("geeft groene kleur voor 'good' status", function () {
    const color = getStatusColor("good");
    assert.equal(color, "var(--status-good)");
  });

  it("geeft oranje kleur voor 'attention' status", function () {
    const color = getStatusColor("attention");
    assert.equal(color, "var(--status-attention)");
  });

  it("geeft rode kleur voor 'critical' status", function () {
    const color = getStatusColor("critical");
    assert.equal(color, "var(--status-critical)");
  });

  it("geeft rode kleur voor 'unknown' status", function () {
    const color = getStatusColor("unknown");
    assert.equal(color, "var(--status-critical)");
  });

  it("geeft rode kleur voor onbekende status", function () {
    const color = getStatusColor("invalid-status");
    assert.equal(color, "var(--status-critical)");
  });
});
