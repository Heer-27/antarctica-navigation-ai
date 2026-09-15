import apiClient from './client';
import { MOCK_WEATHER } from './mockData';

export const weatherApi = {
  /**
   * Get synoptic weather conditions for coordinates
   * GET /api/weather?lat=...&lon=...
   */
  async getCurrent(lat = -64.82, lon = -58.25) {
    try {
      const data = await apiClient.get(`/api/weather?lat=${lat}&lon=${lon}`);
      return { ...data, isFallback: false };
    } catch (err) {
      return {
        ...MOCK_WEATHER,
        latitude: Number(lat),
        longitude: Number(lon),
        isFallback: true
      };
    }
  }
};

export default weatherApi;
