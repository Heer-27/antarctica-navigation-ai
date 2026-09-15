import apiClient from './client';
import { MOCK_OCEAN } from './mockData';

export const oceanApi = {
  /**
   * Get oceanographic telemetry (currents, waves, SST)
   * GET /api/ocean?lat=...&lon=...
   */
  async getCurrent(lat = -64.82, lon = -58.25) {
    try {
      const data = await apiClient.get(`/api/ocean?lat=${lat}&lon=${lon}`);
      return { ...data, isFallback: false };
    } catch (err) {
      return {
        ...MOCK_OCEAN,
        latitude: Number(lat),
        longitude: Number(lon),
        isFallback: true
      };
    }
  }
};

export default oceanApi;
