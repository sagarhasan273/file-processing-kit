/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-return-assign */
import { useState } from 'react';
import { Btn, Dropzone, DS, Icon, ICONS, ProgressBar, ToolPanel } from './design-system';

// ============================================================
// TOOL: PDF MERGE
// ============================================================
export function PdfMerge({ onClose }) {
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
              <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
              </span>
              <span style={{ fontSize: 11, color: DS.textMuted, fontFamily: "'Space Mono', monospace" }}>{f.size}</span>
              <button
                type="button"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: DS.green, fontSize: 12 }}>
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
          {files.length < 2 && <p style={{ fontSize: 11, color: DS.orange, marginTop: 8 }}>Add at least 2 PDF files to merge.</p>}
        </div>
      )}
    </ToolPanel>
  );
}

// ============================================================
// TOOL: PDF COMPRESS
// ============================================================
export function PdfCompress({ onClose }) {
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
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: DS.textMuted }}>{file.size}</span>
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
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: c, fontWeight: 700 }}>{v}</div>
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
