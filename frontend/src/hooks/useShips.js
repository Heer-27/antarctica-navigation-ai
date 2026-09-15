import { useState, useEffect, useCallback } from 'react';
import shipApi from '../api/shipApi';

export function useShips() {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shipApi.getShips();
      setShips(res.ships || []);
    } catch (err) {
      setError(err.message || 'Failed to load research vessel fleet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShips();
  }, [fetchShips]);

  const addShip = async (shipData) => {
    const created = await shipApi.createShip(shipData);
    await fetchShips();
    return created;
  };

  const editShip = async (id, shipData) => {
    const updated = await shipApi.updateShip(id, shipData);
    await fetchShips();
    return updated;
  };

  const removeShip = async (id) => {
    await shipApi.deleteShip(id);
    await fetchShips();
  };

  return {
    ships,
    loading,
    error,
    refresh: fetchShips,
    addShip,
    editShip,
    removeShip
  };
}
