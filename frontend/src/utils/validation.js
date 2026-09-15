/**
 * Validation rules for navigation coordinates, vessels, and route constraints
 */

export function validateLatitude(lat) {
  if (lat === '' || lat === null || lat === undefined) {
    return 'Latitude is required.';
  }
  const val = Number(lat);
  if (isNaN(val)) return 'Latitude must be a valid number.';
  if (val < -90 || val > 90) return 'Latitude must be between -90° and +90°.';
  return null;
}

export function validateLongitude(lon) {
  if (lon === '' || lon === null || lon === undefined) {
    return 'Longitude is required.';
  }
  const val = Number(lon);
  if (isNaN(val)) return 'Longitude must be a valid number.';
  if (val < -180 || val > 180) return 'Longitude must be between -180° and +180°.';
  return null;
}

export function validateVesselForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Vessel name is required.';
  }

  const latErr = validateLatitude(data.latitude);
  if (latErr) errors.latitude = latErr;

  const lonErr = validateLongitude(data.longitude);
  if (lonErr) errors.longitude = lonErr;

  if (!data.maxSpeed || Number(data.maxSpeed) <= 0) {
    errors.maxSpeed = 'Maximum speed must be greater than 0 knots.';
  }

  if (!data.normalSpeed || Number(data.normalSpeed) <= 0) {
    errors.normalSpeed = 'Cruising speed must be greater than 0 knots.';
  } else if (Number(data.normalSpeed) > Number(data.maxSpeed)) {
    errors.normalSpeed = 'Cruising speed cannot exceed maximum speed.';
  }

  if (!data.fuelCapacity || Number(data.fuelCapacity) <= 0) {
    errors.fuelCapacity = 'Fuel capacity must be positive.';
  }

  if (!data.fuelConsumptionRate || Number(data.fuelConsumptionRate) <= 0) {
    errors.fuelConsumptionRate = 'Fuel consumption rate must be positive.';
  }

  if (!data.iceClass) {
    errors.iceClass = 'Polar Class rating is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Balance 3 weights (safety, fuel, time) so they always sum up to 100%
 */
export function balanceWeights(changedKey, newValue, currentWeights) {
  const keys = ['safety', 'fuel', 'time'];
  const otherKeys = keys.filter(k => k !== changedKey);
  
  const val = Math.max(0, Math.min(100, Math.round(Number(newValue))));
  const remaining = 100 - val;
  
  const currentOtherSum = currentWeights[otherKeys[0]] + currentWeights[otherKeys[1]];
  
  let newWeights = { ...currentWeights, [changedKey]: val };
  
  if (currentOtherSum === 0) {
    newWeights[otherKeys[0]] = Math.floor(remaining / 2);
    newWeights[otherKeys[1]] = remaining - newWeights[otherKeys[0]];
  } else {
    const ratio0 = currentWeights[otherKeys[0]] / currentOtherSum;
    newWeights[otherKeys[0]] = Math.round(remaining * ratio0);
    newWeights[otherKeys[1]] = remaining - newWeights[otherKeys[0]];
  }
  
  return newWeights;
}
