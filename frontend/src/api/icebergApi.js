import apiClient from './client';
import { MOCK_ICEBERGS, MOCK_ROUTES } from './mockData';

export const icebergApi = {
  /**
   * Get list of all tracked icebergs
   * GET /api/icebergs
   */
  async getAll() {
    try {
      const data = await apiClient.get('/api/icebergs');
      return { icebergs: data.icebergs || data, isFallback: false };
    } catch (err) {
      console.warn('Backend iceberg service unavailable, using polar tracking dataset', err.message);
      return { icebergs: MOCK_ICEBERGS, isFallback: true };
    }
  },

  /**
   * Get single iceberg details
   * GET /api/icebergs/{id}
   */
  async getById(id) {
    try {
      const data = await apiClient.get(`/api/icebergs/${id}`);
      return { ...data, isFallback: false };
    } catch (err) {
      const found = MOCK_ICEBERGS.find(b => b.id.toLowerCase() === id.toLowerCase()) || MOCK_ICEBERGS[0];
      return { ...found, isFallback: true };
    }
  },

  /**
   * Get predicted drift trajectory for an iceberg
   * GET /api/icebergs/{id}/trajectory
   */
  async getTrajectory(id) {
    try {
      const data = await apiClient.get(`/api/icebergs/${id}/trajectory`);
      return { ...data, isFallback: false };
    } catch (err) {
      const found = MOCK_ICEBERGS.find(b => b.id.toLowerCase() === id.toLowerCase()) || MOCK_ICEBERGS[0];
      return {
        id: found.id,
        name: found.name,
        currentPosition: { latitude: found.latitude, longitude: found.longitude },
        speedKnots: found.speed,
        headingDegrees: found.heading,
        direction: found.direction,
        predictionModel: 'Lagrangian Drift Model v1.2',
        trajectory: found.trajectory,
        isFallback: true
      };
    }
  },

  /**
   * Get active proximity alerts
   */
  async getAlerts() {
    try {
      const data = await apiClient.get('/api/icebergs/alerts');
      return { alerts: data.alerts || [data], isFallback: false };
    } catch (err) {
      return {
        alerts: [MOCK_ROUTES.proximityAlert],
        isFallback: true
      };
    }
  }
};

export default icebergApi;
