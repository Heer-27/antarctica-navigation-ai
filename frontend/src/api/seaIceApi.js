import apiClient from './client';
import { MOCK_SEA_ICE_CURRENT } from './mockData';

export const seaIceApi = {
  /**
   * Get current sea-ice concentration and regional zones
   * GET /api/sea-ice/current
   */
  async getCurrent() {
    try {
      const data = await apiClient.get('/api/sea-ice/current');
      return { ...data, isFallback: false };
    } catch (err) {
      console.warn('Backend sea-ice current unavailable, using polar simulation dataset', err.message);
      return { ...MOCK_SEA_ICE_CURRENT, isFallback: true };
    }
  },

  /**
   * Get sea-ice concentration forecast for given horizon (+6h, +12h, +24h, +48h, +72h, +5d)
   * GET /api/sea-ice/forecast?horizon=...
   */
  async getForecast(horizon = '24h') {
    try {
      const data = await apiClient.get(`/api/sea-ice/forecast?horizon=${horizon}`);
      return { ...data, isFallback: false };
    } catch (err) {
      // Synthesize realistic forecast adjustments based on time horizon
      const multiplier = horizon === '6h' ? 1.01 : horizon === '12h' ? 1.02 : horizon === '48h' ? 1.05 : 1.08;
      const forecastZones = MOCK_SEA_ICE_CURRENT.regionalZones.map(z => ({
        ...z,
        concentration: Math.min(100, Number((z.concentration * multiplier).toFixed(1))),
        forecastHorizon: horizon
      }));

      return {
        timestamp: new Date().toISOString(),
        forecastHorizon: horizon,
        modelName: 'Sea Ice Forecast v1.0 (RF Regressor)',
        confidence: horizon === '6h' ? 94 : horizon === '24h' ? 87 : 78,
        regionalZones: forecastZones,
        isFallback: true
      };
    }
  },

  /**
   * Get historical sea-ice time series for a location
   * GET /api/sea-ice/history?lat=...&lon=...&days=...
   */
  async getHistory(lat, lon, days = 30) {
    try {
      const data = await apiClient.get(`/api/sea-ice/history?lat=${lat}&lon=${lon}&days=${days}`);
      return { ...data, isFallback: false };
    } catch (err) {
      // Generate synthetic authentic seasonal 30-day polar time series
      const historyPoints = [];
      const now = new Date();
      let currentVal = 68.5;

      for (let i = days; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        currentVal += (Math.random() * 2.2 - 0.9); // slight upward freezing trend in early season
        currentVal = Math.max(10, Math.min(95, currentVal));
        historyPoints.push({
          date: d.toISOString().split('T')[0],
          concentration: Number(currentVal.toFixed(1)),
          isPredicted: i <= 0
        });
      }

      // Add 3 future prediction points
      const future1 = Number((currentVal + 1.2).toFixed(1));
      const future2 = Number((future1 + 1.8).toFixed(1));
      const future3 = Number((future2 + 2.1).toFixed(1));

      return {
        lat,
        lon,
        points: historyPoints,
        forecastPoints: [
          { date: '+24h', concentration: future1, confidence: 88 },
          { date: '+48h', concentration: future2, confidence: 84 },
          { date: '+72h', concentration: future3, confidence: 79 }
        ],
        stats: {
          min: Math.min(...historyPoints.map(p => p.concentration)),
          max: Math.max(...historyPoints.map(p => p.concentration)),
          average: Number((historyPoints.reduce((s, p) => s + p.concentration, 0) / historyPoints.length).toFixed(1)),
          trendPercent: Number(((currentVal - historyPoints[0].concentration) / historyPoints[0].concentration * 100).toFixed(1))
        },
        isFallback: true
      };
    }
  }
};

export default seaIceApi;
