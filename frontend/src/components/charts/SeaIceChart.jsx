import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function SeaIceChart({ historyData = [], currentConcentration = 72.4 }) {
  // If data not provided, generate realistic 14-day sample
  const data = historyData.length > 0 ? historyData : [
    { time: 'Day -10', historical: 64.2, predicted: null, ciLow: null, ciHigh: null },
    { time: 'Day -8', historical: 66.5, predicted: null, ciLow: null, ciHigh: null },
    { time: 'Day -6', historical: 68.1, predicted: null, ciLow: null, ciHigh: null },
    { time: 'Day -4', historical: 69.4, predicted: null, ciLow: null, ciHigh: null },
    { time: 'Day -2', historical: 71.0, predicted: null, ciLow: null, ciHigh: null },
    { time: 'NOW', historical: 72.4, predicted: 72.4, ciLow: 70.2, ciHigh: 74.6 },
    { time: '+12H', historical: null, predicted: 73.8, ciLow: 71.1, ciHigh: 76.5 },
    { time: '+24H', historical: null, predicted: 74.5, ciLow: 71.5, ciHigh: 77.8 },
    { time: '+48H', historical: null, predicted: 76.2, ciLow: 72.8, ciHigh: 79.9 },
    { time: '+72H', historical: null, predicted: 78.0, ciLow: 74.0, ciHigh: 82.2 }
  ];

  return (
    <div className="tech-card" style={{ padding: '16px' }}>
      <div className="flex-between" style={{ marginBottom: '12px' }}>
        <div>
          <div className="technical-label">TEMPORAL SEA-ICE CONCENTRATION DYNAMICS</div>
          <div className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Historical In-Situ & Random Forest Forecast (25km Resolution)
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--accent-cyan)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>OBSERVED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '2px', borderTop: '2px dashed var(--accent-ice)' }} />
            <span style={{ color: 'var(--accent-ice)' }}>PREDICTED (90% CI)</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2D44" />
            <XAxis
              dataKey="time"
              stroke="#647B95"
              fontSize={10}
              tickLine={false}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              domain={[50, 95]}
              unit="%"
              stroke="#647B95"
              fontSize={10}
              tickLine={false}
              fontFamily="var(--font-mono)"
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
                    {payload.map(p => (
                      <div key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
                        {p.name}: <strong>{p.value}%</strong>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <ReferenceLine x="NOW" stroke="#74B3CE" strokeDasharray="2 2" label={{ value: 'CURRENT', fill: '#74B3CE', fontSize: 9, position: 'top' }} />
            <Line
              type="monotone"
              dataKey="historical"
              name="Historical In-Situ"
              stroke="#5BC0BE"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#5BC0BE' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted Pack"
              stroke="#74B3CE"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#74B3CE' }}
              connectNulls={false}
            />
            {/* Confidence envelope */}
            <Area
              type="monotone"
              dataKey="ciHigh"
              stroke="transparent"
              fill="rgba(116, 179, 206, 0.12)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
