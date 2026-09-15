import React from 'react';
import RiskBadge from '../common/RiskBadge';

export default function RouteComparison({ routes = [], selectedRouteId, onSelectRoute }) {
  return (
    <div className="tech-card" style={{ padding: '14px' }}>
      <div className="technical-label flex-between" style={{ marginBottom: '10px' }}>
        <span>PARETO ROUTE COMPARISON MATRIX</span>
        <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>SELECT TO INSPECT ON MAP</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>STRATEGY</th>
              <th style={{ padding: '6px 8px' }}>DISTANCE</th>
              <th style={{ padding: '6px 8px' }}>EST. FUEL</th>
              <th style={{ padding: '6px 8px' }}>TIME</th>
              <th style={{ padding: '6px 8px' }}>RISK SCORE</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(r => {
              const isSelected = r.id === selectedRouteId;
              const isRecommended = r.isRecommended || r.id === 'balanced';

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRoute && onSelectRoute(r.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(116, 179, 206, 0.12)' : 'transparent',
                    borderLeft: isSelected ? `3px solid ${r.color || 'var(--accent-ice)'}` : '3px solid transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 0.12s ease'
                  }}
                >
                  <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', backgroundColor: r.color, borderRadius: '1px' }} />
                      <span>{r.name.split(' (')[0]}</span>
                      {isRecommended && (
                        <span
                          style={{
                            fontSize: '8.5px',
                            background: 'rgba(224, 159, 62, 0.2)',
                            color: 'var(--risk-moderate)',
                            border: '1px solid var(--risk-moderate)',
                            padding: '1px 4px',
                            borderRadius: '2px'
                          }}
                        >
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {r.distanceKm} km
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {r.estimatedFuelLiters} L
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {r.travelTimeHours} hrs
                  </td>
                  <td style={{ padding: '8px' }}>
                    <RiskBadge score={r.riskScore} category={r.riskCategory} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
