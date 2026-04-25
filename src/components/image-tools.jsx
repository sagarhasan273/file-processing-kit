/* eslint-disable max-len */
/* eslint-disable no-return-assign */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Btn, Dropzone, DS, Icon, ICONS, ToolPanel } from './design-system';

// ============================================================
// TOOL: IMAGE EDITOR
// ============================================================
export function ImageEditor({ onClose }) {
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
    setImgSrc(URL.createObjectURL(files[0]));
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
    <ToolPanel title="Image Editor" badge="BETA" badgeColor={DS.blue} icon={ICONS.image} iconColor={DS.blue} onClose={onClose}>
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
              <img ref={imgRef} src={imgSrc} alt="Resize" onLoad={applyFilters} style={{ display: 'none' }} />
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
// TOOL: IMAGE RESIZER
// ============================================================
const PRESETS = [
  { name: 'Instagram Square', w: 1080, h: 1080 },
  { name: 'Instagram Story', w: 1080, h: 1920 },
  { name: 'Twitter Post', w: 1200, h: 675 },
  { name: 'Facebook Cover', w: 851, h: 315 },
  { name: 'LinkedIn Banner', w: 1584, h: 396 },
  { name: 'YouTube Thumb', w: 1280, h: 720 },
];

export function ImageResizer({ onClose }) {
  const [image, setImage] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [locked, setLocked] = useState(true);
  const [origRatio, setOrigRatio] = useState(1);
  const canvasRef = useRef();

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

  const inputStyle = {
    width: '100%',
    background: DS.surfaceHigh,
    border: `1px solid ${DS.border}`,
    borderRadius: 6,
    color: DS.text,
    padding: '6px 10px',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'Space Mono', monospace",
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
            src={image.url || ''}
            alt="Resize"
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
                <input type="number" value={width} onChange={(e) => handleWidth(+e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: DS.textMuted, display: 'block', marginBottom: 4 }}>Height</label>
                <input type="number" value={height} onChange={(e) => handleHeight(+e.target.value)} style={inputStyle} />
              </div>
            </div>
            <button
              type="button"
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
              type="button"
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
