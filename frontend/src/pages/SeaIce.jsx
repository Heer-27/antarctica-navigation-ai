import React, { useState, useEffect } from 'react';
import MapContainer from '../components/map/MapContainer';
import SeaIceChart from '../components/charts/SeaIceChart';
import Metric from '../components/common/Metric';
import LoadingState from '../components/common/LoadingState';
import CoordinateDisplay from '../components/common/CoordinateDisplay';
import { useSeaIce } from '../hooks/useSeaIce';
import { seaIceApi } from '../api/seaIceApi';
import { formatLatitude, formatLongitude } from '../utils/coordinates';
import { Layers, Calendar, Clock, Sparkles, TrendingUp, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SeaIce() {
  const { systemStatus } = useApp();
  const horizons = ['6h', '12h', '24h', '48h', '72h', '5d'];
  const { currentData, forecastData, horizon, setHorizon, loading, error } = useSeaIce('24h');

  // Selected map coordinate inspection
  const [inspectedLocation, setInspectedLocation] = useState({
    name: 'Weddell Sea Pack Sector',
    lat: -70.5,
    lon: -45.0,
    concentration: 88.5,
    confidence: 87,
    pred24: 89.8,
    pred48: 91.2,
    pred72: 92.4,
    source: systemStatus.dataMode,
    model: 'Sea Ice Forecast v1.0 (RF Regressor)'
  });

  const [historyResult, setHistoryResult] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch historical data for inspected location
  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await seaIceApi.getHistory(inspectedLocation.lat, inspectedLocation.lon, 14);
        setHistoryResult(res);
      } catch (e) {
        console.error('History fetch error', e);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [inspectedLocation.lat, inspectedLocation.lon]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Horizon Selection Bar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: 'rgba(13, 27, 52, 0.65)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-panel)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={15} color="var(--accent-ice)" />
          <span className="technical-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            SEA-ICE SPATIAL CONCENTRATION & NUMERICAL FORECAST
          </span>
        </div>

        {/* Horizon Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="technical-label" style={{ fontSize: '9.5px', marginRight: '4px' }}>FORECAST HORIZON:</span>
          {horizons.map(h => {
            const isSelected = horizon === h;
            return (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className="btn-polar"
                style={{
                  fontSize: '11px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isSelected ? 'var(--accent-ice)' : 'transparent',
                  color: isSelected ? 'var(--bg-space)' : 'var(--text-secondary)',
                  borderColor: isSelected ? 'var(--accent-ice)' : 'var(--glass-border)',
                  fontWeight: isSelected ? 700 : 400
                }}
              >
                +{h.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Map on Left, Point Inspector & Chart on Right */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 0 }} className="seaice-layout-grid">
        {/* Spatial Map */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer
            onSelectSegment={() => {}}
          />
        </div>

        {/* Inspection Panel & Temporal Analytics */}
        <div
          style={{
            backgroundColor: 'rgba(13, 27, 52, 0.55)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderLeft: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Location Inspection Card */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span className="technical-label">POINT INSPECTION TELEMETRY</span>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--accent-ice)' }}>
                GRID 25KM
              </span>
            </div>

            <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {inspectedLocation.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <CoordinateDisplay lat={inspectedLocation.lat} lon={inspectedLocation.lon} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <span className="technical-label" style={{ fontSize: '9px', display: 'block' }}>CURRENT CONCENTRATION</span>
                <span className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-ice)' }}>
                  {inspectedLocation.concentration}%
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                <span className="technical-label" style={{ fontSize: '9px', display: 'block' }}>PREDICTION CONFIDENCE</span>
                <span className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--risk-low)' }}>
                  {inspectedLocation.confidence}%
                </span>
              </div>
            </div>

            {/* Horizon Predictions Breakdown */}
            <div className="technical-label" style={{ marginBottom: '6px', fontSize: '9.5px' }}>FORECAST HORIZONS (PREDICTED)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '6px', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>+24H</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inspectedLocation.pred24}%</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>+48H</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inspectedLocation.pred48}%</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>+72H</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inspectedLocation.pred72}%</span>
              </div>
            </div>

            <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <div>MODEL: {inspectedLocation.model}</div>
              <div>DATA SOURCE: {inspectedLocation.source}</div>
            </div>
          </div>

          {/* Historical Statistics & Actual Calculated Trend */}
          {historyResult?.stats && (
            <div className="tech-card" style={{ padding: '12px' }}>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span className="technical-label">14-DAY OBSERVED ICE DYNAMICS</span>
                <TrendingUp size={13} color="var(--risk-moderate)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>MINIMUM</span>
                  <span style={{ color: 'var(--text-primary)' }}>{historyResult.stats.min}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>AVERAGE</span>
                  <span style={{ color: 'var(--text-primary)' }}>{historyResult.stats.average}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>MAXIMUM</span>
                  <span style={{ color: 'var(--text-primary)' }}>{historyResult.stats.max}%</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Sea-ice concentration has {historyResult.stats.trendPercent >= 0 ? 'increased' : 'decreased'} by{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{Math.abs(historyResult.stats.trendPercent)}%</strong> over the selected 14-day observation period.
              </div>
            </div>
          )}

          {/* Sea Ice Time Series Chart */}
          <SeaIceChart currentConcentration={inspectedLocation.concentration} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .seaice-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
