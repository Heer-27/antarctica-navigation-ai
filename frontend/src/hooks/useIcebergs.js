import { useState, useEffect, useCallback } from 'react';
import icebergApi from '../api/icebergApi';

export function useIcebergs() {
  const [icebergs, setIcebergs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIcebergs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resIcebergs, resAlerts] = await Promise.all([
        icebergApi.getAll(),
        icebergApi.getAlerts()
      ]);
      setIcebergs(resIcebergs.icebergs || []);
      setAlerts(resAlerts.alerts || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve iceberg observations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIcebergs();
  }, [fetchIcebergs]);

  return {
    icebergs,
    alerts,
    loading,
    error,
    refresh: fetchIcebergs
  };
}
