import { useState, useEffect, useCallback } from 'react';
import seaIceApi from '../api/seaIceApi';

export function useSeaIce(initialHorizon = '24h') {
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [horizon, setHorizon] = useState(initialHorizon);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [curr, fc] = await Promise.all([
        seaIceApi.getCurrent(),
        seaIceApi.getForecast(horizon)
      ]);
      setCurrentData(curr);
      setForecastData(fc);
    } catch (err) {
      setError(err.message || 'Failed to retrieve sea-ice data');
    } finally {
      setLoading(false);
    }
  }, [horizon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    currentData,
    forecastData,
    horizon,
    setHorizon,
    loading,
    error,
    refresh: fetchData
  };
}
