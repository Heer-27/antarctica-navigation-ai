import apiClient from './client';
import { MOCK_ROUTES, MOCK_TIMELINE } from './mockData';

export const routeApi = {
  /**
   * Optimize navigation route
   * POST /api/route/optimize
   */
  async optimize(params) {
    try {
      const data = await apiClient.post('/api/route/optimize', params);
      return { ...data, isFallback: false };
    } catch (err) {
      console.warn('Backend route optimization service unavailable, using decision-support engine simulator', err.message);
      
      // Simulate weighting effect on route selection
      const safetyWeight = params?.weights?.safety ?? 70;
      const fuelWeight = params?.weights?.fuel ?? 20;
      
      let recommended = MOCK_ROUTES.options.find(r => r.id === 'balanced');
      if (safetyWeight >= 75) {
        recommended = MOCK_ROUTES.options.find(r => r.id === 'safest');
      } else if (fuelWeight >= 55) {
        recommended = MOCK_ROUTES.options.find(r => r.id === 'fuel');
      }

      return {
        recommendedRoute: recommended,
        options: MOCK_ROUTES.options,
        decisionExplanation: MOCK_ROUTES.decisionExplanation,
        segments: MOCK_ROUTES.segments,
        proximityAlert: MOCK_ROUTES.proximityAlert,
        timeline: MOCK_TIMELINE,
        isFallback: true
      };
    }
  },

  /**
   * Compare multiple route alternatives
   * POST /api/route/compare
   */
  async compare(params) {
    try {
      const data = await apiClient.post('/api/route/compare', params);
      return { ...data, isFallback: false };
    } catch (err) {
      return {
        options: MOCK_ROUTES.options,
        isFallback: true
      };
    }
  },

  /**
   * Simulate "What If?" environmental scenario
   * POST /api/scenario/simulate
   */
  async simulateScenario(scenarioParams) {
    try {
      const data = await apiClient.post('/api/scenario/simulate', scenarioParams);
      return { ...data, isFallback: false };
    } catch (err) {
      const { windDelta = 0, iceDelta = 0, waveDelta = 0 } = scenarioParams;
      const baseRoute = MOCK_ROUTES.options.find(r => r.id === 'balanced');
      
      // Calculate realistic physics perturbations
      const fuelMultiplier = 1 + (windDelta * 0.008) + (iceDelta * 0.015) + (waveDelta * 0.02);
      const timeMultiplier = 1 + (iceDelta * 0.018) + (waveDelta * 0.015);
      const riskDelta = Math.round((iceDelta * 0.4) + (windDelta * 0.3) + (waveDelta * 0.3));

      const scenarioRoute = {
        ...baseRoute,
        name: 'SCENARIO SIMULATION ROUTE',
        distanceKm: Number((baseRoute.distanceKm * (iceDelta > 10 ? 1.06 : 1.02)).toFixed(1)),
        travelTimeHours: Number((baseRoute.travelTimeHours * timeMultiplier).toFixed(1)),
        estimatedFuelLiters: Math.round(baseRoute.estimatedFuelLiters * fuelMultiplier),
        riskScore: Math.min(100, Math.max(10, baseRoute.riskScore + riskDelta)),
        color: '#E09F3E'
      };

      return {
        baselineRoute: baseRoute,
        scenarioRoute,
        divergence: {
          distanceDiffKm: Number((scenarioRoute.distanceKm - baseRoute.distanceKm).toFixed(1)),
          fuelDiffLiters: scenarioRoute.estimatedFuelLiters - baseRoute.estimatedFuelLiters,
          timeDiffHours: Number((scenarioRoute.travelTimeHours - baseRoute.travelTimeHours).toFixed(1)),
          riskDiffScore: scenarioRoute.riskScore - baseRoute.riskScore
        },
        impactSummary: `Under simulated conditions (Wind ${windDelta >= 0 ? '+' : ''}${windDelta} kn, Ice ${iceDelta >= 0 ? '+' : ''}${iceDelta}%), the vessel must deviate to avoid heavy ridge formation, increasing fuel consumption by ${((fuelMultiplier - 1) * 100).toFixed(1)}%.`,
        isFallback: true
      };
    }
  }
};

export default routeApi;
