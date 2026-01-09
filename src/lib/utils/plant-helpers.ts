/**
 * Plant helper utilities for calculating plant status and colors
 */

/**
 * Calculate plant status based on conditions vs species optimal ranges
 */
export function getStatus(plant) {
  if (!plant.conditions || !plant.conditions[0] || !plant.species) {
    return 'critical';
  }
  
  let issuesCount = 0;
  const conditions = plant.conditions[0];
  const species = plant.species;

  // Check temperature
  if (species.minTemperature !== null && species.maxTemperature !== null) {
    if (
      conditions.temperature < species.minTemperature ||
      conditions.temperature > species.maxTemperature
    ) {
      issuesCount++;
    }
  }

  // Check humidity
  if (species.minHumidity !== null && species.maxHumidity !== null) {
    if (
      conditions.humidity < species.minHumidity ||
      conditions.humidity > species.maxHumidity
    ) {
      issuesCount++;
    }
  }

  // Check soil moisture
  if (species.minSoilMoisture !== null && species.maxSoilMoisture !== null) {
    if (
      conditions.soilMoisture < species.minSoilMoisture ||
      conditions.soilMoisture > species.maxSoilMoisture
    ) {
      issuesCount++;
    }
  }

  // Check sunlight
  if (species.minSunlight !== null && species.maxSunlight !== null) {
    if (
      conditions.sunlight < species.minSunlight ||
      conditions.sunlight > species.maxSunlight
    ) {
      issuesCount++;
    }
  }

  if (issuesCount === 0) return "good";
  if (issuesCount <= 2) return "attention";
  return "critical";
}

/**
 * Pak de kleur voor plantstatus
 */
export function getStatusColor(status) {
  switch (status) {
    case "good":
      return "var(--status-good)";
    case "attention":
      return "var(--status-attention)";
    case "critical":
      return "var(--status-critical)";
  }
}
