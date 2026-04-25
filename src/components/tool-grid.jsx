/* eslint-disable max-len */
import { useState } from 'react';
import { Badge, DS, Icon, ICONS } from './design-system';

// ============================================================
// TOOL DEFINITIONS
// ============================================================
export const TOOLS = [
  {
    id: 'image-editor',
    title: 'Image Editor',
    desc: 'Crop, rotate, and apply filters',
    badge: 'POPULAR',
    badgeColor: DS.blue,
    icon: ICONS.image,
    color: DS.blue,
  },
  {
    id: 'images-to-pdf',
    title: 'Images → PDF',
    desc: 'Batch convert images to PDF',
    badge: 'EASY',
    badgeColor: DS.green,
    icon: ICONS.pdf,
    color: DS.green,
  },
  {
    id: 'pdf-merge',
    title: 'PDF Merger',
    desc: 'Combine multiple PDFs into one',
    badge: 'PDF-LIB',
    badgeColor: DS.orange,
    icon: ICONS.merge,
    color: DS.orange,
  },
  {
    id: 'pdf-compress',
    title: 'PDF Compressor',
    desc: 'Reduce PDF file size',
    badge: 'BETA',
    badgeColor: DS.accent,
    icon: ICONS.compress,
    color: DS.accent,
  },
  {
    id: 'ocr-scanner',
    title: 'OCR Scanner',
    desc: 'Extract text from images',
    badge: 'AI',
    badgeColor: DS.blue,
    icon: ICONS.ocr,
    color: DS.blue,
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    desc: 'Resize & export for social media',
    badge: 'PRESETS',
    badgeColor: DS.orange,
    icon: ICONS.resize,
    color: DS.orange,
  },
];

// ============================================================
// TOOL CARD
// ============================================================
export function ToolCard({ tool, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="tool-card"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? DS.surfaceHigh : DS.surface,
        border: `1px solid ${hover ? `${tool.color}55` : DS.border}`,
        borderRadius: 12,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? `0 8px 30px ${tool.color}15` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `${tool.color}18`,
            border: `1px solid ${tool.color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: hover ? `0 0 20px ${tool.color}33` : 'none',
          }}
        >
          <Icon d={tool.icon} size={18} color={tool.color} />
        </div>
        <Badge color={tool.badgeColor}>{tool.badge}</Badge>
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{tool.title}</div>
      <div style={{ fontSize: 13, color: DS.textMuted, lineHeight: 1.5 }}>{tool.desc}</div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 14,
          color: hover ? tool.color : DS.textDim,
          fontSize: 12,
          transition: 'color 0.2s',
        }}
      >
        <span style={{ fontFamily: "'Space Mono', monospace" }}>Open tool</span>
        <Icon d={ICONS.arrow} size={12} />
      </div>
    </div>
  );
}

// ============================================================
// TOOL GRID (home screen)
// ============================================================
export function ToolGrid({ onSelect }) {
  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: 48, animation: 'fadeUp 0.5s ease' }}>
        <div style={{ marginBottom: 10 }}>
          <Badge>ALL PROCESSING IS LOCAL — FILES NEVER LEAVE YOUR BROWSER</Badge>
        </div>
        <h1
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            lineHeight: 1.15,
            marginTop: 16,
            marginBottom: 14,
            background: `linear-gradient(135deg, ${DS.text} 0%, ${DS.textMuted} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          File Processing,
          <br />
          No Uploads Required.
        </h1>
        <p style={{ color: DS.textMuted, fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
          A complete suite of browser-native tools for PDFs and images. Zero servers. Zero tracking. Everything runs directly in
          your browser.
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onClick={() => onSelect(tool.id)} />
        ))}
      </div>

      {/* Footer info */}
      <div
        style={{
          marginTop: 48,
          padding: '24px',
          borderRadius: 12,
          background: DS.surface,
          border: `1px solid ${DS.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }}
      >
        {[
          {
            label: 'Privacy',
            icon: ICONS.lock,
            color: DS.green,
            desc: 'Files processed locally in your browser. Nothing is uploaded or stored.',
          },
          {
            label: 'Speed',
            icon: ICONS.compress,
            color: DS.accent,
            desc: 'No round-trips to servers. Processing happens at native browser speed.',
          },
          {
            label: 'Free',
            icon: ICONS.check,
            color: DS.blue,
            desc: 'All tools are completely free with no limits, ads, or watermarks.',
          },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `${item.color}15`,
                border: `1px solid ${item.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon d={item.icon} size={15} color={item.color} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: DS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
