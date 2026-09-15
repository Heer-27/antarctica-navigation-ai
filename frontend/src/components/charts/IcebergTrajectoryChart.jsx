import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function IcebergTrajectoryChart({ trajectory = [] }) {
  const [metric, setMetric] = useState('latitude');

  const chartData = trajectory.map(t => ({
    time: t.step || t.time,
    latitude: Math.abs(t.latitude),
    longitude: Math.abs(t.longitude),
    speed: t.speed,
    probability: t.probability
  }));

  const metricConfigs = {
    latitude: {
      label: 'Latitude (°S)',
      dataKey: 'latitude',
      color: '#74B3CE',
      unit: '°S',
      domain: ['auto', 'auto']
    },
    longitude: {
      label: 'Longitude (°W)',
      dataKey: 'longitude',
      color: '#5BC0BE',
      unit: '°W',
      domain: ['auto', 'auto']
    },
    speed: {
      label: 'Drift Velocity (kn)',
      dataKey: 'speed',
      color: '#E09F3E',
      unit: ' kn',
      domain: [0, 3]
    },
    probability: {
      label: 'Trajectory Probability %',
      dataKey: 'probability',
      color: '#4EBA6F',
      unit: '%',
      domain: [50, 100]
    }
  };

  const activeConfig = metricConfigs[metric];

  return (
    <div className="tech-card" style={{ padding: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '12px' }}>
        <div>
          <div className="technical-label">LAGRANGIAN DRIFT KINEMATICS</div>
          <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Predicted Trajectory Time Series (+48h Horizon)
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {Object.entries(metricConfigs).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className="btn-polar"
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                backgroundColor: metric === key ? 'var(--surface-elevated)' : 'transparent',
                borderColor: metric === key ? cfg.color : 'var(--border-subtle)',
                color: metric === key ? cfg.color : 'var(--text-muted)'
              }}
            >
              {cfg.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2D44" />
            <XAxis
              dataKey="time"
              stroke="#647B95"
              fontSize={10}
              tickLine={false}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="#647B95"
              fontSize={10}
              tickLine={false}
              fontFamily="var(--font-mono)"
              domain={activeConfig.domain}
              unit={activeConfig.unit}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-overlay)',
                      border: '1px solid var(--border-medium)',
                      padding: '8px 10px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      borderRadius: 'var(--radius-xs)',
                      boxShadow: 'var(--shadow-panel)'
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                    <div style={{ color: activeConfig.color }}>
                      {activeConfig.label}: <strong>{payload[0]?.value} {activeConfig.unit}</strong>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey={activeConfig.dataKey}
              name={activeConfig.label}
              stroke={activeConfig.color}
              strokeWidth={2}
              dot={{ r: 3, fill: activeConfig.color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
