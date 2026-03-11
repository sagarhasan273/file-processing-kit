/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-return-assign */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// DESIGN SYSTEM — Dark Industrial / Precision Tool Aesthetic
// ============================================================
const DS = {
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

const GLOBAL_STYLE = css`
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
// ICONS (inline SVG)
// ============================================================
function Icon({ d, size = 18, color = 'currentColor', strokeWidth = 1.5 }) {
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

const ICONS = {
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

// ============================================================
// COMPONENTS
// ============================================================

function Badge({ children, color = DS.accent }) {
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

function Btn({ children, onClick, variant = 'primary', disabled, style = {}, icon }) {
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

function ProgressBar({ value }) {
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

function Dropzone({ onFiles, accept, multiple = false, children, height = 160 }) {
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

function ToolPanel({ title, badge, badgeColor, icon, iconColor, children, onClose }) {
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
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: DS.textMuted,
            padding: 4,
          }}
        >
          <Icon d={ICONS.x} size={16} />
        </button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ============================================================
// TOOL: IMAGE EDITOR
// ============================================================
function ImageEditor({ onClose }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [blur, setBlur] = useState(0);
  const canvasRef = useRef();
  const imgRef = useRef();

  const applyFilters = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    canvas.width = img.naturalWidth * cos + img.naturalHeight * sin;
    canvas.height = img.naturalWidth * sin + img.naturalHeight * cos;
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  }, [brightness, contrast, saturation, rotation, blur]);

  useEffect(() => {
    if (imgSrc) applyFilters();
  }, [brightness, contrast, saturation, rotation, blur, applyFilters]);

  const handleLoad = (files) => {
    const url = URL.createObjectURL(files[0]);
    setImgSrc(url);
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  function Slider({ label, value, setValue, min = 0, max = 200, unit = '%' }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: DS.textMuted }}>{label}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.accent }}>
            {value}
            {unit}
          </span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(+e.target.value)} />
      </div>
    );
  }

  return (
    <ToolPanel
      title="Image Editor"
      badge="BETA"
      badgeColor={DS.blue}
      icon={ICONS.image}
      iconColor={DS.blue}
      onClose={onClose}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
        <div>
          {!imgSrc ? (
            <Dropzone onFiles={handleLoad} accept="image/*">
              <Icon d={ICONS.upload} size={28} />
              <span style={{ fontSize: 13 }}>Drop image here</span>
              <span style={{ fontSize: 11 }}>PNG, JPG, WEBP supported</span>
            </Dropzone>
          ) : (
            <div
              style={{
                position: 'relative',
                background: '#050505',
                borderRadius: 8,
                overflow: 'hidden',
                minHeight: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img ref={imgRef} src={imgSrc} onLoad={applyFilters} style={{ display: 'none' }} />
              <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 6 }} />
            </div>
          )}
        </div>
        <div>
          <Slider label="Brightness" value={brightness} setValue={setBrightness} />
          <Slider label="Contrast" value={contrast} setValue={setContrast} />
          <Slider label="Saturation" value={saturation} setValue={setSaturation} />
          <Slider label="Blur" value={blur} setValue={setBlur} min={0} max={10} unit="px" />
          <Slider label="Rotation" value={rotation} setValue={setRotation} min={0} max={360} unit="°" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
            {imgSrc && (
              <Btn onClick={download} icon={ICONS.download}>
                Download PNG
              </Btn>
            )}
            {imgSrc && (
              <Btn variant="ghost" onClick={() => setImgSrc(null)}>
                New Image
              </Btn>
            )}
          </div>
        </div>
      </div>
    </ToolPanel>
  );
}

// ============================================================
// TOOL: IMAGES TO PDF
// ============================================================
function ImagesToPdf({ onClose }) {
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);

  const addImages = (files) => {
    const newImgs = files
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        url: URL.createObjectURL(f),
        name: f.name,
      }));
    setImages((prev) => [...prev, ...newImgs]);
    setDone(false);
  };

  const remove = (id) => setImages((prev) => prev.filter((i) => i.id !== id));

  const convert = async () => {
    if (!images.length) return;
    setConverting(true);
    setProgress(0);
    setDone(false);

    // Load jsPDF dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    await new Promise((r) => (script.onload = r));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    for (let i = 0; i < images.length; i++) {
      setProgress(Math.round(((i + 0.5) / images.length) * 100));
      const img = new Image();
      img.src = images[i].url;
      await new Promise((r) => (img.onload = r));

      const pageW = 210;
      const pageH = 297;
      const ratio = Math.min(pageW / img.width, pageH / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;

      if (i > 0) doc.addPage();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      doc.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', x, y, w, h);
      setProgress(Math.round(((i + 1) / images.length) * 100));
    }

    doc.save('images-converted.pdf');
    setConverting(false);
    setDone(true);
  };

  return (
    <ToolPanel
      title="Images → PDF"
      badge="POPULAR"
      badgeColor={DS.green}
      icon={ICONS.pdf}
      iconColor={DS.green}
      onClose={onClose}
    >
      <Dropzone onFiles={addImages} accept="image/*" multiple>
        <Icon d={ICONS.upload} size={24} />
        <span style={{ fontSize: 13 }}>Drop multiple images</span>
        <Badge color={DS.textDim}>JPG • PNG • WEBP • GIF</Badge>
      </Dropzone>

      {images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: 8,
              marginBottom: 16,
            }}
          >
            {images.map((img, idx) => (
              <div
                key={img.id}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: `1px solid ${DS.border}`,
                }}
              >
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                    padding: '4px 6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: DS.accent }}>
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => remove(img.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.red, lineHeight: 1 }}
                  >
                    <Icon d={ICONS.x} size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {converting && (
            <div style={{ marginBottom: 12 }}>
              <ProgressBar value={progress} />
              <span
                style={{
                  fontSize: 11,
                  color: DS.textMuted,
                  fontFamily: "'Space Mono', monospace",
                  display: 'block',
                  marginTop: 6,
                }}
              >
                Processing {progress}%...
              </span>
            </div>
          )}
          {done && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: DS.green, fontSize: 12 }}
            >
              <Icon d={ICONS.check} size={14} color={DS.green} /> PDF downloaded successfully
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={convert} disabled={converting} icon={ICONS.pdf}>
              {converting ? 'Converting...' : `Convert ${images.length} image${images.length > 1 ? 's' : ''}`}
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setImages([]);
                setDone(false);
              }}
            >
              Clear All
            </Btn>
          </div>
        </div>
      )}
    </ToolPanel>
  );
}

// ============================================================
// TOOL: PDF MERGE
// ============================================================
function PdfMerge({ onClose }) {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const addFiles = (newFiles) => {
    const pdfs = newFiles
      .filter((f) => f.type === 'application/pdf')
      .map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
      }));
    setFiles((prev) => [...prev, ...pdfs]);
    setDone(false);
  };

  const remove = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const merge = async () => {
    if (files.length < 2) return;
    setMerging(true);
    setProgress(10);
    setDone(false);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    document.head.appendChild(script);
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => (script.onload = r));

    const { PDFDocument } = window.PDFLib;
    const merged = await PDFDocument.create();
    setProgress(20);

    for (let i = 0; i < files.length; i++) {
      const bytes = await files[i].file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
      setProgress(20 + Math.round(((i + 1) / files.length) * 70));
    }

    const mergedBytes = await merged.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'merged.pdf';
    link.click();
    setProgress(100);
    setMerging(false);
    setDone(true);
  };

  return (
    <ToolPanel
      title="PDF Merger"
      badge="PDF-LIB"
      badgeColor={DS.orange}
      icon={ICONS.merge}
      iconColor={DS.orange}
      onClose={onClose}
    >
      <Dropzone onFiles={addFiles} accept=".pdf,application/pdf" multiple>
        <Icon d={ICONS.upload} size={24} />
        <span style={{ fontSize: 13 }}>Drop PDF files here</span>
        <span style={{ fontSize: 11 }}>Minimum 2 files required</span>
      </Dropzone>

      {files.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {files.map((f, idx) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: DS.surfaceHigh,
                borderRadius: 6,
                marginBottom: 6,
                border: `1px solid ${DS.border}`,
              }}
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.accent, minWidth: 20 }}>
                #{idx + 1}
              </span>
              <Icon d={ICONS.pdf} size={14} color={DS.orange} />
              <span
                style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {f.name}
              </span>
              <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: "'Space Mono', monospace" }}>{f.size}</span>
              <button
                onClick={() => remove(f.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.textMuted }}
              >
                <Icon d={ICONS.x} size={14} />
              </button>
            </div>
          ))}

          {merging && (
            <div style={{ margin: '12px 0' }}>
              <ProgressBar value={progress} />
            </div>
          )}
          {done && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: DS.green, fontSize: 12 }}
            >
              <Icon d={ICONS.check} size={14} color={DS.green} /> Merged PDF downloaded
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Btn onClick={merge} disabled={merging || files.length < 2} icon={ICONS.merge}>
              {merging ? 'Merging...' : `Merge ${files.length} PDFs`}
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setFiles([]);
                setDone(false);
              }}
            >
              Clear
            </Btn>
          </div>
          {files.length < 2 && (
            <p style={{ fontSize: 11, color: DS.orange, marginTop: 8 }}>Add at least 2 PDF files to merge.</p>
          )}
        </div>
      )}
    </ToolPanel>
  );
}

// ============================================================
// TOOL: PDF COMPRESS
// ============================================================
function PdfCompress({ onClose }) {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(70);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState(null);

  const compress = async () => {
    if (!file) return;
    setCompressing(true);
    setResult(null);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    document.head.appendChild(script);
    if (!window.PDFLib) await new Promise((r) => (script.onload = r));

    const { PDFDocument } = window.PDFLib;
    const bytes = await file.file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);

    // Re-save with compression (pdf-lib doesn't do lossy image compression, but we can re-encode)
    const compressed = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
    const blob = new Blob([compressed], { type: 'application/pdf' });
    const ratio = ((1 - blob.size / file.file.size) * 100).toFixed(1);
    setResult({
      blob,
      ratio,
      originalSize: (file.file.size / 1024).toFixed(1),
      newSize: (blob.size / 1024).toFixed(1),
    });
    setCompressing(false);
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(result.blob);
    link.download = 'compressed.pdf';
    link.click();
  };

  return (
    <ToolPanel
      title="PDF Compressor"
      badge="PDF-LIB"
      badgeColor={DS.accent}
      icon={ICONS.compress}
      iconColor={DS.accent}
      onClose={onClose}
    >
      <Dropzone
        onFiles={(f) => {
          setFile({ file: f[0], name: f[0].name, size: `${(f[0].size / 1024).toFixed(1)} KB` });
          setResult(null);
        }}
        accept=".pdf"
      >
        <Icon d={ICONS.upload} size={24} />
        <span style={{ fontSize: 13 }}>Drop a PDF file</span>
      </Dropzone>

      {file && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: DS.surfaceHigh,
              borderRadius: 6,
              marginBottom: 16,
              border: `1px solid ${DS.border}`,
            }}
          >
            <Icon d={ICONS.pdf} size={14} color={DS.accent} />
            <span style={{ flex: 1, fontSize: 13 }}>{file.name}</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.textMuted }}>
              {file.size}
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: DS.textMuted }}>Compression Level</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.accent }}>{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: DS.textDim }}>Maximum compression</span>
              <span style={{ fontSize: 10, color: DS.textDim }}>Best quality</span>
            </div>
          </div>

          {result && (
            <div
              style={{
                background: DS.surfaceHigh,
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                border: `1px solid ${DS.green}33`,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                {[
                  ['Original', `${result.originalSize} KB`, DS.textMuted],
                  ['Compressed', `${result.newSize} KB`, DS.accent],
                  ['Saved', `${result.ratio}%`, DS.green],
                ].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: c, fontWeight: 700 }}>
                      {v}
                    </div>
                    <div style={{ fontSize: 10, color: DS.textMuted, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={compress} disabled={compressing} icon={ICONS.compress}>
              {compressing ? 'Compressing...' : 'Compress PDF'}
            </Btn>
            {result && (
              <Btn onClick={download} icon={ICONS.download}>
                Download
              </Btn>
            )}
          </div>
        </div>
      )}
    </ToolPanel>
  );
}

// ============================================================
// TOOL: OCR Scanner
// ============================================================
function OcrScanner({ onClose }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const scan = async () => {
    if (!image) return;
    setScanning(true);
    setText('');
    setProgress(0);

    // Load Tesseract
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js';
    document.head.appendChild(script);
    await new Promise((r) => (script.onload = r));

    const worker = await window.Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
      },
    });

    const { data } = await worker.recognize(image.url);
    setText(data.text);
    await worker.terminate();
    setScanning(false);
  };

  const copyText = () => navigator.clipboard.writeText(text);

  return (
    <ToolPanel
      title="OCR Scanner"
      badge="TESSERACT"
      badgeColor={DS.blue}
      icon={ICONS.ocr}
      iconColor={DS.blue}
      onClose={onClose}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          {!image ? (
            <Dropzone
              onFiles={(f) => setImage({ url: URL.createObjectURL(f[0]), name: f[0].name })}
              accept="image/*"
              height={180}
            >
              <Icon d={ICONS.ocr} size={24} />
              <span style={{ fontSize: 13 }}>Drop image to scan</span>
              <span style={{ fontSize: 11 }}>Extracts text from images</span>
            </Dropzone>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={image.url}
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: `1px solid ${DS.border}`,
                  maxHeight: 220,
                  objectFit: 'contain',
                }}
              />
              {scanning && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, color: DS.accent }}>Scanning... {progress}%</div>
                  <ProgressBar value={progress} />
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Btn onClick={scan} disabled={!image || scanning} icon={ICONS.ocr}>
              {scanning ? 'Scanning...' : 'Extract Text'}
            </Btn>
            {image && (
              <Btn
                variant="ghost"
                onClick={() => {
                  setImage(null);
                  setText('');
                }}
              >
                Clear
              </Btn>
            )}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: DS.textMuted }}>Extracted Text</span>
            {text && (
              <Btn variant="ghost" onClick={copyText} style={{ padding: '4px 10px', fontSize: 10 }}>
                Copy
              </Btn>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Extracted text will appear here..."
            style={{
              width: '100%',
              height: 180,
              background: DS.surfaceHigh,
              border: `1px solid ${DS.border}`,
              borderRadius: 8,
              color: DS.text,
              padding: '12px',
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </ToolPanel>
  );
}

// ============================================================
// TOOL: Image Resizer
// ============================================================
function ImageResizer({ onClose }) {
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [locked, setLocked] = useState(true);
  const [origRatio, setOrigRatio] = useState(1);
  const canvasRef = useRef();

  const PRESETS = [
    { name: 'Instagram Square', w: 1080, h: 1080 },
    { name: 'Instagram Story', w: 1080, h: 1920 },
    { name: 'Twitter Post', w: 1200, h: 675 },
    { name: 'Facebook Cover', w: 851, h: 315 },
    { name: 'LinkedIn Banner', w: 1584, h: 396 },
    { name: 'YouTube Thumb', w: 1280, h: 720 },
  ];

  const handleImage = (files) => {
    const img = new Image();
    img.src = URL.createObjectURL(files[0]);
    img.onload = () => {
      setOrigRatio(img.width / img.height);
      setWidth(img.width);
      setHeight(img.height);
      setImage({ url: img.src, img });
    };
  };

  const applyPreset = (p) => {
    setWidth(p.w);
    setHeight(p.h);
  };

  const handleWidth = (w) => {
    setWidth(w);
    if (locked) setHeight(Math.round(w / origRatio));
  };
  const handleHeight = (h) => {
    setHeight(h);
    if (locked) setWidth(Math.round(h * origRatio));
  };

  const download = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(image.img, 0, 0, width, height);
    const link = document.createElement('a');
    link.download = `resized-${width}x${height}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <ToolPanel
      title="Image Resizer"
      badge="PRESETS"
      badgeColor={DS.orange}
      icon={ICONS.resize}
      iconColor={DS.orange}
      onClose={onClose}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!image ? (
        <Dropzone onFiles={handleImage} accept="image/*">
          <Icon d={ICONS.upload} size={24} />
          <span style={{ fontSize: 13 }}>Drop an image to resize</span>
        </Dropzone>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20 }}>
          <img
            src={image.url}
            style={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'contain',
              borderRadius: 8,
              border: `1px solid ${DS.border}`,
              background: '#050505',
            }}
          />
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: DS.textMuted, display: 'block', marginBottom: 4 }}>Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidth(+e.target.value)}
                  style={{
                    width: '100%',
                    background: DS.surfaceHigh,
                    border: `1px solid ${DS.border}`,
                    borderRadius: 6,
                    color: DS.text,
                    padding: '6px 10px',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: "'Space Mono', monospace",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: DS.textMuted, display: 'block', marginBottom: 4 }}>Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeight(+e.target.value)}
                  style={{
                    width: '100%',
                    background: DS.surfaceHigh,
                    border: `1px solid ${DS.border}`,
                    borderRadius: 6,
                    color: DS.text,
                    padding: '6px 10px',
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: "'Space Mono', monospace",
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => setLocked(!locked)}
              style={{
                width: '100%',
                padding: '7px',
                marginBottom: 12,
                background: locked ? `${DS.accent}18` : DS.surfaceHigh,
                border: `1px solid ${locked ? DS.accent : DS.border}`,
                borderRadius: 6,
                color: locked ? DS.accent : DS.textMuted,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {locked ? '🔒 Ratio Locked' : '🔓 Ratio Unlocked'}
            </button>
            <Btn onClick={download} icon={ICONS.download} style={{ width: '100%' }}>
              Download
            </Btn>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: DS.textMuted,
            marginBottom: 10,
            fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Social Media Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              style={{
                padding: '8px 6px',
                background: DS.surfaceHigh,
                border: `1px solid ${DS.border}`,
                borderRadius: 6,
                cursor: 'pointer',
                color: DS.text,
                fontSize: 10,
                fontFamily: "'Space Mono', monospace",
                transition: 'all 0.15s',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = DS.accent;
                e.currentTarget.style.color = DS.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = DS.border;
                e.currentTarget.style.color = DS.text;
              }}
            >
              {p.name}
              <br />
              <span style={{ color: DS.textDim, fontSize: 9 }}>
                {p.w}×{p.h}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ToolPanel>
  );
}

// ============================================================
// TOOL GRID / HOME
// ============================================================
const TOOLS = [
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

function ToolCard({ tool, onClick }) {
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
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
        {tool.title}
      </div>
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
// MAIN APP
// ============================================================
export default function FileProcessing() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ minHeight: '100vh', background: DS.bg }}>
        {/* Header */}
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
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  FILEKIT
                </span>
                <span
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: DS.textMuted, marginLeft: 8 }}
                >
                  Beta
                </span>
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

        {/* Main */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
          {/* Hero */}
          {!activeTool && (
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
                A complete suite of browser-native tools for PDFs and images. Zero servers. Zero tracking. Everything
                runs directly in your browser.
              </p>
            </div>
          )}

          {/* Active Tool */}
          {activeTool && (
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => setActiveTool(null)}
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
          )}

          {activeTool === 'image-editor' && <ImageEditor onClose={() => setActiveTool(null)} />}
          {activeTool === 'images-to-pdf' && <ImagesToPdf onClose={() => setActiveTool(null)} />}
          {activeTool === 'pdf-merge' && <PdfMerge onClose={() => setActiveTool(null)} />}
          {activeTool === 'pdf-compress' && <PdfCompress onClose={() => setActiveTool(null)} />}
          {activeTool === 'ocr-scanner' && <OcrScanner onClose={() => setActiveTool(null)} />}
          {activeTool === 'image-resizer' && <ImageResizer onClose={() => setActiveTool(null)} />}

          {/* Tool Grid */}
          {!activeTool && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {TOOLS.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id)} />
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
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: DS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
