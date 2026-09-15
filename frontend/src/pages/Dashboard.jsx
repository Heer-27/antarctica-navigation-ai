import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapContainer from '../components/map/MapContainer';
import ExpeditionTimeline from '../components/navigation/ExpeditionTimeline';
import ProximityAlert from '../components/icebergs/ProximityAlert';
import IcebergDetailDrawer from '../components/icebergs/IcebergDetailDrawer';
import Metric from '../components/common/Metric';
import RiskBadge from '../components/common/RiskBadge';
import { useApp } from '../context/AppContext';
import { useIcebergs } from '../hooks/useIcebergs';
import { useRoute } from '../hooks/useRoute';
import { Wind, Waves, Ship, Compass, ArrowRight, ShieldAlert, Thermometer, Gauge } from 'lucide-react';
import { MOCK_WEATHER, MOCK_OCEAN } from '../api/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedShip, selectShipForNavigation } = useApp();
  const { icebergs, alerts } = useIcebergs();
  const { routeResult, selectedRoute } = useRoute();

  const [inspectedIceberg, setInspectedIceberg] = useState(null);

  const proximityNotice = alerts[0] || routeResult.proximityAlert;

  const handleLaunchNavigation = () => {
    if (selectedShip) {
      selectShipForNavigation(selectedShip);
    }
    navigate('/navigation');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative' }}>
      {/* Main Center Map + Right Intelligence Panel Container */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 0, position: 'relative' }} className="dashboard-grid">
        {/* CENTER: Dominant Antarctic Interactive Map */}
        <div style={{ position: 'relative', height: '100%', minHeight: '420px' }}>
          <MapContainer
            onSelectIceberg={(berg) => setInspectedIceberg(berg)}
            highlightedIcebergId={inspectedIceberg?.id}
            customRoutes={routeResult.options}
            highlightedRouteId={selectedRoute?.id || 'balanced'}
          />

          {/* Iceberg Telemetry Detail Drawer when an iceberg is selected on the map */}
          {inspectedIceberg && (
            <IcebergDetailDrawer
              iceberg={inspectedIceberg}
              onClose={() => setInspectedIceberg(null)}
            />
          )}
        </div>

        {/* RIGHT: Environmental Intelligence & Operational Telemetry Panel */}
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
          className="dashboard-intel-panel"
        >
          {/* Active Proximity Threat Alert */}
          {proximityNotice && (
            <ProximityAlert alert={proximityNotice} />
          )}

          {/* Active Vessel Status Card */}
          <div className="tech-card" style={{ padding: '12px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ship size={14} color="var(--accent-cyan)" />
                <span className="technical-label">EXPEDITION FLAGSHIP</span>
              </div>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--risk-low)' }}>
                {selectedShip?.status || 'IN TRANSIT'}
              </span>
            </div>

            <div className="mono-readout" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {selectedShip?.name || 'R/V Polarstern'}
            </div>
            <div className="technical-label" style={{ fontSize: '9.5px', marginBottom: '8px' }}>
              POLAR RATING: {selectedShip?.iceClass || 'PC3'} · DESTINATION: {selectedShip?.destination || 'Rothera Station'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>SPEED</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedShip?.normalSpeed || 11.2} kn</span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>BUNKER FUEL</span>
                <span style={{ color: 'var(--accent-ice)', fontWeight: 600 }}>88% (840k L)</span>
              </div>
            </div>

            <button
              onClick={handleLaunchNavigation}
              className="btn-polar btn-primary-action"
              style={{ width: '100%', marginTop: '10px', padding: '7px', fontSize: '11.5px' }}
            >
              <span>Plan Optimized Route</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Environmental Synoptic Conditions */}
          <div className="tech-card" style={{ padding: '12px' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <span className="technical-label">SYNOPTIC METOCEAN CONDITIONS</span>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>IN-SITU</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Metric
                label="AIR TEMP"
                value={`${MOCK_WEATHER.airTemperature}`}
                unit="°C"
                secondary="SST: -1.6°C"
              />
              <Metric
                label="WIND VECTOR"
                value={`${MOCK_WEATHER.windSpeed}`}
                unit="kn"
                secondary={`${MOCK_WEATHER.windDirectionText} ${MOCK_WEATHER.windDirectionDegrees}°`}
              />
              <Metric
                label="BAROMETER"
                value={`${Math.round(MOCK_WEATHER.barometricPressure)}`}
                unit="hPa"
                secondary="Falling slowly"
              />
              <Metric
                label="SIGNIFICANT WAVE"
                value={`${MOCK_OCEAN.significantWaveHeight}`}
                unit="m"
                secondary="Period: 8.5s"
              />
            </div>
          </div>

          {/* Decision-Support Route Summary */}
          {selectedRoute && (
            <div className="tech-card" style={{ padding: '12px' }}>
              <div className="flex-between" style={{ marginBottom: '6px' }}>
                <span className="technical-label">ACTIVE ROUTE RECOMMENDATION</span>
                <RiskBadge score={selectedRoute.riskScore} category={selectedRoute.riskCategory} size="sm" />
              </div>

              <div className="mono-readout" style={{ fontSize: '12px', fontWeight: 600, color: selectedRoute.color || 'var(--accent-ice)' }}>
                {selectedRoute.name}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', margin: '8px 0', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>DISTANCE</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedRoute.distanceKm} km</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>EST. FUEL</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedRoute.estimatedFuelLiters} L</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>TIME</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedRoute.travelTimeHours} h</span>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {selectedRoute.summary}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Expedition Timeline Scrubber */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
        <ExpeditionTimeline timeline={routeResult.timeline} />
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-intel-panel {
            border-left: none !important;
            border-top: 1px solid var(--border-subtle);
          }
        }
      `}</style>
    </div>
  );
}
