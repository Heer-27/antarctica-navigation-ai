import { useState, useCallback } from 'react';
import routeApi from '../api/routeApi';
import { MOCK_ROUTES, MOCK_TIMELINE } from '../api/mockData';

export function useRoute() {
  const [routeResult, setRouteResult] = useState({
    recommendedRoute: MOCK_ROUTES.options.find(r => r.id === 'balanced'),
    options: MOCK_ROUTES.options,
    decisionExplanation: MOCK_ROUTES.decisionExplanation,
    segments: MOCK_ROUTES.segments,
    proximityAlert: MOCK_ROUTES.proximityAlert,
    timeline: MOCK_TIMELINE
  });

  const [activeOptionId, setActiveOptionId] = useState('balanced');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState('');
  const [error, setError] = useState(null);

  const optimizeRoute = useCallback(async (params) => {
    setOptimizing(true);
    setError(null);
    setOptimizationStep('ANALYZING ENVIRONMENTAL CONDITIONS');

    // Display realistic multi-step pipeline as requested in spec:
    // "✓ Sea-ice conditions -> ✓ Iceberg positions -> ✓ Weather -> ✓ Ocean currents -> → Calculating optimal route"
    const steps = [
      'Scanning sea-ice concentration raster...',
      'Projecting iceberg Lagrangian drift cones...',
      'Computing synoptic wind and wave vectors...',
      'Evaluating Pareto frontier (Safety / Fuel / Time)...'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setOptimizationStep(steps[i]);
        await new Promise(r => setTimeout(r, 380));
      }

      const result = await routeApi.optimize(params);
      setRouteResult(result);
      if (result.recommendedRoute?.id) {
        setActiveOptionId(result.recommendedRoute.id);
      }
      return result;
    } catch (err) {
      setError(err.message || 'Route optimization failed');
      throw err;
    } finally {
      setOptimizing(false);
      setOptimizationStep('');
    }
  }, []);

  const selectedRoute = routeResult.options.find(r => r.id === activeOptionId) || routeResult.recommendedRoute;

  return {
    routeResult,
    selectedRoute,
    activeOptionId,
    setActiveOptionId,
    optimizing,
    optimizationStep,
    error,
    optimizeRoute
  };
}
