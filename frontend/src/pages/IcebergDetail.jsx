import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MapContainer from '../components/map/MapContainer';
import IcebergTrajectoryChart from '../components/charts/IcebergTrajectoryChart';
import Metric from '../components/common/Metric';
import RiskBadge from '../components/common/RiskBadge';
import LoadingState from '../components/common/LoadingState';
import CoordinateDisplay from '../components/common/CoordinateDisplay';
import { icebergApi } from '../api/icebergApi';
import { formatLatitude, formatLongitude } from '../utils/coordinates';
import { ArrowLeft, Navigation2, Compass, ShieldAlert, Waves, Wind } from 'lucide-react';

export default function IcebergDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrajectory = async () => {
      setLoading(true);
      try {
        const res = await icebergApi.getTrajectory(id);
        setData(res);
      } catch (e) {
        console.error('Failed to load trajectory', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrajectory();
  }, [id]);

  if (loading) {
    return <LoadingState message={`Computing drift trajectory for Target ${id}...`} />;
  }

  if (!data) return null;

  const trajectoryPoints = data.trajectory || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Header Bar */}
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
          <Link to="/icebergs" className="btn-polar" style={{ padding: '4px 8px' }}>
            <ArrowLeft size={13} />
            <span>Catalog</span>
          </Link>
          <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            TARGET {data.name || data.id} · LAGRANGIAN DRIFT DYNAMICS
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-muted)' }}>CURRENT DRIFT:</span>
          <span style={{ color: 'var(--accent-ice)', fontWeight: 600 }}>{data.speedKnots} kn ({data.direction})</span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>MODEL: {data.predictionModel}</span>
        </div>
      </div>

      {/* Main Grid: Left Map with Trajectory Overlay, Right Milestones and Charts */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: 0 }} className="trajectory-grid">
        {/* Map with Active Trajectory */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer
            highlightedIcebergId={data.id}
          />
        </div>

        {/* Trajectory Milestones & Kinematic Charts */}
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
          {/* Kinematic Time Series Chart */}
          <IcebergTrajectoryChart trajectory={trajectoryPoints} />

          {/* Predicted Waypoint List (+6h, +12h, +18h, +24h, +48h) */}
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '10px' }}>
              <span className="technical-label">PROJECTED DRIFT POSITIONS & PROBABILITY</span>
              <span className="mono-readout" style={{ fontSize: '9.5px', color: 'var(--accent-ice)' }}>
                T+48H WINDOW
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trajectoryPoints.map((tp, idx) => (
                <div
                  key={tp.step}
                  style={{
                    background: idx === 0 ? 'rgba(116, 179, 206, 0.08)' : 'var(--bg-primary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div className="flex-between">
                    <span className="mono-readout" style={{ fontSize: '11.5px', fontWeight: 600, color: idx === 0 ? 'var(--accent-ice)' : 'var(--text-primary)' }}>
                      {tp.time}
                    </span>
                    <span className="mono-readout" style={{ fontSize: '10.5px', color: tp.probability >= 85 ? 'var(--risk-low)' : 'var(--risk-moderate)' }}>
                      CONFIDENCE: {tp.probability}%
                    </span>
                  </div>

                  <div className="flex-between" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    <span>{formatLatitude(tp.latitude)} &nbsp; {formatLongitude(tp.longitude)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{tp.speed} kn</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .trajectory-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
