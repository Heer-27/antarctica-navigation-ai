import React, { useState } from 'react';
import MapContainer from '../components/map/MapContainer';
import RouteForm from '../components/navigation/RouteForm';
import RouteComparison from '../components/navigation/RouteComparison';
import DecisionExplainer from '../components/navigation/DecisionExplainer';
import SegmentInspector from '../components/navigation/SegmentInspector';
import RiskGauge from '../components/common/RiskGauge';
import ProximityAlert from '../components/icebergs/ProximityAlert';
import { useRoute } from '../hooks/useRoute';
import { useShips } from '../hooks/useShips';
import { useApp } from '../context/AppContext';
import { Navigation as NavIcon, AlertTriangle, Layers, Fuel, Clock } from 'lucide-react';

export default function Navigation() {
  const { ships } = useShips();
  const { routeResult, selectedRoute, activeOptionId, setActiveOptionId, optimizing, optimizationStep, optimizeRoute } = useRoute();
  const [inspectedSegmentId, setInspectedSegmentId] = useState('SEG-01');

  const handleOptimize = async (params) => {
    try {
      await optimizeRoute(params);
    } catch (e) {
      console.error('Optimization error', e);
    }
  };

  const shortestRoute = routeResult.options.find(r => r.id === 'shortest');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Top Operations Header */}
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
          <NavIcon size={15} color="var(--accent-ice)" />
          <span className="technical-label" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            POLAR MARITIME NAVIGATION & PARETO ROUTE OPTIMIZATION ENGINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--text-muted)' }}>ENGINE:</span>
          <span style={{ color: 'var(--accent-cyan)' }}>PARETO A* MULTI-OBJECTIVE</span>
          <span style={{ color: 'var(--border-medium)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>ICE RESOLUTION:</span>
          <span style={{ color: 'var(--text-primary)' }}>25 KM GRID</span>
        </div>
      </div>

      {/* Main Grid: Left Form, Center Map, Right Analysis */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 340px', minHeight: 0 }} className="navigation-main-grid">
        {/* LEFT: Route Planning Form */}
        <div
          style={{
            backgroundColor: 'rgba(13, 27, 52, 0.55)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRight: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-panel)',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <RouteForm
            onOptimize={handleOptimize}
            isOptimizing={optimizing}
            currentStep={optimizationStep}
            vessels={ships}
          />
        </div>

        {/* CENTER: Large Interactive Antarctic Map */}
        <div style={{ position: 'relative', height: '100%', minHeight: '400px' }}>
          <MapContainer
            customRoutes={routeResult.options}
            highlightedRouteId={activeOptionId}
            onSelectSegment={(segId) => setInspectedSegmentId(segId)}
          />
        </div>

        {/* RIGHT: Route Decision Analysis & Risk Gauge */}
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
          {/* Active Proximity Hazard Alert if nearby iceberg */}
          {routeResult.proximityAlert && (
            <ProximityAlert alert={routeResult.proximityAlert} />
          )}

          {/* Active Route Telemetry Card */}
          <div className="tech-card" style={{ padding: '14px', borderLeft: `3px solid ${selectedRoute?.color || 'var(--accent-ice)'}` }}>
            <div className="flex-between" style={{ marginBottom: '6px' }}>
              <span className="technical-label">EVALUATED ROUTE CORRIDOR</span>
              <span className="mono-readout" style={{ fontSize: '10px', color: selectedRoute?.color, fontWeight: 700 }}>
                {selectedRoute?.type || 'RECOMMENDED'}
              </span>
            </div>

            <div className="mono-readout" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {selectedRoute?.name}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>TOTAL DISTANCE</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                  {selectedRoute?.distanceKm} km
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>EST. TRANSIT TIME</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px' }}>
                  {selectedRoute?.travelTimeHours} hrs
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>EST. BUNKER FUEL</span>
                <span style={{ color: 'var(--accent-ice)', fontWeight: 600, fontSize: '15px' }}>
                  {selectedRoute?.estimatedFuelLiters} L
                </span>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '9px', display: 'block' }}>RISK PROFILE</span>
                <span style={{ color: selectedRoute?.color || 'var(--risk-low)', fontWeight: 600, fontSize: '15px' }}>
                  {selectedRoute?.riskScore} / 100
                </span>
              </div>
            </div>
          </div>

          {/* Risk Gauge and Factor Decomposition */}
          <RiskGauge
            score={selectedRoute?.riskScore || 31}
            breakdown={selectedRoute?.riskBreakdown}
          />

          {/* Decision-Support Explainer ("Why this route?") */}
          <DecisionExplainer
            explanation={routeResult.decisionExplanation}
            recommendedRoute={selectedRoute}
            shortestRoute={shortestRoute}
          />
        </div>
      </div>

      {/* BOTTOM: Route Comparison Matrix & Segment Inspector Tabs */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-primary)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '12px',
          padding: '12px 14px'
        }}
        className="navigation-bottom-grid"
      >
        <RouteComparison
          routes={routeResult.options}
          selectedRouteId={activeOptionId}
          onSelectRoute={(id) => setActiveOptionId(id)}
        />

        <SegmentInspector
          segments={routeResult.segments}
          activeSegmentId={inspectedSegmentId}
          onSelectSegment={(id) => setInspectedSegmentId(id)}
        />
      </div>

      <style>{`
        @media (max-width: 1280px) {
          .navigation-main-grid {
            grid-template-columns: 1fr !important;
          }
          .navigation-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
