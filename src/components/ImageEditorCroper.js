/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const TO_RADIANS = Math.PI / 180;
const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '9:16', value: 9 / 16 },
];

// ─── useDebounceEffect ────────────────────────────────────────────────────────
function useDebounceEffect(fn, waitTime, deps) {
  useEffect(() => {
    const t = setTimeout(() => fn(...deps), waitTime);
    return () => clearTimeout(t);
  }, deps);
}

// ─── canvasPreview ────────────────────────────────────────────────────────────
async function canvasPreview(image, canvas, crop, scale = 1, rotate = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const rotateRads = rotate * TO_RADIANS;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
  ctx.restore();
}

// ─── Crop Overlay Component ───────────────────────────────────────────────────
function CropOverlay({ imgRef, crop, setCrop, setCompletedCrop, aspect }) {
  const dragging = useRef(null);
  const overlayRef = useRef(null);

  const getRelPos = (e, el) => {
    const r = el.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: (cx / r.width) * 100, y: (cy / r.height) * 100 };
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const onPointerDown = useCallback(
    (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = getRelPos(e, overlayRef.current);
      dragging.current = { type, startPos: pos, startCrop: crop ? { ...crop } : null };
    },
    [crop]
  );

  const onOverlayDown = useCallback((e) => {
    if (e.target !== overlayRef.current) return;
    const pos = getRelPos(e, overlayRef.current);
    dragging.current = { type: 'new', startPos: pos };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !overlayRef.current) return;
      const pos = getRelPos(e, overlayRef.current);
      const { type, startPos, startCrop } = dragging.current;

      if (type === 'new') {
        let x = Math.min(startPos.x, pos.x);
        let y = Math.min(startPos.y, pos.y);
        const w = Math.abs(pos.x - startPos.x);
        let h = Math.abs(pos.y - startPos.y);
        if (aspect) h = w / aspect;
        x = clamp(x, 0, 100 - w);
        y = clamp(y, 0, 100 - h);
        setCrop({ x, y, width: w, height: h, unit: '%' });
      } else if (type === 'move' && startCrop) {
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        const nx = clamp(startCrop.x + dx, 0, 100 - startCrop.width);
        const ny = clamp(startCrop.y + dy, 0, 100 - startCrop.height);
        setCrop({ ...startCrop, x: nx, y: ny });
      } else if (startCrop) {
        let { x, y, width: w, height: h } = startCrop;
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        if (type === 'se') {
          w = clamp(w + dx, 5, 100 - x);
          h = aspect ? w / aspect : clamp(h + dy, 5, 100 - y);
        } else if (type === 'sw') {
          const nw = clamp(w - dx, 5, x + w);
          const nx = x + (w - nw);
          w = nw;
          x = nx;
          h = aspect ? w / aspect : clamp(h + dy, 5, 100 - y);
        } else if (type === 'ne') {
          w = clamp(w + dx, 5, 100 - x);
          const nh = aspect ? w / aspect : clamp(h - dy, 5, y + h);
          const ny = y + (h - nh);
          h = nh;
          y = ny;
        } else if (type === 'nw') {
          const nw = clamp(w - dx, 5, x + w);
          const nx = x + (w - nw);
          const nh = aspect ? nw / aspect : clamp(h - dy, 5, y + h);
          const ny = y + (h - nh);
          w = nw;
          x = nx;
          h = nh;
          y = ny;
        }
        setCrop({ x, y, width: w, height: h, unit: '%' });
      }
    };
    const onUp = () => {
      if (dragging.current && crop) {
        const img = imgRef.current;
        if (img) {
          setCompletedCrop({
            x: (crop.x / 100) * img.width,
            y: (crop.y / 100) * img.height,
            width: (crop.width / 100) * img.width,
            height: (crop.height / 100) * img.height,
            unit: 'px',
          });
        }
      }
      dragging.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [crop, aspect]);

  const handles = crop
    ? [
        { type: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
        { type: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
        { type: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
        { type: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
      ]
    : [];

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayDown}
      onTouchStart={onOverlayDown}
      style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}
    >
      {crop && crop.width > 0 && (
        <>
          {/* Dark mask */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
          {/* Crop box cutout */}
          <div
            onMouseDown={(e) => onPointerDown(e, 'move')}
            onTouchStart={(e) => onPointerDown(e, 'move')}
            style={{
              position: 'absolute',
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              border: '1.5px solid rgba(255,255,255,0.85)',
              cursor: 'move',
              boxSizing: 'border-box',
            }}
          >
            {/* Rule of thirds */}
            {[33.3, 66.6].map((p) => (
              <div
                key={`v${p}`}
                style={{
                  position: 'absolute',
                  left: `${p}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: '1px solid rgba(255,255,255,0.25)',
                  pointerEvents: 'none',
                }}
              />
            ))}
            {[33.3, 66.6].map((p) => (
              <div
                key={`h${p}`}
                style={{
                  position: 'absolute',
                  top: `${p}%`,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid rgba(255,255,255,0.25)',
                  pointerEvents: 'none',
                }}
              />
            ))}
            {handles.map(({ type, style }) => (
              <div
                key={type}
                onMouseDown={(e) => onPointerDown(e, type)}
                onTouchStart={(e) => onPointerDown(e, type)}
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  background: '#fff',
                  border: '2px solid #0ea5e9',
                  borderRadius: 2,
                  zIndex: 10,
                  ...style,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ImageEditor() {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgName, setImgName] = useState('');
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(null);
  const [containerH, setContainerH] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragging, setDragging] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return showToast('Please upload a valid image file.', 'error');
    setImgName(file.name);
    setCrop(null);
    setCompletedCrop(null);
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
  };

  const onSelectFile = (e) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  };

  // ── Image load ──────────────────────────────────────────────────────────────
  const onImageLoad = () => {
    if (aspect && imgRef.current) {
      const { width, height } = imgRef.current;
      const w = 80;
      const h = w / aspect;
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const newCrop = { x, y, width: w, height: h, unit: '%' };
      setCrop(newCrop);
      setCompletedCrop({
        x: (x / 100) * width,
        y: (y / 100) * height,
        width: (w / 100) * width,
        height: (h / 100) * height,
        unit: 'px',
      });
    }
  };

  // ── Preview ────────────────────────────────────────────────────────────────
  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  // ── Download ───────────────────────────────────────────────────────────────
  const onDownload = async () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    if (!image || !canvas || !completedCrop) return showToast('Please make a crop selection first.', 'error');
    setIsProcessing(true);
    try {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, offscreen.width, offscreen.height);
      const blob = await offscreen.convertToBlob({ type: 'image/png', quality: 0.95 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Image downloaded!');
    } catch (err) {
      showToast('Download failed.', 'error');
    }
    setIsProcessing(false);
  };

  // ── Controls ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setAspect(null);
    setCrop(null);
    setCompletedCrop(null);
    setContainerH(420);
  };
  const handleClear = () => {
    setImgSrc(null);
    setImgName('');
    handleReset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleAspect = (val) => {
    setAspect(val);
    if (val && imgRef.current) {
      const { width, height } = imgRef.current;
      const w = 80;
      const h = w / val;
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const newCrop = { x, y, width: w, height: h, unit: '%' };
      setCrop(newCrop);
      setCompletedCrop({
        x: (x / 100) * width,
        y: (y / 100) * height,
        width: (w / 100) * width,
        height: (h / 100) * height,
        unit: 'px',
      });
    } else {
      setCrop(null);
      setCompletedCrop(null);
    }
  };

  // ── Container resize ───────────────────────────────────────────────────────
  const onResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      const startY = e.clientY || e.touches?.[0]?.clientY;
      const startH = containerH;
      const onMove = (ev) => {
        const curY = ev.clientY || ev.touches?.[0]?.clientY;
        setContainerH(Math.max(220, Math.min(820, startH + (curY - startY))));
      };
      const onUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [containerH]
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  const hasImage = !!imgSrc;
  const hasCrop = !!(completedCrop?.width && completedCrop?.height);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: '#e2e8f0',
        padding: '24px 16px',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        .ctrl-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #e2e8f0; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: 13px; font-family: inherit; font-weight: 500; transition: all .15s; display: flex; align-items: center; gap: 6px; }
        .ctrl-btn:hover:not(:disabled) { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); }
        .ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }
        .ctrl-btn.active { background: rgba(14,165,233,0.25); border-color: #0ea5e9; color: #38bdf8; }
        .ctrl-btn.danger { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
        .ctrl-btn.danger:hover:not(:disabled) { background: rgba(239,68,68,0.25); }
        .ctrl-btn.primary { background: linear-gradient(135deg, #0ea5e9, #6366f1); border-color: transparent; color: #fff; }
        .ctrl-btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
        .range-input { width: 100%; accent-color: #0ea5e9; height: 4px; }
        .chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); cursor: pointer; font-size: 12px; font-weight: 500; transition: all .15s; color: #cbd5e1; }
        .chip:hover { background: rgba(255,255,255,0.12); }
        .chip.active { background: rgba(14,165,233,0.3); border-color: #0ea5e9; color: #38bdf8; }
        .panel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 16px; }
        .panel-title { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; z-index: 9999; animation: slideUp .25s ease; pointer-events: none; }
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            ✂
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              background: 'linear-gradient(90deg,#38bdf8,#a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Image Editor
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Crop · Rotate · Scale · Download</p>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: hasImage ? '280px 1fr' : '1fr',
          gap: 16,
        }}
      >
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Upload */}
          <div className="panel">
            <div className="panel-title">📁 Image</div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#0ea5e9' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 12,
                padding: '20px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.03)',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
                {hasImage ? imgName || 'Image loaded' : 'Drop image or click'}
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>PNG, JPG, WEBP, GIF</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelectFile} hidden />
            {hasImage && (
              <button
                className="ctrl-btn danger"
                style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                onClick={handleClear}
              >
                🗑 Remove Image
              </button>
            )}
          </div>

          {hasImage && (
            <>
              {/* Aspect Ratio */}
              <div className="panel">
                <div className="panel-title">⬜ Aspect Ratio</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ASPECT_RATIOS.map((r) => (
                    <span
                      key={r.label}
                      className={`chip ${aspect === r.value ? 'active' : ''}`}
                      onClick={() => handleAspect(r.value)}
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div className="panel">
                <div className="panel-title">🔍 Scale</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="ctrl-btn"
                    style={{ padding: '6px 10px', fontSize: 16 }}
                    onClick={() => setScale((s) => Math.max(0.1, +(s - 0.1).toFixed(1)))}
                    disabled={scale <= 0.1}
                  >
                    −
                  </button>
                  <input
                    type="range"
                    className="range-input"
                    min={0.1}
                    max={3}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(+e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="ctrl-btn"
                    style={{ padding: '6px 10px', fontSize: 16 }}
                    onClick={() => setScale((s) => Math.min(3, +(s + 0.1).toFixed(1)))}
                    disabled={scale >= 3}
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 6 }}>
                  {scale.toFixed(2)}×
                </div>
              </div>

              {/* Rotate */}
              <div className="panel">
                <div className="panel-title">🔄 Rotation</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className="ctrl-btn"
                    style={{ padding: '6px 10px' }}
                    onClick={() => setRotate((r) => ((r - 90 + 180) % 360) - 180)}
                  >
                    ↺
                  </button>
                  <input
                    type="range"
                    className="range-input"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotate}
                    onChange={(e) => setRotate(+e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="ctrl-btn"
                    style={{ padding: '6px 10px' }}
                    onClick={() => setRotate((r) => ((r + 90 + 180) % 360) - 180)}
                  >
                    ↻
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 6 }}>{rotate}°</div>
              </div>

              {/* Container height */}
              <div className="panel">
                <div className="panel-title">↕ Editor Height</div>
                <input
                  type="range"
                  className="range-input"
                  min={220}
                  max={820}
                  step={10}
                  value={containerH}
                  onChange={(e) => setContainerH(+e.target.value)}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 6 }}>{containerH}px</div>
              </div>

              {/* Reset */}
              <button className="ctrl-btn" style={{ justifyContent: 'center' }} onClick={handleReset}>
                ↺ Reset All Settings
              </button>
            </>
          )}
        </div>

        {/* ── Main Area ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!hasImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#0ea5e9' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 20,
                height: 460,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all .2s',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 56 }}>🖼️</div>
              <div
                style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8' }}
              >
                Drop an image here
              </div>
              <div style={{ fontSize: 14, color: '#475569' }}>or click to browse</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {['PNG', 'JPG', 'WEBP', 'GIF', 'BMP'].map((f) => (
                  <span key={f} className="chip">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Image editor */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    ✏️ Drag to crop · Handles to resize · Bottom bar to resize editor
                  </span>
                  {hasCrop && (
                    <span style={{ fontSize: 11, color: '#0ea5e9' }}>
                      {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px
                    </span>
                  )}
                </div>

                <div
                  ref={containerRef}
                  style={{
                    position: 'relative',
                    height: containerH,
                    background:
                      'repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transition: isResizing ? 'none' : 'height .2s',
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      ref={imgRef}
                      src={imgSrc}
                      alt="Edit"
                      onLoad={onImageLoad}
                      style={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: `${containerH - 40}px`,
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        transformOrigin: 'center',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                    />
                    {imgRef.current && (
                      <CropOverlay
                        imgRef={imgRef}
                        crop={crop}
                        setCrop={(c) => {
                          setCrop(c);
                          const img = imgRef.current;
                          if (img && c)
                            setCompletedCrop({
                              x: (c.x / 100) * img.width,
                              y: (c.y / 100) * img.height,
                              width: (c.width / 100) * img.width,
                              height: (c.height / 100) * img.height,
                              unit: 'px',
                            });
                        }}
                        setCompletedCrop={setCompletedCrop}
                        aspect={aspect}
                      />
                    )}
                  </div>

                  {/* Resize handle */}
                  <div
                    onMouseDown={onResizeStart}
                    onTouchStart={onResizeStart}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 8,
                      background: isResizing ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                      cursor: 'ns-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background .15s',
                    }}
                  >
                    <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              {/* Preview + Actions row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: hasCrop ? '1fr auto' : '1fr',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="ctrl-btn primary"
                    onClick={onDownload}
                    disabled={!hasCrop || isProcessing}
                    style={{ padding: '10px 20px', fontSize: 14 }}
                  >
                    {isProcessing ? '⏳ Processing…' : '⬇ Download Cropped'}
                  </button>
                  <button className="ctrl-btn danger" onClick={handleClear}>
                    {' '}
                    🗑 Clear
                  </button>
                  <button className="ctrl-btn" onClick={handleReset}>
                    ↺ Reset
                  </button>
                  {!hasCrop && (
                    <span style={{ fontSize: 12, color: '#475569' }}>Draw a crop box on the image to get started</span>
                  )}
                </div>

                {/* Mini preview */}
                {hasCrop && (
                  <div className="panel" style={{ padding: 10 }}>
                    <div className="panel-title" style={{ marginBottom: 8 }}>
                      Preview
                    </div>
                    <canvas
                      ref={previewCanvasRef}
                      style={{
                        display: 'block',
                        maxWidth: 160,
                        maxHeight: 120,
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'center' }}>
                      {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="toast"
          style={{
            background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
            color: '#fff',
          }}
        >
          {toast.type === 'error' ? '⚠️ ' : '✅ '}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
