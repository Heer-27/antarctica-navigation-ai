import React, { useState } from 'react';
import MapContainer from '../components/map/MapContainer';
import RiskBadge from '../components/common/RiskBadge';
import { routeApi } from '../api/routeApi';
import { Shuffle, RotateCcw, AlertTriangle, Wind, Layers, Waves, Compass, ArrowRightLeft } from 'lucide-react';
import { MOCK_ROUTES } from '../api/mockData';

export default function Scenario() {
  const [params, setParams] = useState({
    windDelta: 15,     // +15 knots gale
    iceDelta: 12,      // +12% pack freeze
    waveDelta: 1.5,    // +1.5m swell
    safetyPreference: 80,
    fuelPreference: 20
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await routeApi.simulateScenario(params);
      setSimulationResult(res);
    } catch (e) {
      console.error('Simulation error', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setParams({
      windDelta: 0,
      iceDelta: 0,
      waveDelta: 0,
      safetyPreference: 70,
      fuelPreference: 30
    });
    setSimulationResult(null);
  };

  const baseRoute = MOCK_ROUTES.options.find(r => r.id === 'balanced');
  const scenarioRoute = simulationResult?.scenarioRoute || {
    ...baseRoute,
    name: 'SCENARIO SIMULATION ROUTE',
    distanceKm: 568.2,
    travelTimeHours: 35.8,
    estimatedFuelLiters: 985,
    riskScore: 54,
    riskCategory: 'MODERATE'
  };

  const divergence = simulationResult?.divergence || {
    distanceDiffKm: 33.2,
    fuelDiffLiters: 115,
    timeDiffHours: 4.4,
    riskDiffScore: 23
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Header */}
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
          <Shuffle size={15} color="var(--accent-ice)" />
          <span className="technical-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            ENVIRONMENTAL "WHAT IF?" SCENARIO SIMULATION LAB
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--risk-moderate)'
          }}
        >
          <span>SIMULATION MODE ACTIVE · HYPOTHETICAL PERTURBATION</span>
        </div>
      </div>

      {/* Main Grid: Left Simulator Controls, Center Map, Right Impact Comparison */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 340px', minHeight: 0 }} className="scenario-grid">
        {/* Left: Environmental Perturbation Sliders */}
        <div
          style={{
            backgroundColor: 'rgba(13, 27, 52, 0.55)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRight: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div className="flex-between">
            <span className="technical-label">HYPOTHETICAL PARAMETERS</span>
            <button onClick={handleReset} className="btn-polar" style={{ fontSize: '10px', padding: '2px 6px' }}>
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          {/* Wind Delta Slider */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Wind Speed Deviation</span>
              <span style={{ color: params.windDelta >= 0 ? 'var(--risk-moderate)' : 'var(--risk-low)', fontWeight: 600 }}>
                {params.windDelta >= 0 ? `+${params.windDelta}` : params.windDelta} kn
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="40"
              value={params.windDelta}
              onChange={e => setParams({ ...params, windDelta: Number(e.target.value) })}
              className="slider-polar"
            />
          </div>

          {/* Sea Ice Concentration Delta */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sea-Ice Pack Change</span>
              <span style={{ color: params.iceDelta >= 0 ? 'var(--accent-ice)' : 'var(--risk-low)', fontWeight: 600 }}>
                {params.iceDelta >= 0 ? `+${params.iceDelta}` : params.iceDelta}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              value={params.iceDelta}
              onChange={e => setParams({ ...params, iceDelta: Number(e.target.value) })}
              className="slider-polar"
            />
          </div>

          {/* Wave Height Delta */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Wave Height Delta</span>
              <span style={{ color: params.waveDelta >= 0 ? 'var(--accent-ocean)' : 'var(--risk-low)', fontWeight: 600 }}>
                {params.waveDelta >= 0 ? `+${params.waveDelta}` : params.waveDelta} m
              </span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="4"
              step="0.1"
              value={params.waveDelta}
              onChange={e => setParams({ ...params, waveDelta: Number(e.target.value) })}
              className="slider-polar"
            />
          </div>

          {/* Safety Bias */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex-between mono-readout" style={{ fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Safety Weighting</span>
              <span style={{ color: 'var(--risk-low)', fontWeight: 600 }}>{params.safetyPreference}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={params.safetyPreference}
              onChange={e => setParams({ ...params, safetyPreference: Number(e.target.value) })}
              className="slider-polar"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="btn-polar btn-primary-action"
            style={{ padding: '10px', width: '100%', marginTop: '6px' }}
          >
            <Shuffle size={14} />
            <span>{simulating ? 'RECALCULATING ROUTE...' : 'RECALCULATE SCENARIO ROUTE'}</span>
          </button>
        </div>

        {/* Center: Map showing Baseline Route vs Scenario Route */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer
            customRoutes={[
              { ...baseRoute, name: 'BASELINE ROUTE (CURRENT)', color: '#4EBA6F' },
              { ...scenarioRoute, name: 'HYPOTHETICAL SCENARIO ROUTE', color: '#E09F3E' }
            ]}
            highlightedRouteId={scenarioRoute.id}
          />
        </div>

        {/* Right: Comparative Divergence Breakdown */}
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
          <div className="tech-card" style={{ padding: '14px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span className="technical-label">SCENARIO DIVERGENCE METRICS</span>
              <ArrowRightLeft size={13} color="var(--risk-moderate)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>ADDITIONAL DISTANCE</span>
                <span style={{ color: divergence.distanceDiffKm > 0 ? 'var(--risk-moderate)' : 'var(--risk-low)', fontSize: '15px', fontWeight: 600 }}>
                  +{divergence.distanceDiffKm} km
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>FUEL EXCESS</span>
                <span style={{ color: divergence.fuelDiffLiters > 0 ? 'var(--risk-moderate)' : 'var(--risk-low)', fontSize: '15px', fontWeight: 600 }}>
                  +{divergence.fuelDiffLiters} L
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>TRAVEL TIME IMPACT</span>
                <span style={{ color: divergence.timeDiffHours > 0 ? 'var(--risk-moderate)' : 'var(--risk-low)', fontSize: '15px', fontWeight: 600 }}>
                  +{divergence.timeDiffHours} hrs
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '8.5px', display: 'block' }}>RISK DELTA</span>
                <span style={{ color: divergence.riskDiffScore > 0 ? 'var(--risk-high)' : 'var(--risk-low)', fontSize: '15px', fontWeight: 600 }}>
                  +{divergence.riskDiffScore} pts
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Impact Narrative */}
          <div className="tech-card" style={{ padding: '14px', borderLeft: '3px solid var(--risk-moderate)' }}>
            <div className="technical-label" style={{ marginBottom: '6px', color: 'var(--risk-moderate)' }}>
              HYDRODYNAMIC & ICE ADVECTION ASSESSMENT
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {simulationResult?.impactSummary ||
                `Under simulated conditions (Wind +${params.windDelta} kn, Sea Ice +${params.iceDelta}%), accelerated Ekman drift pushes tabular fragments into the eastern transit corridor, requiring a 33.2 km seaward detour.`}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1280px) {
          .scenario-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
