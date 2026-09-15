import React, { useState } from 'react';
import { formatLatitude, formatLongitude, formatCoordinates } from '../../utils/coordinates';
import { useApp } from '../../context/AppContext';

export default function CoordinateDisplay({ lat, lon, formatOverride, className = '' }) {
  const { settings } = useApp();
  const [copied, setCopied] = useState(false);

  const format = formatOverride || settings.coordinateFormat;

  const handleCopy = () => {
    const text = `${lat}, ${lon}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={handleCopy}
      title="Click to copy decimal coordinates"
      className={`mono-readout ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--text-primary)',
        background: 'var(--bg-primary)',
        padding: '3px 7px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xs)',
        userSelect: 'none'
      }}
    >
      {format === 'decimal' ? (
        <span>{formatCoordinates(lat, lon, 'decimal')}</span>
      ) : (
        <span>
          {formatLatitude(lat)}&nbsp;&nbsp;{formatLongitude(lon)}
        </span>
      )}
      {copied && (
        <span style={{ fontSize: '9px', color: 'var(--accent-ice)' }}>COPIED</span>
      )}
    </div>
  );
}
