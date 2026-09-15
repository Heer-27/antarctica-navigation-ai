import React from 'react';
import { HelpCircle, AlertTriangle, ShieldCheck, Compass, Layers, Info } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      q: 'What is the primary mission of this decision-support platform?',
      a: 'The system ingests remote sensing satellite SAR imagery, Lagrangian hydrodynamic current models, and atmospheric wind fields to provide polar research vessels with predictive sea-ice concentration maps, iceberg trajectory warnings, and multi-objective Pareto-optimal transit routes.'
    },
    {
      q: 'How is Sea-Ice Concentration calculated and classified?',
      a: 'Sea-ice concentration is expressed as the percentage of ocean surface covered by ice within a given 25km grid cell. 0–20% denotes Open Water / Very Open Pack; 40–60% represents Moderate Pack; 70–85% denotes Close Pack Ice; >85% indicates Consolidated Fast Ice or Heavy Ridge Formations.'
    },
    {
      q: 'How does Iceberg Trajectory Prediction operate?',
      a: 'A coupled atmospheric-hydrodynamic Lagrangian kinematic drift model calculates drag forces from 10m surface winds (form and skin friction) and ocean mixed-layer Ekman currents, adjusted for Coriolis deflection at high southern latitudes and damping effects inside compact sea-ice matrices.'
    },
    {
      q: 'How does Multi-Objective Route Optimization work?',
      a: 'A Pareto A* algorithm simultaneously minimizes navigation risk (ice concentration and iceberg proximity), total marine fuel consumption (accounting for hull ice resistance and current assist), and voyage duration. The user-defined weights (Safety, Fuel, Time) define the gradient on the Pareto frontier.'
    },
    {
      q: 'What does the Composite Navigation Risk Score (0-100) signify?',
      a: 'The risk score synthesizes sea-ice pack concentration, iceberg CPA (Closest Point of Approach), significant wave height, and gust velocities. Scores from 0–35 are classified as LOW RISK; 36–65 as MODERATE RISK; 66–85 as HIGH RISK; 86–100 as CRITICAL RISK.'
    },
    {
      q: 'What does "Prediction Confidence" indicate?',
      a: 'Confidence percentages reflect residual standard deviations from historical cross-validation and sensor revisit cadence. They reflect model precision under given weather conditions and must never be interpreted as an infallible certainty.'
    },
    {
      q: 'What does DEMO DATA / SIMULATION mode mean?',
      a: 'When disconnected from the production FastAPI satellite pipeline, the platform utilizes scientifically calibrated synthetic polar telemetry based on historical Alfred Wegener Institute and British Antarctic Survey geographic datasets. It allows complete operational simulation without live satellite subscription overhead.'
    }
  ];

  return (
    <div style={{ flex: 1, padding: '24px 32px', backgroundColor: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <div className="technical-label">MARITIME REFERENCE & USER MANUAL</div>
        <h2 className="mono-readout" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          DECISION-SUPPORT TECHNICAL GUIDE
        </h2>
      </div>

      {/* Mandatory Official Maritime Disclaimer */}
      <div
        className="tech-card"
        style={{
          padding: '16px 20px',
          backgroundColor: 'rgba(217, 83, 79, 0.08)',
          border: '1px solid var(--risk-high)',
          borderLeft: '4px solid var(--risk-high)',
          marginBottom: '24px'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={17} color="var(--risk-high)" />
            <span className="mono-readout" style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--risk-high)' }}>
              MANDATORY MARITIME NAVIGATION DISCLAIMER
            </span>
          </div>
          <span className="technical-label" style={{ color: 'var(--risk-high)' }}>IMO POLAR CODE ADVISORY</span>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.6', fontFamily: 'var(--font-sans)' }}>
          "This platform is an educational decision-support prototype. It is not a certified maritime navigation system and must not be used as a substitute for official navigation charts, ice information, vessel procedures, or qualified maritime personnel."
        </p>
      </div>

      {/* FAQ / Technical Explanations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '900px' }}>
        {faqs.map((item, i) => (
          <div key={i} className="tech-card" style={{ padding: '16px' }}>
            <div className="mono-readout" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent-ice)', marginBottom: '6px' }}>
              {item.q}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.55', fontFamily: 'var(--font-sans)' }}>
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
