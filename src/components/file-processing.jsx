/* eslint-disable max-len */
import { useState } from 'react';
import { ImagesToPdf, OcrScanner } from './conversion-tools';
import { DS, GLOBAL_STYLE, Icon, ICONS } from './design-system';
import { ImageEditor, ImageResizer } from './image-tools';
import { PdfCompress, PdfMerge } from './pdf-tools';
import { ToolGrid } from './tool-grid';

// ============================================================
// HEADER
// ============================================================
function Header() {
  return (
    <header
      style={{
        borderBottom: `1px solid ${DS.border}`,
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: `${DS.bg}ee`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: DS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill={DS.bg} />
              <rect x="9" y="1" width="6" height="6" rx="1" fill={DS.bg} />
              <rect x="1" y="9" width="6" height="6" rx="1" fill={DS.bg} />
              <rect x="9" y="9" width="6" height="6" rx="1" fill={DS.bg} opacity="0.4" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}>
              FILEKIT
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: DS.textMuted, marginLeft: 8 }}>Beta</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: DS.green }}>
            <Icon d={ICONS.lock} size={12} color={DS.green} />
            <span>Local Processing</span>
          </div>
          <div style={{ width: 1, height: 20, background: DS.border }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.textMuted }}>6 TOOLS</span>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// BACK BUTTON
// ============================================================
function BackButton({ onClick }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: DS.textMuted,
          fontSize: 13,
          padding: 0,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        BACK TO TOOLS
      </button>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function FileProcessing() {
  const [activeTool, setActiveTool] = useState(null);
  const close = () => setActiveTool(null);

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ minHeight: '100vh', background: DS.bg }}>
        <Header />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
          {activeTool && <BackButton onClick={close} />}

          {activeTool === 'image-editor' && <ImageEditor onClose={close} />}
          {activeTool === 'images-to-pdf' && <ImagesToPdf onClose={close} />}
          {activeTool === 'pdf-merge' && <PdfMerge onClose={close} />}
          {activeTool === 'pdf-compress' && <PdfCompress onClose={close} />}
          {activeTool === 'ocr-scanner' && <OcrScanner onClose={close} />}
          {activeTool === 'image-resizer' && <ImageResizer onClose={close} />}

          {!activeTool && <ToolGrid onSelect={setActiveTool} />}
        </main>
      </div>
    </>
  );
}
