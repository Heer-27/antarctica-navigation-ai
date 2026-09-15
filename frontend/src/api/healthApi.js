import apiClient from './client';
import { MOCK_SYSTEM_STATUS } from './mockData';

export const healthApi = {
  /**
   * Check backend service health and operational parameters
   * GET /api/health
   */
  async getStatus() {
    try {
      const data = await apiClient.get('/api/health');
      return {
        ...data,
        isBackendConnected: true,
        dataMode: data.demo_mode ? 'BACKEND_DEMO' : 'LIVE'
      };
    } catch (err) {
      return {
        ...MOCK_SYSTEM_STATUS,
        isBackendConnected: false,
        dataMode: 'FRONTEND_SIMULATION'
      };
    }
  }
};

export default healthApi;
