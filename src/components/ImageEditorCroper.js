/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-multi-assign */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/button-has-type */
/* eslint-disable max-len */
import { useCallback, useEffect, useRef, useState } from 'react';

// ── Inline MUI via CDN imports via esm.sh would be ideal but since we're in artifact,
// we'll build a premium MUI-styled component using Tailwind + custom CSS that mirrors MUI exactly

const TO_RADIANS = Math.PI / 180;

const ASPECT_RATIOS = [
  { label: 'Free', value: null, icon: '⊡' },
  { label: '1:1', value: 1, icon: '□' },
  { label: '4:3', value: 4 / 3, icon: '▭' },
  { label: '16:9', value: 16 / 9, icon: '▬' },
  { label: '3:2', value: 3 / 2, icon: '▭' },
  { label: '2:3', value: 2 / 3, icon: '▯' },
  { label: '9:16', value: 9 / 16, icon: '▯' },
];

const FILTERS = [
  { label: 'None', value: 'none', css: '' },
  { label: 'Grayscale', value: 'grayscale', css: 'grayscale(100%)' },
  { label: 'Sepia', value: 'sepia', css: 'sepia(100%)' },
  { label: 'Invert', value: 'invert', css: 'invert(100%)' },
  { label: 'Warm', value: 'warm', css: 'saturate(150%) hue-rotate(-20deg) brightness(105%)' },
  { label: 'Cool', value: 'cool', css: 'saturate(120%) hue-rotate(30deg) brightness(102%)' },
  { label: 'Vivid', value: 'vivid', css: 'saturate(200%) contrast(110%)' },
  { label: 'Matte', value: 'matte', css: 'saturate(80%) contrast(95%) brightness(105%)' },
  { label: 'Vintage', value: 'vintage', css: 'sepia(50%) saturate(80%) brightness(90%)' },
  { label: 'Dramatic', value: 'dramatic', css: 'contrast(150%) brightness(90%) saturate(80%)' },
];

const TABS = [
  { id: 'crop', label: 'Crop & Rotate', icon: '✂️' },
  { id: 'adjust', label: 'Adjust', icon: '🎨' },
  { id: 'filters', label: 'Filters', icon: '✨' },
  { id: 'export', label: 'Export', icon: '📤' },
];

function useDebounceEffect(fn, wait, deps) {
  useEffect(() => {
    const t = setTimeout(() => fn(...deps), wait);
    return () => clearTimeout(t);
  }, deps);
}

async function canvasPreview(image, canvas, crop, scale, rotate, filterCSS, adjustments) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(crop.width * scaleX * pr);
  canvas.height = Math.floor(crop.height * scaleY * pr);
  ctx.scale(pr, pr);
  ctx.imageSmoothingQuality = 'high';
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cx = image.naturalWidth / 2;
  const cy = image.naturalHeight / 2;
  const allFilters = [
    filterCSS,
    `brightness(${adjustments.brightness}%)`,
    `contrast(${adjustments.contrast}%)`,
    `saturate(${adjustments.saturation}%)`,
    `blur(${adjustments.blur}px)`,
    `hue-rotate(${adjustments.hue}deg)`,
  ]
    .filter(Boolean)
    .join(' ');
  ctx.filter = allFilters || 'none';
  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(cx, cy);
  ctx.rotate(rotate * TO_RADIANS);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
  ctx.restore();
}

// ── Sketch filter applied via canvas ──
function applySketchToCanvas(srcCanvas, strength = 1) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const ctx2 = tmp.getContext('2d');
  ctx2.drawImage(srcCanvas, 0, 0);
  const src = ctx2.getImageData(0, 0, w, h);
  const out = ctx2.createImageData(w, h);
  // Greyscale
  for (let i = 0; i < src.data.length; i += 4) {
    const g = 0.299 * src.data[i] + 0.587 * src.data[i + 1] + 0.114 * src.data[i + 2];
    src.data[i] = src.data[i + 1] = src.data[i + 2] = g;
  }
  // Sobel edge detection
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const tl = src.data[((y - 1) * w + (x - 1)) * 4];
      const t = src.data[((y - 1) * w + x) * 4];
      const tr = src.data[((y - 1) * w + (x + 1)) * 4];
      const l = src.data[(y * w + (x - 1)) * 4];
      const r = src.data[(y * w + (x + 1)) * 4];
      const bl = src.data[((y + 1) * w + (x - 1)) * 4];
      const b = src.data[((y + 1) * w + x) * 4];
      const br = src.data[((y + 1) * w + (x + 1)) * 4];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * strength);
      const val = 255 - mag;
      out.data[idx] = out.data[idx + 1] = out.data[idx + 2] = val;
      out.data[idx + 3] = 255;
    }
  }
  ctx2.putImageData(out, 0, 0);
  return tmp;
}

// ── CropOverlay ──
function CropOverlay({ imgRef, crop, setCrop, setCompletedCrop, aspect }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pos = (e, el) => {
    const r = el.getBoundingClientRect();
    return {
      x: (((e.touches?.[0]?.clientX ?? e.clientX) - r.left) / r.width) * 100,
      y: (((e.touches?.[0]?.clientY ?? e.clientY) - r.top) / r.height) * 100,
    };
  };
  const commit = useCallback(
    (c) => {
      const img = imgRef.current;
      if (!img || !c) return;
      setCompletedCrop({
        x: (c.x / 100) * img.width,
        y: (c.y / 100) * img.height,
        width: (c.width / 100) * img.width,
        height: (c.height / 100) * img.height,
        unit: 'px',
      });
    },
    [imgRef, setCompletedCrop]
  );

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current || !ref.current) return;
      const p = pos(e, ref.current);
      const { type, sp, sc } = drag.current;
      if (type === 'new') {
        let x = Math.min(sp.x, p.x);
        let y = Math.min(sp.y, p.y);
        const w = Math.abs(p.x - sp.x);
        let h = Math.abs(p.y - sp.y);
        if (aspect) h = w / aspect;
        x = clamp(x, 0, 100 - w);
        y = clamp(y, 0, 100 - h);
        setCrop({ x, y, width: w, height: h, unit: '%' });
      } else if (type === 'move') {
        const nx = clamp(sc.x + p.x - sp.x, 0, 100 - sc.width);
        const ny = clamp(sc.y + p.y - sp.y, 0, 100 - sc.height);
        setCrop({ ...sc, x: nx, y: ny });
      } else {
        let { x, y, width: w, height: h } = sc;
        const dx = p.x - sp.x;
        const dy = p.y - sp.y;
        if (type === 'se') {
          w = clamp(w + dx, 5, 100 - x);
          h = aspect ? w / aspect : clamp(h + dy, 5, 100 - y);
        } else if (type === 'sw') {
          const nw = clamp(w - dx, 5, x + w);
          x += w - nw;
          w = nw;
          h = aspect ? w / aspect : clamp(h + dy, 5, 100 - y);
        } else if (type === 'ne') {
          w = clamp(w + dx, 5, 100 - x);
          const nh = aspect ? w / aspect : clamp(h - dy, 5, y + h);
          y += h - nh;
          h = nh;
        } else if (type === 'nw') {
          const nw = clamp(w - dx, 5, x + w);
          x += w - nw;
          const nh = aspect ? nw / aspect : clamp(h - dy, 5, y + h);
          y += h - nh;
          w = nw;
          h = nh;
        }
        setCrop({ x, y, width: w, height: h, unit: '%' });
      }
    };
    const onUp = (e) => {
      if (drag.current) {
        const p = pos(e, ref.current);
        const { type, sp, sc } = drag.current;
        // get final crop
        let finalCrop = sc;
        if (type === 'new') {
          let x = Math.min(sp.x, p.x);
          let y = Math.min(sp.y, p.y);
          const w = Math.abs(p.x - sp.x);
          let h = Math.abs(p.y - sp.y);
          if (aspect) h = w / aspect;
          x = clamp(x, 0, 100 - w);
          y = clamp(y, 0, 100 - h);
          finalCrop = { x, y, width: w, height: h, unit: '%' };
        }
        if (finalCrop) commit(finalCrop);
      }
      drag.current = null;
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
  }, [crop, aspect, commit]);

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}
      onMouseDown={(e) => {
        if (e.target !== ref.current) return;
        drag.current = { type: 'new', sp: pos(e, ref.current), sc: null };
      }}
      onTouchStart={(e) => {
        if (e.target !== ref.current) return;
        drag.current = { type: 'new', sp: pos(e, ref.current), sc: null };
      }}
    >
      {crop && crop.width > 0 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
          <div
            style={{
              position: 'absolute',
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.9)',
              cursor: 'move',
              boxSizing: 'border-box',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              drag.current = { type: 'move', sp: pos(e, ref.current), sc: { ...crop } };
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              drag.current = { type: 'move', sp: pos(e, ref.current), sc: { ...crop } };
            }}
          >
            {[33.3, 66.6].map((p) => (
              <div
                key={`v${p}`}
                style={{
                  position: 'absolute',
                  left: `${p}%`,
                  top: 0,
                  bottom: 0,
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
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
                  borderTop: '1px solid rgba(255,255,255,0.3)',
                  pointerEvents: 'none',
                }}
              />
            ))}
            {[
              ['nw', { top: -6, left: -6, cursor: 'nw-resize' }],
              ['ne', { top: -6, right: -6, cursor: 'ne-resize' }],
              ['sw', { bottom: -6, left: -6, cursor: 'sw-resize' }],
              ['se', { bottom: -6, right: -6, cursor: 'se-resize' }],
            ].map(([type, s]) => (
              <div
                key={type}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  drag.current = { type, sp: pos(e, ref.current), sc: { ...crop } };
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  drag.current = { type, sp: pos(e, ref.current), sc: { ...crop } };
                }}
                style={{
                  position: 'absolute',
                  width: 12,
                  height: 12,
                  background: 'white',
                  border: '2px solid #1976d2',
                  borderRadius: 2,
                  zIndex: 10,
                  ...s,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── MUI-Style Slider ──
function MuiSlider({ value, min, max, step, onChange, color = '#1976d2', disabled }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      style={{
        position: 'relative',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.15)' }}
      />
      <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, borderRadius: 2, background: color }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        disabled={disabled}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'inherit', width: '100%', margin: 0 }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${pct}%`,
          transform: 'translateX(-50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'white',
          border: `2px solid ${color}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ── Main Component ──
export default function ImageEditor() {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgName, setImgName] = useState('');
  const [tab, setTab] = useState('crop');
  const [draggingFile, setDraggingFile] = useState(false);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCC] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState(null);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [filter, setFilter] = useState('none');
  const [sketch, setSketch] = useState(false);
  const [sketchStr, setSketchStr] = useState(1.5);
  const [adj, setAdj] = useState({ brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, opacity: 100 });
  const [containerH, setContainerH] = useState(440);
  const [isResizing, setIsResizing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [exportFmt, setExportFmt] = useState('png');
  const [exportQ, setExportQ] = useState(92);
  const [exportScale, setExportScale] = useState(1);
  const [pdfLayout, setPdfLayout] = useState('fit');
  const imgRef = useRef(null);
  const prevCanRef = useRef(null);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const toast$ = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const loadFile = (file) => {
    if (!file?.type.startsWith('image/')) return toast$('Please upload a valid image file.', 'error');
    setImgName(file.name);
    setCrop(null);
    setCC(null);
    const r = new FileReader();
    r.addEventListener('load', () => setImgSrc(r.result?.toString() || ''));
    r.readAsDataURL(file);
  };

  const filterCSS = FILTERS.find((f) => f.value === filter)?.css || '';
  const adjCSS = [
    filterCSS,
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
    `blur(${adj.blur}px)`,
    `hue-rotate(${adj.hue}deg)`,
    `opacity(${adj.opacity}%)`,
  ]
    .filter(Boolean)
    .join(' ');

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && prevCanRef.current) {
        await canvasPreview(imgRef.current, prevCanRef.current, completedCrop, scale, rotate, filterCSS, adj);
        if (sketch) {
          const sketched = applySketchToCanvas(prevCanRef.current, sketchStr);
          const ctx = prevCanRef.current.getContext('2d');
          ctx.clearRect(0, 0, prevCanRef.current.width, prevCanRef.current.height);
          ctx.drawImage(sketched, 0, 0);
        }
      }
    },
    120,
    [completedCrop, scale, rotate, filter, adj, sketch, sketchStr]
  );

  const buildExportCanvas = () => {
    const image = imgRef.current;
    const canvas = prevCanRef.current;
    if (!image || !canvas || !completedCrop) return null;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const w = completedCrop.width * scaleX * exportScale;
    const h = completedCrop.height * scaleY * exportScale;
    const off = new OffscreenCanvas(w, h);
    const ctx = off.getContext('2d');
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
    return { off, w, h };
  };

  const onDownload = async () => {
    if (!completedCrop) return toast$('Make a crop selection first.', 'error');
    setIsProcessing(true);
    try {
      const res = buildExportCanvas();
      if (!res) throw new Error('Canvas build failed');
      const { off } = res;
      const mime = exportFmt === 'jpg' ? 'image/jpeg' : exportFmt === 'webp' ? 'image/webp' : 'image/png';
      const blob = await off.convertToBlob({ type: mime, quality: exportQ / 100 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${Date.now()}.${exportFmt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast$('Image downloaded!');
    } catch (e) {
      toast$(`Download failed: ${e.message}`, 'error');
    }
    setIsProcessing(false);
  };

  const onDownloadPDF = async () => {
    if (!completedCrop) return toast$('Make a crop selection first.', 'error');
    setIsProcessing(true);
    try {
      const res = buildExportCanvas();
      if (!res) throw new Error();
      const { off, w, h } = res;
      const blob = await off.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
      const dataUrl = await new Promise((r) => {
        const fr = new FileReader();
        fr.onload = () => r(fr.result);
        fr.readAsDataURL(blob);
      });
      // A4 in pts: 595×842; letter: 612×792
      const pageW = 595;
      const pageH = 842;
      let iw;
      let ih;
      let ix;
      let iy;
      if (pdfLayout === 'fit') {
        const scale = Math.min(pageW / w, pageH / h);
        iw = w * scale;
        ih = h * scale;
        ix = (pageW - iw) / 2;
        iy = (pageH - ih) / 2;
      } else if (pdfLayout === 'fill') {
        iw = pageW;
        ih = pageH;
        ix = 0;
        iy = 0;
      } else {
        iw = Math.min(w, pageW);
        ih = Math.min(h, pageH);
        ix = (pageW - iw) / 2;
        iy = (pageH - ih) / 2;
      }
      // Build minimal valid PDF manually
      const img64 = dataUrl.split(',')[1];
      const imgBytes = atob(img64);
      const imgLen = imgBytes.length;
      const lines = [];
      lines.push('%PDF-1.4');
      lines.push('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj');
      lines.push(`2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj`);
      lines.push(
        `3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pageW} ${pageH}]/Contents 4 0 R/Resources<</XObject<</Im1 5 0 R>>>>>>endobj`
      );
      const stream = `q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${ix.toFixed(2)} ${(pageH - iy - ih).toFixed(2)} cm /Im1 Do Q`;
      lines.push(`4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj`);
      lines.push(
        `5 0 obj<</Type/XObject/Subtype/Image/Width ${w}/Height ${h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${imgLen}>>stream`
      );
      const header = `${lines.join('\n')}\n`;
      const footer = `\nendstream endobj\n`;
      const xref = `xref\n0 6\n0000000000 65535 f \n`;
      const trailer = `trailer<</Size 6/Root 1 0 R>>\nstartxref\n9\n%%EOF`;
      // Use jsPDF via CDN approach — embed as data URI PDF
      // Simpler: build a proper PDF using the canvas image as base64 embedded
      const pdfContent = [
        '%PDF-1.4\n',
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n\n',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n\n',
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}]\n   /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n\n`,
      ].join('');
      // Use window.jspdf if available, else fallback to print approach
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html><html><head><title>Export PDF</title><style>
          body{margin:0;padding:0;background:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;}
          img{max-width:${pdfLayout === 'fill' ? '100vw' : '794px'};max-height:${pdfLayout === 'fill' ? '100vh' : '1123px'};display:block;}
          @media print{body{margin:0;}@page{size:A4;margin:0;}}
        </style></head><body><img src="${dataUrl}" /></body></html>`);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
        toast$('PDF print dialog opened!');
      } else {
        // Fallback: download as image and notify
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `image-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast$('PDF popups blocked — downloaded as image instead.');
      }
    } catch (e) {
      toast$('PDF export failed.', 'error');
    }
    setIsProcessing(false);
  };

  const onResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      setIsResizing(true);
      const sy = e.clientY || e.touches?.[0]?.clientY;
      const sh = containerH;
      const mv = (ev) =>
        setContainerH(Math.max(220, Math.min(820, sh + ((ev.clientY || ev.touches?.[0]?.clientY) - sy))));
      const up = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', mv);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', mv);
      window.addEventListener('mouseup', up);
    },
    [containerH]
  );

  const handleAspect = (val) => {
    setAspect(val);
    if (val && imgRef.current) {
      const { width, height } = imgRef.current;
      const w = 80;
      const h = w / val;
      const x = (100 - w) / 2;
      const y = (100 - h) / 2;
      const nc = { x, y, width: w, height: h, unit: '%' };
      setCrop(nc);
      setCC({
        x: (x / 100) * width,
        y: (y / 100) * height,
        width: (w / 100) * width,
        height: (h / 100) * height,
        unit: 'px',
      });
    } else {
      setCrop(null);
      setCC(null);
    }
  };

  const reset = () => {
    setScale(1);
    setRotate(0);
    setAspect(null);
    setCrop(null);
    setCC(null);
    setFlipH(false);
    setFlipV(false);
    setFilter('none');
    setSketch(false);
    setAdj({ brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, opacity: 100 });
    setContainerH(440);
  };
  const hasCrop = !!(completedCrop?.width && completedCrop?.height);

  function Btn({
    children,
    onClick,
    disabled,
    variant = 'outlined',
    color = 'primary',
    size = 'medium',
    fullWidth,
    sx = {},
  }) {
    const base = {
      fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      borderRadius: 6,
      fontWeight: 500,
      transition: 'all .15s',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      opacity: disabled ? 0.5 : 1,
      ...sx,
    };
    const variants = {
      contained: {
        background: color === 'error' ? '#d32f2f' : color === 'success' ? '#2e7d32' : '#1976d2',
        color: '#fff',
        padding: size === 'small' ? '5px 14px' : '8px 20px',
        fontSize: size === 'small' ? 12 : 14,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      },
      outlined: {
        background: 'transparent',
        color: color === 'error' ? '#d32f2f' : '#1976d2',
        border: `1px solid ${color === 'error' ? 'rgba(211,47,47,0.5)' : 'rgba(25,118,210,0.5)'}`,
        padding: size === 'small' ? '4px 13px' : '7px 19px',
        fontSize: size === 'small' ? 12 : 14,
      },
      text: {
        background: 'transparent',
        color: color === 'error' ? '#d32f2f' : '#1976d2',
        padding: size === 'small' ? '4px 8px' : '7px 12px',
        fontSize: size === 'small' ? 12 : 14,
      },
    };
    return (
      <button
        onClick={!disabled ? onClick : undefined}
        style={{ ...base, ...variants[variant], ...(fullWidth ? { width: '100%' } : {}) }}
      >
        {children}
      </button>
    );
  }

  function SliderRow({ label, val, min, max, step, unit = '', onChange, disabled, color = '#1976d2' }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{label}</span>
          <span style={{ fontSize: 12, color: '#1976d2', fontWeight: 600 }}>
            {val}
            {unit}
          </span>
        </div>
        <MuiSlider value={val} min={min} max={max} step={step} onChange={onChange} disabled={disabled} color={color} />
      </div>
    );
  }

  function Chip({ label, active, onClick }) {
    return (
      <span
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: 20,
          border: `1px solid ${active ? '#1976d2' : '#ddd'}`,
          background: active ? '#e3f2fd' : 'transparent',
          color: active ? '#1976d2' : '#555',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          transition: 'all .15s',
          userSelect: 'none',
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Roboto','Helvetica Neue',Arial,sans-serif",
        minHeight: '100vh',
        background: '#f5f5f5',
        color: '#212121',
      }}
    >
      <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#f1f1f1}::-webkit-scrollbar-thumb{background:#bdbdbd;border-radius:3px}
        input[type=range]{-webkit-appearance:none;appearance:none;background:transparent;width:100%;height:20px;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:12px 16px;font-family:inherit;font-size:13px;font-weight:500;color:#757575;border-bottom:2px solid transparent;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
        .tab-btn.active{color:#1976d2;border-bottom-color:#1976d2;}
        .tab-btn:hover:not(.active){color:#424242;background:rgba(0,0,0,0.04);}
        .filter-card{border:2px solid transparent;border-radius:8px;overflow:hidden;cursor:pointer;transition:all .2s;background:#fff;}
        .filter-card.active{border-color:#1976d2;}
        .filter-card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.12);}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .toast-anim{animation:fadeIn .25s ease}
      `}</style>

      {/* App Bar */}
      <div
        style={{
          background: '#1976d2',
          color: '#fff',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🖼️</span>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>Image Editor Pro</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {imgSrc && (
            <Btn onClick={reset} variant="text" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              ↺ Reset
            </Btn>
          )}
          {imgSrc && (
            <Btn
              onClick={() => {
                setImgSrc(null);
                setImgName('');
                reset();
              }}
              variant="outlined"
              color="error"
              size="small"
              sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#ffcdd2' }}
            >
              ✕ Clear
            </Btn>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: 300,
            background: '#fff',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Upload zone */}
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingFile(false);
                if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${draggingFile ? '#1976d2' : '#bdbdbd'}`,
                borderRadius: 8,
                padding: '20px 12px',
                textAlign: 'center',
                cursor: 'pointer',
                background: draggingFile ? '#e3f2fd' : '#fafafa',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 6 }}>📂</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#424242' }}>
                {imgSrc ? imgName || 'Image loaded' : 'Drop image or click to upload'}
              </div>
              <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 4 }}>PNG · JPG · WEBP · GIF · BMP</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) loadFile(e.target.files[0]);
              }}
              hidden
            />
          </div>

          {/* Tabs */}
          {imgSrc && (
            <div style={{ borderBottom: '1px solid #e0e0e0', display: 'flex', overflowX: 'auto' }}>
              {TABS.map((t) => (
                <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          {imgSrc && (
            <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
              {/* CROP TAB */}
              {tab === 'crop' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Aspect Ratio
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ASPECT_RATIOS.map((r) => (
                        <Chip
                          key={r.label}
                          label={r.label}
                          active={aspect === r.value}
                          onClick={() => handleAspect(r.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Rotate & Flip
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      <Btn size="small" onClick={() => setRotate((r) => ((r - 90 + 180) % 360) - 180)}>
                        ↺ −90°
                      </Btn>
                      <Btn size="small" onClick={() => setRotate((r) => ((r + 90 + 180) % 360) - 180)}>
                        ↻ +90°
                      </Btn>
                      <Btn size="small" variant={flipH ? 'contained' : 'outlined'} onClick={() => setFlipH((v) => !v)}>
                        ↔ Flip H
                      </Btn>
                      <Btn size="small" variant={flipV ? 'contained' : 'outlined'} onClick={() => setFlipV((v) => !v)}>
                        ↕ Flip V
                      </Btn>
                    </div>
                    <SliderRow
                      label="Rotation"
                      val={rotate}
                      min={-180}
                      max={180}
                      step={1}
                      unit="°"
                      onChange={setRotate}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Scale / Zoom
                    </div>
                    <SliderRow label="Scale" val={scale} min={0.1} max={3} step={0.05} unit="×" onChange={setScale} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Container Height
                    </div>
                    <SliderRow
                      label="Height"
                      val={containerH}
                      min={220}
                      max={820}
                      step={10}
                      unit="px"
                      onChange={setContainerH}
                    />
                  </div>
                </>
              )}

              {/* ADJUST TAB */}
              {tab === 'adjust' && (
                <>
                  <SliderRow
                    label="Brightness"
                    val={adj.brightness}
                    min={0}
                    max={200}
                    step={1}
                    unit="%"
                    onChange={(v) => setAdj((a) => ({ ...a, brightness: v }))}
                    color="#f57c00"
                  />
                  <SliderRow
                    label="Contrast"
                    val={adj.contrast}
                    min={0}
                    max={200}
                    step={1}
                    unit="%"
                    onChange={(v) => setAdj((a) => ({ ...a, contrast: v }))}
                    color="#7b1fa2"
                  />
                  <SliderRow
                    label="Saturation"
                    val={adj.saturation}
                    min={0}
                    max={300}
                    step={1}
                    unit="%"
                    onChange={(v) => setAdj((a) => ({ ...a, saturation: v }))}
                    color="#388e3c"
                  />
                  <SliderRow
                    label="Hue Rotate"
                    val={adj.hue}
                    min={-180}
                    max={180}
                    step={1}
                    unit="°"
                    onChange={(v) => setAdj((a) => ({ ...a, hue: v }))}
                    color="#0097a7"
                  />
                  <SliderRow
                    label="Blur"
                    val={adj.blur}
                    min={0}
                    max={20}
                    step={0.5}
                    unit="px"
                    onChange={(v) => setAdj((a) => ({ ...a, blur: v }))}
                    color="#c62828"
                  />
                  <SliderRow
                    label="Opacity"
                    val={adj.opacity}
                    min={10}
                    max={100}
                    step={1}
                    unit="%"
                    onChange={(v) => setAdj((a) => ({ ...a, opacity: v }))}
                    color="#455a64"
                  />
                  <Btn
                    fullWidth
                    onClick={() =>
                      setAdj({ brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, opacity: 100 })
                    }
                    variant="outlined"
                    size="small"
                  >
                    Reset Adjustments
                  </Btn>
                </>
              )}

              {/* FILTERS TAB */}
              {tab === 'filters' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {FILTERS.map((f) => (
                      <div
                        key={f.value}
                        className={`filter-card ${filter === f.value ? 'active' : ''}`}
                        onClick={() => setFilter(f.value)}
                        style={{ padding: 8, textAlign: 'center' }}
                      >
                        <div
                          style={{
                            height: 48,
                            background: '#f5f5f5',
                            borderRadius: 4,
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            filter: f.css || 'none',
                          }}
                        >
                          🏔️
                        </div>
                        <div
                          style={{ fontSize: 11, fontWeight: 500, color: filter === f.value ? '#1976d2' : '#424242' }}
                        >
                          {f.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#f8f8f8', borderRadius: 8, padding: 12, border: '1px solid #e0e0e0' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>✏️ Sketch Effect</span>
                      <button
                        onClick={() => setSketch((v) => !v)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: sketch ? '#1976d2' : '#bdbdbd',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background .2s',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: 2,
                            left: sketch ? 22 : 2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left .2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }}
                        />
                      </button>
                    </div>
                    {sketch && (
                      <SliderRow
                        label="Edge Strength"
                        val={sketchStr}
                        min={0.5}
                        max={4}
                        step={0.1}
                        onChange={setSketchStr}
                        color="#424242"
                      />
                    )}
                  </div>
                </>
              )}

              {/* EXPORT TAB */}
              {tab === 'export' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      Format
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['png', 'jpg', 'webp'].map((f) => (
                        <Chip
                          key={f}
                          label={f.toUpperCase()}
                          active={exportFmt === f}
                          onClick={() => setExportFmt(f)}
                        />
                      ))}
                    </div>
                  </div>
                  {(exportFmt === 'jpg' || exportFmt === 'webp') && (
                    <SliderRow
                      label="Quality"
                      val={exportQ}
                      min={10}
                      max={100}
                      step={1}
                      unit="%"
                      onChange={setExportQ}
                    />
                  )}
                  <SliderRow
                    label="Export Scale"
                    val={exportScale}
                    min={0.25}
                    max={3}
                    step={0.25}
                    unit="×"
                    onChange={setExportScale}
                  />
                  {hasCrop && completedCrop && (
                    <div
                      style={{
                        background: '#f3f8ff',
                        borderRadius: 6,
                        padding: 10,
                        fontSize: 12,
                        color: '#1565c0',
                        marginBottom: 16,
                      }}
                    >
                      Output: ~{Math.round(completedCrop.width * exportScale)} ×{' '}
                      {Math.round(completedCrop.height * exportScale)}px
                    </div>
                  )}
                  <Btn
                    fullWidth
                    variant="contained"
                    onClick={onDownload}
                    disabled={!hasCrop || isProcessing}
                    sx={{ marginBottom: 10 }}
                  >
                    {isProcessing ? '⏳ Processing…' : '⬇️ Download Image'}
                  </Btn>
                  <div style={{ borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.08,
                        color: '#757575',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      PDF Export
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Page Layout</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[
                          ['fit', 'Fit'],
                          ['fill', 'Fill'],
                          ['actual', 'Actual'],
                        ].map(([v, l]) => (
                          <Chip key={v} label={l} active={pdfLayout === v} onClick={() => setPdfLayout(v)} />
                        ))}
                      </div>
                    </div>
                    <Btn fullWidth variant="outlined" onClick={onDownloadPDF} disabled={!hasCrop || isProcessing}>
                      📄 Export as PDF
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Main Canvas Area ─────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#eeeeee' }}>
          {!imgSrc ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDraggingFile(false);
                if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileRef.current?.click()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: 16,
                border: `3px dashed ${draggingFile ? '#1976d2' : '#bdbdbd'}`,
                borderRadius: 16,
                margin: 32,
                background: draggingFile ? 'rgba(25,118,210,0.04)' : 'rgba(255,255,255,0.6)',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: 64 }}>🖼️</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#424242' }}>Drop an image here</div>
              <div style={{ fontSize: 14, color: '#9e9e9e' }}>or click to browse files</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {['PNG', 'JPG', 'WEBP', 'GIF', 'BMP', 'SVG'].map((f) => (
                  <Chip key={f} label={f} active={false} onClick={() => {}} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar strip */}
              <div
                style={{
                  background: '#fff',
                  borderBottom: '1px solid #e0e0e0',
                  padding: '6px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 12, color: '#757575', fontWeight: 500 }}>
                  ✂️ Draw crop · Drag to move · Handles to resize
                </span>
                {hasCrop && completedCrop && (
                  <>
                    <span
                      style={{
                        background: '#e3f2fd',
                        color: '#1565c0',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px
                    </span>
                    <span
                      style={{
                        background: '#f3e5f5',
                        color: '#6a1b9a',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 600,
                      }}
                    >
                      {scale.toFixed(2)}× · {rotate}°
                    </span>
                  </>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <Btn size="small" variant="contained" onClick={onDownload} disabled={!hasCrop || isProcessing}>
                    ⬇️ Download
                  </Btn>
                  <Btn size="small" variant="outlined" onClick={onDownloadPDF} disabled={!hasCrop || isProcessing}>
                    📄 PDF
                  </Btn>
                </div>
              </div>

              {/* Image editor area */}
              <div
                ref={containerRef}
                style={{
                  position: 'relative',
                  height: containerH,
                  background: 'repeating-conic-gradient(#d0d0d0 0% 25%,#e8e8e8 0% 50%) 0 0/20px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  transition: isResizing ? 'none' : 'height .2s',
                  flexShrink: 0,
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Edit"
                    onLoad={() => {
                      if (aspect && imgRef.current) {
                        const { width, height } = imgRef.current;
                        const w = 80;
                        const h = w / aspect;
                        const x = (100 - w) / 2;
                        const y = (100 - h) / 2;
                        const nc = { x, y, width: w, height: h, unit: '%' };
                        setCrop(nc);
                        setCC({
                          x: (x / 100) * width,
                          y: (y / 100) * height,
                          width: (w / 100) * width,
                          height: (h / 100) * height,
                          unit: 'px',
                        });
                      }
                    }}
                    style={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: `${containerH - 40}px`,
                      transform: `scale(${flipH ? -scale : scale}, ${flipV ? -scale : scale}) rotate(${rotate}deg)`,
                      transformOrigin: 'center',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      filter: adjCSS,
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
                          setCC({
                            x: (c.x / 100) * img.width,
                            y: (c.y / 100) * img.height,
                            width: (c.width / 100) * img.width,
                            height: (c.height / 100) * img.height,
                            unit: 'px',
                          });
                      }}
                      setCompletedCrop={setCC}
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
                    background: isResizing ? '#1976d2' : 'rgba(0,0,0,0.12)',
                    cursor: 'ns-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ width: 40, height: 3, background: 'rgba(0,0,0,0.3)', borderRadius: 2 }} />
                </div>
              </div>

              {/* Preview */}
              {hasCrop && (
                <div
                  style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: 12,
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#757575',
                        textTransform: 'uppercase',
                        letterSpacing: 0.08,
                        marginBottom: 8,
                      }}
                    >
                      Crop Preview
                    </div>
                    <canvas
                      ref={prevCanRef}
                      style={{
                        display: 'block',
                        maxWidth: 240,
                        maxHeight: 180,
                        borderRadius: 4,
                        border: '1px solid #eee',
                      }}
                    />
                    {completedCrop && (
                      <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 6, textAlign: 'center' }}>
                        {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}px
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: 12,
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      fontSize: 12,
                      minWidth: 180,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#757575',
                        textTransform: 'uppercase',
                        letterSpacing: 0.08,
                        marginBottom: 8,
                      }}
                    >
                      Image Info
                    </div>
                    {[
                      ['File', imgName || '—'],
                      ['Scale', `${scale.toFixed(2)}×`],
                      ['Rotation', `${rotate}°`],
                      ['Flip H', flipH ? 'Yes' : 'No'],
                      ['Flip V', flipV ? 'Yes' : 'No'],
                      ['Filter', FILTERS.find((f) => f.value === filter)?.label || 'None'],
                      ['Sketch', sketch ? 'On' : 'Off'],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '3px 0',
                          borderBottom: '1px solid #f5f5f5',
                        }}
                      >
                        <span style={{ color: '#757575' }}>{k}</span>
                        <span
                          style={{
                            fontWeight: 500,
                            color: '#212121',
                            maxWidth: 120,
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!hasCrop && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#9e9e9e' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✂️</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>Draw a crop box on the image above</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Click and drag to select a crop area</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="toast-anim"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            zIndex: 9999,
            pointerEvents: 'none',
            background: toast.type === 'error' ? '#c62828' : '#2e7d32',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
}
