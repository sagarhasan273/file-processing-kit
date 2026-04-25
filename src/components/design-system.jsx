/* eslint-disable max-len */
// ============================================================
// DESIGN SYSTEM — Dark Industrial / Precision Tool Aesthetic
// ============================================================
// ============================================================
// SHARED UI COMPONENTS
// ============================================================
import { useCallback, useRef, useState } from 'react';

export const DS = {
  bg: '#0a0a0b',
  surface: '#111113',
  surfaceHigh: '#1a1a1e',
  border: '#2a2a30',
  borderLight: '#3a3a42',
  accent: '#e8ff47',
  accentDim: '#b8cc30',
  text: '#e8e8ec',
  textMuted: '#7a7a88',
  textDim: '#4a4a55',
  red: '#ff4444',
  green: '#44ff88',
  blue: '#4488ff',
  orange: '#ff8844',
};

const css = String.raw;

export const GLOBAL_STYLE = css`
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${DS.bg};
    color: ${DS.text};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: ${DS.surface};
  }
  ::-webkit-scrollbar-thumb {
    background: ${DS.border};
    border-radius: 3px;
  }

  .mono {
    font-family: 'Space Mono', monospace;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(232, 255, 71, 0.3);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(232, 255, 71, 0);
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  @keyframes scanline {
    0% {
      top: -10%;
    }
    100% {
      top: 110%;
    }
  }

  .tool-card {
    animation: fadeUp 0.4s ease both;
  }
  .tool-card:nth-child(1) {
    animation-delay: 0.05s;
  }
  .tool-card:nth-child(2) {
    animation-delay: 0.1s;
  }
  .tool-card:nth-child(3) {
    animation-delay: 0.15s;
  }
  .tool-card:nth-child(4) {
    animation-delay: 0.2s;
  }
  .tool-card:nth-child(5) {
    animation-delay: 0.25s;
  }
  .tool-card:nth-child(6) {
    animation-delay: 0.3s;
  }

  input[type='range'] {
    -webkit-appearance: none;
    width: 100%;
    height: 3px;
    background: ${DS.border};
    border-radius: 2px;
    outline: none;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${DS.accent};
    cursor: pointer;
    box-shadow: 0 0 8px rgba(232, 255, 71, 0.5);
  }
`;

// ============================================================
// ICONS (inline SVG paths)
// ============================================================
export const ICONS = {
  image: ['M21 15l-5-5L5 21', 'M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z'],
  pdf: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  merge: 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3',
  compress: 'M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3',
  ocr: 'M3 7V5a2 2 0 012-2h2 M17 3h2a2 2 0 012 2v2 M21 17v2a2 2 0 01-2 2h-2 M7 21H5a2 2 0 01-2-2v-2 M8 8h8 M8 12h6 M8 16h4',
  resize: 'M21 21l-6-6m6 6v-4m0 4h-4 M3 3l6 6M3 3v4m0-4h4',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  x: 'M18 6L6 18 M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  arrow: 'M19 12H5 M12 5l7 7-7 7',
  plus: 'M12 5v14 M5 12h14',
  lock: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M17 11V7a5 5 0 00-10 0v4',
};

export function Icon({ d, size = 18, color = 'currentColor', strokeWidth = 1.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
  );
}

export function Badge({ children, color = DS.accent }) {
  return (
    <span
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        color: DS.bg,
        background: color,
        padding: '2px 7px',
        borderRadius: 3,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

export function Btn({ children, onClick, variant = 'primary', disabled, style = {}, icon }) {
  const [hover, setHover] = useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    border: 'none',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    transition: 'all 0.15s ease',
    opacity: disabled ? 0.4 : 1,
  };
  const variants = {
    primary: {
      background: hover ? DS.accentDim : DS.accent,
      color: DS.bg,
      transform: hover && !disabled ? 'translateY(-1px)' : 'none',
      boxShadow: hover ? `0 4px 20px rgba(232,255,71,0.3)` : 'none',
    },
    ghost: {
      background: hover ? DS.surfaceHigh : 'transparent',
      color: DS.text,
      border: `1px solid ${hover ? DS.borderLight : DS.border}`,
    },
    danger: {
      background: hover ? '#cc3333' : '#ff444422',
      color: DS.red,
      border: `1px solid ${DS.red}44`,
    },
  };
  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon && <Icon d={icon} size={14} />}
      {children}
    </button>
  );
}

export function ProgressBar({ value }) {
  return (
    <div style={{ background: DS.border, borderRadius: 2, height: 3, overflow: 'hidden' }}>
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${DS.accent}, ${DS.accentDim})`,
          transition: 'width 0.3s ease',
          boxShadow: `0 0 10px ${DS.accent}66`,
        }}
      />
    </div>
  );
}

export function Dropzone({ onFiles, accept, multiple = false, children, height = 160 }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(multiple ? files : [files[0]]);
    },
    [onFiles, multiple]
  );

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      style={{
        height,
        border: `2px dashed ${drag ? DS.accent : DS.border}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: drag ? `${DS.accent}08` : DS.surface,
        color: drag ? DS.accent : DS.textMuted,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => onFiles(Array.from(e.target.files))}
      />
      {children}
    </div>
  );
}

export function ToolPanel({ title, badge, badgeColor, icon, iconColor, children, onClose }) {
  return (
    <div
      style={{
        background: DS.surface,
        border: `1px solid ${DS.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${DS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${iconColor}18`,
              border: `1px solid ${iconColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon d={icon} size={15} color={iconColor} />
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700 }}>{title}</span>
          {badge && <Badge color={badgeColor || DS.accent}>{badge}</Badge>}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted, padding: 4 }}
        >
          <Icon d={ICONS.x} size={16} />
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
