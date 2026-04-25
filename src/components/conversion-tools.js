/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-return-assign */
import { useState } from 'react';
import { Badge, Btn, Dropzone, DS, Icon, ICONS, ProgressBar, ToolPanel } from './design-system';

// ============================================================
// TOOL: IMAGES TO PDF
// ============================================================
export function ImagesToPdf({ onClose }) {
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

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    await new Promise((r) => (script.onload = r));

    const { jsPDF: JsPdf } = window.jspdf;
    const doc = new JsPdf({ unit: 'mm', format: 'a4' });

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
    <ToolPanel title="Images → PDF" badge="POPULAR" badgeColor={DS.green} icon={ICONS.pdf} iconColor={DS.green} onClose={onClose}>
      <Dropzone onFiles={addImages} accept="image/*" multiple>
        <Icon d={ICONS.upload} size={24} />
        <span style={{ fontSize: 13 }}>Drop multiple images</span>
        <Badge color={DS.textDim}>JPG • PNG • WEBP • GIF</Badge>
      </Dropzone>

      {images.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8, marginBottom: 16 }}>
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
                <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={img.name} />
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
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: DS.accent }}>{idx + 1}</span>
                  <button
                    type="button"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: DS.green, fontSize: 12 }}>
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
// TOOL: OCR SCANNER
// ============================================================
export function OcrScanner({ onClose }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const scan = async () => {
    if (!image) return;
    setScanning(true);
    setText('');
    setProgress(0);

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
    <ToolPanel title="OCR Scanner" badge="TESSERACT" badgeColor={DS.blue} icon={ICONS.ocr} iconColor={DS.blue} onClose={onClose}>
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
                alt={image.name}
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
