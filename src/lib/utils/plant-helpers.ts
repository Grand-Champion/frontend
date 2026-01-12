/**
 * Plant helper utilities for calculating plant status and colors
 */

/**
 * Bereken condition status op basis van species min en max conditions
 * (Same logic as backend calculateConditionStatus)
 */
export function calculateConditionStatus(conditions, species) {
  if (!conditions || !species) {
    return 'unknown';
  }

  let outOfRange = 0;

  // Check temperature
  if (conditions.temperature < species.minTemperature || 
      conditions.temperature > species.maxTemperature) {
    outOfRange += 1;
  }

  // Check humidity
  if (conditions.humidity < species.minHumidity || 
      conditions.humidity > species.maxHumidity) {
    outOfRange += 1;
  }

  // Check soilMoisture
  if (conditions.soilMoisture < species.minSoilMoisture || 
      conditions.soilMoisture > species.maxSoilMoisture) {
    outOfRange += 1;
  }

  // Check sunlight
  if (conditions.sunlight < species.minSunlight || 
      conditions.sunlight > species.maxSunlight) {
    outOfRange += 1;
  }

  // Bepaal status op basis van hoeveel conditions buiten de range zijn
  if (outOfRange === 0) {
    return 'optimal';
  }
  if (outOfRange <= 2) {
    return 'attention';
  }
  return 'critical';
}

/**
 * Get plant status
 */
export function getStatus(plant) {
  if (!plant.conditions || !plant.conditions[0]) {
    return 'unknown';
  }
  
  // Pak nieuwste condition data vanaf backend.
  const status = plant.conditions[0].status || 'unknown';
  
  if (status === 'good') return 'optimal';
  if (status === 'Unknown') return 'unknown';
  
  return status.toLowerCase();
}

/**
 * Pak de kleur voor plantstatus
 */
export function getStatusColor(status) {
  switch (status) {
    case "optimal":
    case "good":
      return "var(--status-good)";
    case "attention":
      return "var(--status-attention)";
    case "critical":
    case "unknown":
      return "var(--status-critical)";
    default:
      return "var(--status-critical)";
  }
}
