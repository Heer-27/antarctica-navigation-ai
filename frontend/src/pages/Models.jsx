import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, Info, ShieldCheck, Database } from 'lucide-react';
import Metric from '../components/common/Metric';
import { MOCK_MODELS } from '../api/mockData';

export default function Models() {
  return (
    <div style={{ flex: 1, padding: '20px 28px', backgroundColor: 'var(--bg-primary)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div className="technical-label">ALGORITHMIC TRANSPARENCY & VALIDATION</div>
        <h2 className="mono-readout" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
          DECISION-SUPPORT AI MODEL SPECIFICATIONS & BENCHMARKS
        </h2>
      </div>

      {/* Model Confidence Notice Banner */}
      <div
        className="tech-card"
        style={{
          padding: '14px 16px',
          backgroundColor: 'rgba(116, 179, 206, 0.08)',
          border: '1px solid var(--border-tech)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <Info size={18} color="var(--accent-ice)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          <strong>SCIENTIFIC CONFIDENCE NOTICE:</strong> Prediction confidence scores represent the numerical model's estimated statistical reliability based on historical validation residuals, sensor coverage density, and satellite revisit latency. Confidence indicators should not be interpreted as an absolute maritime safety guarantee. Final route execution is subject to Master discretion and real-time polar watchkeeping.
        </div>
      </div>

      {/* Model Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {MOCK_MODELS.map(model => (
          <div key={model.id} className="tech-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--accent-ice)" />
                <span className="mono-readout" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {model.name}
                </span>
              </div>
              <span
                className="mono-readout"
                style={{
                  fontSize: '9.5px',
                  color: 'var(--risk-low)',
                  background: 'var(--risk-low-bg)',
                  border: '1px solid var(--risk-low)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                {model.version} · {model.status}
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <strong>Architecture:</strong> {model.type}
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div className="technical-label" style={{ fontSize: '9px', marginBottom: '4px' }}>REGRESSION TARGET</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-ice)', fontFamily: 'var(--font-mono)' }}>
                {model.target}
              </div>
            </div>

            {/* Validation Metrics Grid */}
            <div>
              <div className="technical-label" style={{ marginBottom: '6px' }}>EMPIRICAL VALIDATION BENCHMARKS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.entries(model.metrics).map(([key, val]) => (
                  <div key={key} style={{ background: 'var(--bg-primary)', padding: '6px 8px', borderRadius: 'var(--radius-xs)' }}>
                    <span className="technical-label" style={{ fontSize: '8.5px', display: 'block' }}>{key.toUpperCase()}</span>
                    <span className="mono-readout" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Inputs */}
            <div>
              <div className="technical-label" style={{ marginBottom: '6px' }}>INPUT FEATURE WEIGHTS & ATTRIBUTES</div>
              <ul style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {model.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              <span>TRAINING HORIZON: {model.trainingPeriod}</span>
              <span>CALIBRATED: {model.metrics.sampleCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
