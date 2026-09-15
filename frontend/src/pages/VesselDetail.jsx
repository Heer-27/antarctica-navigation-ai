import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shipApi } from '../api/shipApi';
import { useApp } from '../context/AppContext';
import { formatFuel } from '../utils/formatting';
import { formatLatitude, formatLongitude } from '../utils/coordinates';
import Metric from '../components/common/Metric';
import LoadingState from '../components/common/LoadingState';
import MapContainer from '../components/map/MapContainer';
import CoordinateDisplay from '../components/common/CoordinateDisplay';
import { Ship, Navigation, ArrowLeft, Fuel, Shield, Compass, Thermometer } from 'lucide-react';
import { MOCK_WEATHER } from '../api/mockData';

export default function VesselDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectShipForNavigation } = useApp();

  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVessel = async () => {
      setLoading(true);
      try {
        const res = await shipApi.getShipById(id);
        setVessel(res);
      } catch (e) {
        console.error('Failed to load vessel telemetry', e);
      } finally {
        setLoading(false);
      }
    };
    loadVessel();
  }, [id]);

  if (loading) return <LoadingState message={`Accessing telemetry for Vessel ${id}...`} />;
  if (!vessel) return null;

  const handlePlanRoute = () => {
    selectShipForNavigation(vessel);
    navigate('/navigation');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Bar */}
      <div
        style={{
          padding: '10px 18px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/vessels" className="btn-polar" style={{ padding: '4px 8px' }}>
            <ArrowLeft size={13} />
            <span>Fleet Registry</span>
          </Link>
          <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            VESSEL TELEMETRY: {vessel.name.toUpperCase()}
          </div>
        </div>

        <button onClick={handlePlanRoute} className="btn-polar btn-primary-action">
          <Navigation size={13} />
          <span>Plan Route with this Vessel</span>
        </button>
      </div>

      {/* Main Grid: Left Map, Right Engineering & Metocean Specs */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 0 }} className="vessel-detail-grid">
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer />
        </div>

        {/* Engineering & Operational Spec Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-subtle)',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Identification Header */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ship size={15} color="var(--accent-cyan)" />
                <span className="technical-label">RESEARCH ASSET DOSSIER</span>
              </div>
              <span className="mono-readout" style={{ fontSize: '10px', color: 'var(--risk-low)' }}>
                {vessel.status || 'OPERATIONAL'}
              </span>
            </div>

            <div className="mono-readout" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {vessel.name}
            </div>
            <div className="technical-label" style={{ fontSize: '9.5px', color: 'var(--accent-ice)', marginBottom: '10px' }}>
              OPERATOR: {vessel.operator || 'Polar Marine Operations'}
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>CURRENT COORDINATES:</span>
                <CoordinateDisplay lat={vessel.latitude} lon={vessel.longitude} />
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>DESTINATION:</span>
                <span style={{ color: 'var(--text-primary)' }}>{vessel.destination}</span>
              </div>
            </div>
          </div>

          {/* Polar Ice Class Rating */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <span className="technical-label">IMO POLAR CODE SPECIFICATION</span>
              <Shield size={14} color="var(--accent-ice)" />
            </div>
            <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-ice)', marginBottom: '4px' }}>
              {vessel.iceClass}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              Certified for year-round polar transit in medium to thick ice packs. Operates with active ice-breaker hull and forward scanning sonar.
            </div>
          </div>

          {/* Machinery & Propulsion Parameters */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="technical-label" style={{ marginBottom: '10px' }}>PROPULSION & BUNKER CAPACITY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Metric label="MAX SPEED" value={`${vessel.maxSpeed}`} unit="kn" />
              <Metric label="CRUISING SPEED" value={`${vessel.normalSpeed}`} unit="kn" />
              <Metric label="BUNKER TANK" value={formatFuel(vessel.fuelCapacity, 't')} />
              <Metric label="BURN RATE" value={`${vessel.fuelConsumptionRate}`} unit="L/nm" />
            </div>
          </div>

          {/* Surrounding Metocean Environment */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="technical-label" style={{ marginBottom: '10px' }}>SURROUNDING METOCEAN OBSERVATION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Metric label="AIR TEMP" value={`${MOCK_WEATHER.airTemperature}`} unit="°C" />
              <Metric label="LOCAL WIND" value={`${MOCK_WEATHER.windSpeed}`} unit="kn" secondary={MOCK_WEATHER.windDirectionText} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .vessel-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
