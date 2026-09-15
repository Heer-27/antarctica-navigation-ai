/**
 * Risk assessment and classification utilities for polar maritime navigation
 */

export const RISK_LEVELS = {
  LOW: {
    label: 'LOW RISK',
    min: 0,
    max: 35,
    color: '#4EBA6F',
    bg: 'rgba(78, 186, 111, 0.14)',
    border: 'rgba(78, 186, 111, 0.4)',
    description: 'Permissible navigational corridor. Routine polar watch.'
  },
  MODERATE: {
    label: 'MODERATE RISK',
    min: 36,
    max: 65,
    color: '#E09F3E',
    bg: 'rgba(224, 159, 62, 0.14)',
    border: 'rgba(224, 159, 62, 0.4)',
    description: 'Elevated sea ice concentration or proximate iceberg drift. Reduced transit speed advised.'
  },
  HIGH: {
    label: 'HIGH RISK',
    min: 66,
    max: 85,
    color: '#D9534F',
    bg: 'rgba(217, 83, 79, 0.16)',
    border: 'rgba(217, 83, 79, 0.4)',
    description: 'Severe multi-hazard corridor (dense pack ice, tabular icebergs, gale winds). Master discretion required.'
  },
  CRITICAL: {
    label: 'CRITICAL RISK',
    min: 86,
    max: 100,
    color: '#C84B31',
    bg: 'rgba(200, 75, 49, 0.22)',
    border: 'rgba(200, 75, 49, 0.5)',
    description: 'Impassable pack ice or imminent collision trajectory. Alternate route mandatory.'
  }
};

/**
 * Categorize numerical risk score (0-100) into risk object
 */
export function getRiskAssessment(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s <= 35) return { category: 'LOW', ...RISK_LEVELS.LOW, score: Math.round(s) };
  if (s <= 65) return { category: 'MODERATE', ...RISK_LEVELS.MODERATE, score: Math.round(s) };
  if (s <= 85) return { category: 'HIGH', ...RISK_LEVELS.HIGH, score: Math.round(s) };
  return { category: 'CRITICAL', ...RISK_LEVELS.CRITICAL, score: Math.round(s) };
}

/**
 * Breakdown composite risk factors
 */
export function calculateRiskBreakdown(route) {
  if (route?.riskBreakdown) {
    return route.riskBreakdown;
  }
  // Default synthesized breakdown if not given as breakdown
  const score = route?.riskScore || 30;
  return {
    seaIce: Math.round(score * 0.45),
    icebergs: Math.round(score * 0.25),
    weather: Math.round(score * 0.18),
    ocean: Math.round(score * 0.12)
  };
}
