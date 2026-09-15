import apiClient from './client';
import { MOCK_SHIPS } from './mockData';

const SHIPS_STORAGE_KEY = 'antarctic_vessels_storage';

function getLocalShips() {
  try {
    const saved = localStorage.getItem(SHIPS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse local ships cache', e);
  }
  return [...MOCK_SHIPS];
}

function saveLocalShips(ships) {
  try {
    localStorage.setItem(SHIPS_STORAGE_KEY, JSON.stringify(ships));
  } catch (e) {
    console.error('Failed to save ships to local storage', e);
  }
}

export const shipApi = {
  /**
   * Get all registered research vessels
   * GET /api/ships
   */
  async getShips() {
    try {
      const data = await apiClient.get('/api/ships');
      const ships = Array.isArray(data) ? data : data.ships || [];
      saveLocalShips(ships);
      return { ships, isFallback: false };
    } catch (err) {
      return {
        ships: getLocalShips(),
        isFallback: true
      };
    }
  },

  /**
   * Get single vessel by ID
   * GET /api/ships/{id}
   */
  async getShipById(id) {
    try {
      const data = await apiClient.get(`/api/ships/${id}`);
      return { ...data, isFallback: false };
    } catch (err) {
      const ships = getLocalShips();
      const ship = ships.find(s => s.id === id) || ships[0];
      return { ...ship, isFallback: true };
    }
  },

  /**
   * Register a new research vessel
   * POST /api/ships
   */
  async createShip(shipData) {
    try {
      const data = await apiClient.post('/api/ships', shipData);
      return { ...data, isFallback: false };
    } catch (err) {
      const ships = getLocalShips();
      const newShip = {
        ...shipData,
        id: shipData.id || `rv-${Date.now()}`,
        status: shipData.status || 'ACTIVE'
      };
      ships.push(newShip);
      saveLocalShips(ships);
      return { ...newShip, isFallback: true };
    }
  },

  /**
   * Update existing vessel details
   * PUT /api/ships/{id}
   */
  async updateShip(id, shipData) {
    try {
      const data = await apiClient.put(`/api/ships/${id}`, shipData);
      return { ...data, isFallback: false };
    } catch (err) {
      const ships = getLocalShips();
      const index = ships.findIndex(s => s.id === id);
      if (index !== -1) {
        ships[index] = { ...ships[index], ...shipData };
        saveLocalShips(ships);
        return { ...ships[index], isFallback: true };
      }
      throw new Error(`Vessel ${id} not found.`);
    }
  },

  /**
   * Delete vessel from registry
   * DELETE /api/ships/{id}
   */
  async deleteShip(id) {
    try {
      await apiClient.delete(`/api/ships/${id}`);
      return { success: true, isFallback: false };
    } catch (err) {
      let ships = getLocalShips();
      ships = ships.filter(s => s.id !== id);
      saveLocalShips(ships);
      return { success: true, isFallback: true };
    }
  }
};

export default shipApi;
