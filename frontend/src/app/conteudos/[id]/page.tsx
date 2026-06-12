'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Check, Loader2, ChevronLeft, ChevronRight,
  Plus, Trash2, Square, Circle, Minus, Copy, Image, FileDown,
} from 'lucide-react';

const BASE = '/api/v1';

interface Shape {
  id: string;
  type: 'rect' | 'circle' | 'line';
  x: number; y: number; w: number; h: number;
  fill: string; stroke: string; strokeWidth: number;
  radius: number; opacity: number;
}

interface Slide {
  index: number;
  eyebrow: string;
  headline: string;
  accentWord: string;
  body: string;
  highlight: string;
  cta: string;
  shapes: Shape[];
  images: ImgEl[];
}

interface ImgEl { id: string; src: string; x: number; y: number; w: number; h: number; opacity: number; }

interface SlideDoc {
  category: string;
  brand: string;
  slides: Slide[];
}

const PALETTES: Record<string, { bg: string; text: string; accent: string; sub: string; border: string }> = {
  cream:   { bg: '#F5EFE6', text: '#1A1A1A', accent: '#C0392B', sub: '#888',  border: '#E0D5C8' },
  dark:    { bg: '#0D0D10', text: '#FFFFFF', accent: '#C9A840', sub: '#666',  border: '#1E1E24' },
  blue:    { bg: '#0A1628', text: '#FFFFFF', accent: '#4A9EFF', sub: '#4A6080', border: '#152035' },
  green:   { bg: '#0E1F1A', text: '#FFFFFF', accent: '#2ECC71', sub: '#2a4a40', border: '#162a22' },
  white:   { bg: '#FFFFFF', text: '#111111', accent: '#6C47FF', sub: '#999',  border: '#EEEEEE' },
  rose:    { bg: '#FDF0F0', text: '#1A1A1A', accent: '#E91E8C', sub: '#999',  border: '#F5D5D5' },
};
type PaletteKey = keyof typeof PALETTES;

const uid = () => Math.random().toString(36).slice(2, 9);

function renderHeadline(headline: string, accentWord: string, color: string, size: number) {
  if (!accentWord || !headline.toLowerCase().includes(accentWord.toLowerCase())) {
    return <span style={{ color: 'inherit' }}>{headline}</span>;
  }
  const regex = new RegExp(`(${accentWord})`, 'gi');
  const parts = headline.split(regex);
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === accentWord.toLowerCase()
          ? <span key={i} style={{ color, fontStyle: 'italic' }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function SlideCanvas({
  slide, doc, palette, selected, onSelectShape, onUpdateShape, editingField, onFieldClick, onFieldBlur, onFieldChange,
}: {
  slide: Slide; doc: SlideDoc; palette: PaletteKey;
  selected: string | null; onSelectShape: (id: string | null) => void;
  onUpdateShape: (id: string, delta: Partial<Shape>) => void;
  editingField: string | null; onFieldClick: (f: string) => void;
  onFieldBlur: (f: string, v: string) => void; onFieldChange: (f: string, v: string) => void;
}) {
  const t = PALETTES[palette];
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; ox: number; oy: number; sx: number; sy: number } | null>(null);

  const onShapeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectShape(id);
    const shape = slide.shapes.find(s => s.id === id)!;
    dragging.current = { id, ox: e.clientX, oy: e.clientY, sx: shape.x, sy: shape.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const dx = ((ev.clientX - dragging.current.ox) / rect.width) * 100;
      const dy = ((ev.clientY - dragging.current.oy) / rect.height) * 100;
      onUpdateShape(dragging.current.id, { x: dragging.current.sx + dx, y: dragging.current.sy + dy });
    };
    const onUp = () => { dragging.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const headlineSize = slide.headline.length > 70 ? 20 : slide.headline.length > 50 ? 24 : slide.headline.length > 30 ? 28 : 34;

  return (
    <div
      ref={canvasRef}
      id="slide-canvas-main"
      onClick={() => onSelectShape(null)}
      style={{ background: t.bg, width: '100%', aspectRatio: '1/1', position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}`, userSelect: 'none', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Corner brackets */}
      {[['tl','top:14px;left:14px'], ['tr','top:14px;right:14px'], ['bl','bottom:14px;left:14px'], ['br','bottom:14px;right:14px']].map(([k, s]) => (
        <div key={k} style={{ position:'absolute', ...(Object.fromEntries((s as string).split(';').filter(Boolean).map(x => { const [p,v] = x.split(':'); return [p.trim().replace(/-([a-z])/g, (_,c) => c.toUpperCase()), v.trim()]; }))), width:18, height:18,
          borderTop: k.startsWith('b') ? 'none' : `1.5px solid ${t.sub}`,
          borderBottom: k.startsWith('t') ? 'none' : `1.5px solid ${t.sub}`,
          borderLeft: k.endsWith('r') ? 'none' : `1.5px solid ${t.sub}`,
          borderRight: k.endsWith('l') ? 'none' : `1.5px solid ${t.sub}`,
        }} />
      ))}

      {/* Header bar */}
      <div style={{ position:'absolute', top:36, left:32, right:32, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:t.sub, textTransform:'uppercase' }}>{doc.brand} / {doc.category}</span>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:t.sub }}>{String(slide.index).padStart(2,'0')} / {String(doc.slides.length).padStart(2,'0')}</span>
      </div>

      {/* Main content */}
      <div style={{ position:'absolute', top:72, left:32, right:32, bottom:52, display:'flex', flexDirection:'column' }}>
        {/* Eyebrow */}
        <div onClick={() => onFieldClick('eyebrow')} style={{ marginBottom:10, cursor:'text', minHeight:16 }}>
          {editingField === 'eyebrow'
            ? <input autoFocus defaultValue={slide.eyebrow} onBlur={e => onFieldBlur('eyebrow', e.target.value)} onChange={e => onFieldChange('eyebrow', e.target.value)}
                style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:t.accent, textTransform:'uppercase', background:'transparent', border:'none', outline:'none', width:'100%', fontFamily:'inherit' }} />
            : <span style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:t.accent, textTransform:'uppercase', display:'block' }}>{slide.eyebrow || <span style={{opacity:0.3,color:t.sub}}>SUBTÍTULO</span>}</span>
          }
        </div>

        {/* Accent star */}
        <div style={{ fontSize:22, color:t.accent, marginBottom:10, lineHeight:1 }}>✦</div>

        {/* Headline */}
        <div onClick={() => onFieldClick('headline')} style={{ cursor:'text', flex:'none', marginBottom:14 }}>
          {editingField === 'headline'
            ? <textarea autoFocus defaultValue={slide.headline} onBlur={e => onFieldBlur('headline', e.target.value)} onChange={e => onFieldChange('headline', e.target.value)}
                rows={3} style={{ fontSize:headlineSize, fontWeight:900, lineHeight:1.2, color:t.text, background:'transparent', border:'none', outline:'none', width:'100%', resize:'none', fontFamily:'inherit' }} />
            : <h2 style={{ fontSize:headlineSize, fontWeight:900, lineHeight:1.2, color:t.text, margin:0 }}>
                {renderHeadline(slide.headline, slide.accentWord, t.accent, headlineSize)}
              </h2>
          }
        </div>

        {/* Accent line */}
        <div style={{ width:36, height:3, background:t.accent, borderRadius:2, marginBottom:12, flexShrink:0 }} />

        {/* Body */}
        <div onClick={() => onFieldClick('body')} style={{ cursor:'text', flex:1, overflow:'hidden' }}>
          {editingField === 'body'
            ? <textarea autoFocus defaultValue={slide.body} onBlur={e => onFieldBlur('body', e.target.value)} onChange={e => onFieldChange('body', e.target.value)}
                rows={3} style={{ fontSize:13, lineHeight:1.65, color:t.sub, background:'transparent', border:'none', outline:'none', width:'100%', resize:'none', fontFamily:'inherit' }} />
            : <p style={{ fontSize:13, lineHeight:1.65, color:t.sub, margin:0 }}>{slide.body || <span style={{opacity:0.3}}>Texto de desenvolvimento...</span>}</p>
          }
        </div>

        {/* Highlight */}
        {(slide.highlight) && (
          <div onClick={() => onFieldClick('highlight')} style={{ cursor:'text', marginTop:10 }}>
            {editingField === 'highlight'
              ? <input autoFocus defaultValue={slide.highlight} onBlur={e => onFieldBlur('highlight', e.target.value)} onChange={e => onFieldChange('highlight', e.target.value)}
                  style={{ fontSize:13, fontWeight:700, color:t.accent, background:'transparent', border:'none', outline:'none', width:'100%', fontFamily:'inherit' }} />
              : <p style={{ fontSize:13, fontWeight:700, color:t.accent, margin:0 }}>{slide.highlight}</p>
            }
          </div>
        )}

        {/* CTA */}
        {(slide.cta) && (
          <div onClick={() => onFieldClick('cta')} style={{ marginTop:12, cursor:'text' }}>
            {editingField === 'cta'
              ? <input autoFocus defaultValue={slide.cta} onBlur={e => onFieldBlur('cta', e.target.value)} onChange={e => onFieldChange('cta', e.target.value)}
                  style={{ fontSize:13, fontWeight:700, color:t.bg, background:t.accent, border:'none', outline:'none', borderRadius:8, padding:'8px 14px', fontFamily:'inherit' }} />
              : <span style={{ fontSize:13, fontWeight:700, color:t.bg, background:t.accent, borderRadius:8, padding:'8px 14px', display:'inline-block' }}>{slide.cta}</span>
            }
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position:'absolute', bottom:16, left:32, right:32, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:8, fontWeight:700, letterSpacing:2, color:t.sub, textTransform:'uppercase' }}>{doc.brand}</span>
        <span style={{ fontSize:8, fontWeight:700, letterSpacing:2, color:t.sub, textTransform:'uppercase' }}>ARRASTA +</span>
      </div>

      {/* Images */}
      {(slide.images || []).map(img => (
        <img key={img.id} src={img.src} alt="" draggable={false}
          style={{ position:'absolute', left:`${img.x}%`, top:`${img.y}%`, width:`${img.w}%`, height:`${img.h}%`, objectFit:'cover', opacity: img.opacity / 100, borderRadius:4, pointerEvents:'none' }} />
      ))}

      {/* Shapes */}
      {slide.shapes.map(shape => (
        <div
          key={shape.id}
          onMouseDown={e => onShapeMouseDown(e, shape.id)}
          style={{
            position:'absolute',
            left:`${shape.x}%`, top:`${shape.y}%`,
            width:`${shape.w}%`,
            height: shape.type === 'line' ? `${shape.strokeWidth}px` : `${shape.h}%`,
            background: shape.type === 'line' ? 'transparent' : shape.fill,
            border: shape.type === 'line' ? `${shape.strokeWidth}px solid ${shape.stroke}` : shape.stroke !== 'transparent' ? `${shape.strokeWidth}px solid ${shape.stroke}` : 'none',
            borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'line' ? 0 : `${shape.radius}px`,
            opacity: shape.opacity / 100,
            cursor:'move',
            boxSizing:'border-box',
            outline: selected === shape.id ? '2px solid #4A9EFF' : 'none',
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}

function Thumbnail({ slide, doc, palette, active, onClick }: { slide: Slide; doc: SlideDoc; palette: PaletteKey; active: boolean; onClick: () => void }) {
  const t = PALETTES[palette];
  return (
    <button onClick={onClick} style={{ background:t.bg, border: active ? '2px solid #4A9EFF' : `2px solid ${t.border}`, borderRadius:8, padding:'8px', width:'100%', aspectRatio:'1/1', display:'flex', flexDirection:'column', gap:3, cursor:'pointer', overflow:'hidden', position:'relative' }}>
      <div style={{ width:10, height:2, background:t.accent, borderRadius:1 }} />
      {slide.eyebrow && <div style={{ width:'55%', height:2.5, background:t.accent, borderRadius:1, opacity:0.8 }} />}
      <div style={{ width:14, height:2.5, background:t.text, borderRadius:1, opacity:0.3, fontSize:6 }}>✦</div>
      <div style={{ width:'90%', height:4, background:t.text, borderRadius:1, opacity:0.8 }} />
      <div style={{ width:'70%', height:4, background:t.text, borderRadius:1, opacity:0.6 }} />
      <div style={{ width:'100%', height:2.5, background:t.sub, borderRadius:1, opacity:0.4, marginTop:2 }} />
      <div style={{ position:'absolute', bottom:5, right:6, fontSize:8, color:t.sub, fontWeight:700 }}>{slide.index}/{doc.slides.length}</div>
    </button>
  );
}

export default function ContentEditor() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [doc, setDoc] = useState<SlideDoc | null>(null);
  const [title, setTitle] = useState('');
  const [current, setCurrent] = useState(0);
  const [palette, setPalette] = useState<PaletteKey>('cream');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BASE}/content/${id}`).then(r => r.json()).then((data: any) => {
      setTitle(data.title);
      let parsed: any;
      const raw = typeof data.slides === 'string' ? JSON.parse(data.slides) : data.slides;
      if (raw && raw.slides) {
        parsed = raw;
      } else if (Array.isArray(raw)) {
        parsed = { category: 'CONTEÚDO', brand: data.persona?.name?.toUpperCase() || 'MARCA', slides: raw.map((s: any) => ({ ...s, accentWord: s.accentWord || '', shapes: s.shapes || [], images: s.images || [] })) };
      } else {
        parsed = { category: 'CONTEÚDO', brand: 'MARCA', slides: [] };
      }
      setDoc(parsed);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const updateSlideField = (idx: number, field: string, value: string) => {
    setDoc(prev => { if (!prev) return prev; const slides = prev.slides.map((s, i) => i === idx ? { ...s, [field]: value } : s); return { ...prev, slides }; });
    setSaved(false);
  };

  const updateShape = (shapeId: string, delta: Partial<Shape>) => {
    setDoc(prev => { if (!prev) return prev; const slides = prev.slides.map((s, i) => i === current ? { ...s, shapes: s.shapes.map(sh => sh.id === shapeId ? { ...sh, ...delta } : sh) } : s); return { ...prev, slides }; });
    setSaved(false);
  };

  const addShape = (type: 'rect' | 'circle' | 'line') => {
    const t = PALETTES[palette];
    const shape: Shape = { id: uid(), type, x: 55, y: 55, w: 25, h: type === 'line' ? 2 : 20, fill: t.accent, stroke: 'transparent', strokeWidth: 1, radius: type === 'rect' ? 12 : 0, opacity: 100 };
    setDoc(prev => { if (!prev) return prev; const slides = prev.slides.map((s, i) => i === current ? { ...s, shapes: [...s.shapes, shape] } : s); return { ...prev, slides }; });
    setSelectedShape(shape.id);
    setSaved(false);
  };

  const removeShape = (shapeId: string) => {
    setDoc(prev => { if (!prev) return prev; const slides = prev.slides.map((s, i) => i === current ? { ...s, shapes: s.shapes.filter(sh => sh.id !== shapeId) } : s); return { ...prev, slides }; });
    setSelectedShape(null);
    setSaved(false);
  };

  const addSlide = () => {
    if (!doc) return;
    const ns: Slide = { index: doc.slides.length + 1, eyebrow: '', headline: 'Novo slide', accentWord: '', body: '', highlight: '', cta: '', shapes: [], images: [] };
    setDoc(prev => prev ? { ...prev, slides: [...prev.slides, ns] } : prev);
    setCurrent(doc.slides.length);
    setSaved(false);
  };

  const removeSlide = (idx: number) => {
    if (!doc || doc.slides.length <= 1) return;
    const updated = doc.slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, index: i + 1 }));
    setDoc(prev => prev ? { ...prev, slides: updated } : prev);
    setCurrent(c => Math.min(c, updated.length - 1));
    setSaved(false);
  };

  const save = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/content/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, slides: JSON.stringify(doc) }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const copySlide = () => {
    if (!doc) return;
    const s = doc.slides[current];
    navigator.clipboard.writeText([s.eyebrow, s.headline, s.body, s.highlight, s.cta].filter(Boolean).join('\n\n'));
  };

  const addImage = (src: string) => {
    const img: ImgEl = { id: uid(), src, x: 30, y: 50, w: 35, h: 30, opacity: 100 };
    setDoc(prev => { if (!prev) return prev; const slides = prev.slides.map((s, i) => i === current ? { ...s, images: [...(s.images || []), img] } : s); return { ...prev, slides }; });
    setSaved(false);
  };

  const handleImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) addImage(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const [exporting, setExporting] = useState(false);

  const exportSlide = async (format: 'png' | 'pdf') => {
    const el = document.getElementById('slide-canvas-main');
    if (!el || exporting) return;
    setExporting(true);
    try {
      const h2c = (await import('html2canvas')).default;
      const cvs = await h2c(el, { scale: 2, useCORS: true, logging: false });
      const dataUrl = cvs.toDataURL('image/png');
      if (format === 'png') {
        const a = document.createElement('a');
        a.download = `${title || 'slide'}-${current + 1}.png`;
        a.href = dataUrl;
        a.click();
      } else {
        const { jsPDF } = await import('jspdf');
        const w = cvs.width / 2; const h = cvs.height / 2;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [w, h] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
        pdf.save(`${title || 'slide'}-${current + 1}.pdf`);
      }
    } catch (e) { console.error('Export error:', e); }
    setExporting(false);
  };

  const exportAllPDF = async () => {
    if (!doc || exporting) return;
    setExporting(true);
    const origSlide = current;
    try {
      const h2c = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      let pdf: InstanceType<typeof jsPDF> | null = null;
      for (let i = 0; i < doc.slides.length; i++) {
        setCurrent(i);
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const el = document.getElementById('slide-canvas-main');
        if (!el) continue;
        const cvs = await h2c(el, { scale: 2, useCORS: true, logging: false });
        const w = cvs.width / 2; const h = cvs.height / 2;
        const dataUrl = cvs.toDataURL('image/png');
        if (!pdf) { pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [w, h] }); }
        else { pdf.addPage([w, h], 'portrait'); }
        pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      }
      if (pdf) pdf.save(`${title || 'carrossel'}.pdf`);
      setCurrent(origSlide);
    } catch (e) { console.error('Export error:', e); setCurrent(origSlide); }
    setExporting(false);
  };

  const selectedShapeData = doc?.slides[current]?.shapes.find(s => s.id === selectedShape) ?? null;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  if (!doc) return <div className="p-8 text-sm text-gray-400">Conteúdo não encontrado</div>;

  const slide = doc.slides[current];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', margin:'-32px', overflow:'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:48, background:'#fff', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
        <button onClick={() => router.push('/conteudos')} style={{ padding:6, borderRadius:8, border:'none', background:'transparent', cursor:'pointer', color:'#666' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize:12, color:'#aaa', userSelect:'none' }}>← Voltar</span>
        <input value={title} onChange={e => { setTitle(e.target.value); setSaved(false); }} style={{ flex:1, fontSize:13, fontWeight:600, color:'#111', background:'transparent', border:'none', outline:'none' }} />

        {/* Toolbar insert */}
        <div style={{ display:'flex', alignItems:'center', gap:2, padding:'4px 8px', background:'#f8f8f8', borderRadius:8, border:'1px solid #eee' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'#aaa', marginRight:4, letterSpacing:1 }}>INSERIR</span>
          {([['rect', <Square size={14} />], ['circle', <Circle size={14} />], ['line', <Minus size={14} />]] as [any,any][]).map(([type, icon]) => (
            <button key={type} title={type} onClick={() => addShape(type)} style={{ padding:'5px 7px', borderRadius:6, border:'none', background:'transparent', cursor:'pointer', color:'#555', display:'flex', alignItems:'center' }}>
              {icon}
            </button>
          ))}
          <button title="Inserir imagem" onClick={() => imgInputRef.current?.click()} style={{ padding:'5px 7px', borderRadius:6, border:'none', background:'transparent', cursor:'pointer', color:'#555', display:'flex', alignItems:'center' }}>
            <Image size={14} />
          </button>
          <input ref={imgInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display:'none' }} onChange={handleImgFile} />
        </div>
        {/* Export */}
        <div style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 8px', background:'#f8f8f8', borderRadius:8, border:'1px solid #eee' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'#aaa', marginRight:3, letterSpacing:1 }}>EXPORT</span>
          <button onClick={() => exportSlide('png')} disabled={exporting} title="Exportar slide atual como PNG" style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px', borderRadius:6, border:'none', background:'transparent', color:'#555', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            <FileDown size={13} /> PNG
          </button>
          <button onClick={() => exportSlide('pdf')} disabled={exporting} title="Exportar slide atual como PDF" style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px', borderRadius:6, border:'none', background:'transparent', color:'#555', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            <FileDown size={13} /> PDF
          </button>
          <button onClick={exportAllPDF} disabled={exporting} title="Exportar todos os slides como PDF" style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px', borderRadius:6, border:'none', background: exporting ? '#e0e0e0' : '#2563eb', color: exporting ? '#999' : '#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>
            {exporting ? 'Exportando...' : 'PDF Completo'}
          </button>
        </div>

        {/* Palette switcher */}
        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 8px', background:'#f8f8f8', borderRadius:8, border:'1px solid #eee' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'#aaa', marginRight:2, letterSpacing:1 }}>TEMA</span>
          {(Object.entries(PALETTES) as [PaletteKey, any][]).map(([k, v]) => (
            <button key={k} title={k} onClick={() => setPalette(k)} style={{ width:20, height:20, borderRadius:6, background:v.bg, border: palette === k ? '2px solid #4A9EFF' : `2px solid ${v.border}`, cursor:'pointer', transition:'border 0.15s' }} />
          ))}
        </div>

        <span style={{ fontSize:11, color:'#aaa', minWidth:50, textAlign:'center' }}>{current + 1} / {doc.slides.length}</span>

        <button onClick={save} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'none', background: saved ? '#22c55e' : '#2563eb', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? 'Salvo' : 'Salvar'}
        </button>
      </div>

      {/* ── Main area ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* Left: thumbnails */}
        <div style={{ width:112, background:'#f7f7f7', borderRight:'1px solid #eee', display:'flex', flexDirection:'column', gap:10, padding:'12px 8px', overflowY:'auto', flexShrink:0 }}>
          {doc.slides.map((s, i) => (
            <div key={i} style={{ position:'relative' }} className="group">
              <Thumbnail slide={s} doc={doc} palette={palette} active={i === current} onClick={() => setCurrent(i)} />
              {doc.slides.length > 1 && (
                <button onClick={() => removeSlide(i)}
                  style={{ position:'absolute', top:-4, right:-4, width:18, height:18, background:'#ef4444', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center', fontSize:10 }}
                  className="group-hover:!flex"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
          <button onClick={addSlide} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', aspectRatio:'1/1', borderRadius:8, border:'2px dashed #ddd', background:'transparent', cursor:'pointer', color:'#bbb', transition:'border-color 0.15s' }}>
            <Plus size={20} />
          </button>
        </div>

        {/* Center: canvas */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#e8e8e8', padding:'24px', overflow:'hidden' }}>
          <div style={{ width:'100%', maxWidth:480 }}>
            <SlideCanvas
              slide={slide} doc={doc} palette={palette}
              selected={selectedShape} onSelectShape={setSelectedShape}
              onUpdateShape={updateShape}
              editingField={editingField}
              onFieldClick={f => setEditingField(editingField === f ? null : f)}
              onFieldBlur={(f, v) => { updateSlideField(current, f, v); setEditingField(null); }}
              onFieldChange={(f, v) => updateSlideField(current, f, v)}
            />
          </div>

          {/* Navigation */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
              style={{ padding:'6px 10px', borderRadius:'50%', background:'#fff', border:'1px solid #ddd', cursor:'pointer', color:'#555', opacity: current === 0 ? 0.3 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize:12, color:'#666', minWidth:80, textAlign:'center' }}>Slide {current + 1} de {doc.slides.length}</span>
            <button onClick={() => setCurrent(c => Math.min(doc.slides.length - 1, c + 1))} disabled={current === doc.slides.length - 1}
              style={{ padding:'6px 10px', borderRadius:'50%', background:'#fff', border:'1px solid #ddd', cursor:'pointer', color:'#555', opacity: current === doc.slides.length - 1 ? 0.3 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: properties */}
        <div style={{ width:220, background:'#fff', borderLeft:'1px solid #eee', display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>

          {selectedShapeData ? (
            <div style={{ padding:'14px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#333', textTransform:'uppercase', letterSpacing:1 }}>
                  {selectedShapeData.type === 'rect' ? 'Retângulo' : selectedShapeData.type === 'circle' ? 'Círculo' : 'Linha'}
                </span>
                <button onClick={() => removeShape(selectedShapeData.id)} style={{ padding:4, borderRadius:6, border:'none', background:'#fee2e2', cursor:'pointer', color:'#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>

              {[
                { label:'Preenchimento', field:'fill', type:'color' },
                { label:'Borda', field:'stroke', type:'color' },
                { label:'Espessura', field:'strokeWidth', type:'range', min:0, max:8 },
                { label:'Cantos (raio)', field:'radius', type:'range', min:0, max:60 },
                { label:'Opacidade', field:'opacity', type:'range', min:10, max:100 },
                { label:'Posição X', field:'x', type:'range', min:0, max:80 },
                { label:'Posição Y', field:'y', type:'range', min:0, max:80 },
                { label:'Largura', field:'w', type:'range', min:5, max:80 },
                { label:'Altura', field:'h', type:'range', min:2, max:80 },
              ].map(({ label, field, type, min, max }) => (
                <div key={field} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <label style={{ fontSize:10, color:'#888', fontWeight:500 }}>{label}</label>
                    {type === 'range' && <span style={{ fontSize:10, color:'#555', fontWeight:600 }}>{(selectedShapeData as any)[field]}{field === 'opacity' ? '%' : ''}</span>}
                  </div>
                  {type === 'color' ? (
                    <input type="color" value={(selectedShapeData as any)[field] === 'transparent' ? '#ffffff' : (selectedShapeData as any)[field]}
                      onChange={e => updateShape(selectedShapeData.id, { [field]: e.target.value } as any)}
                      style={{ width:'100%', height:28, borderRadius:6, border:'1px solid #eee', cursor:'pointer', padding:2 }} />
                  ) : (
                    <input type="range" min={min} max={max} value={(selectedShapeData as any)[field]}
                      onChange={e => updateShape(selectedShapeData.id, { [field]: Number(e.target.value) } as any)}
                      style={{ width:'100%', accentColor:'#2563eb' }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding:'14px' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'#333', textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Slide {current + 1}</p>

              {/* Doc-level */}
              {[
                { label:'Marca', field:'brand', doc:true },
                { label:'Categoria', field:'category', doc:true },
              ].map(({ label, field }) => (
                <div key={field} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10, color:'#888', fontWeight:500, display:'block', marginBottom:3 }}>{label}</label>
                  <input value={(doc as any)[field] || ''} onChange={e => { setDoc(prev => prev ? { ...prev, [field]: e.target.value } : prev); setSaved(false); }}
                    style={{ width:'100%', fontSize:11, padding:'5px 8px', border:'1px solid #eee', borderRadius:6, outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}

              <div style={{ height:1, background:'#f0f0f0', margin:'10px 0' }} />
              <p style={{ fontSize:10, color:'#bbb', marginBottom:8 }}>Clique em qualquer texto no slide para editar.</p>

              {/* Text fields */}
              {[
                { label:'Subtítulo (eyebrow)', field:'eyebrow' },
                { label:'Palavra destaque', field:'accentWord' },
                { label:'Título', field:'headline', rows:2 },
                { label:'Texto', field:'body', rows:3 },
                { label:'Destaque', field:'highlight' },
                { label:'CTA', field:'cta' },
              ].map(({ label, field, rows }) => (
                <div key={field} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10, color:'#888', fontWeight:500, display:'block', marginBottom:3 }}>{label}</label>
                  {rows ? (
                    <textarea value={(slide as any)[field] || ''} onChange={e => updateSlideField(current, field, e.target.value)}
                      rows={rows} style={{ width:'100%', fontSize:11, padding:'5px 8px', border:'1px solid #eee', borderRadius:6, outline:'none', resize:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
                  ) : (
                    <input value={(slide as any)[field] || ''} onChange={e => updateSlideField(current, field, e.target.value)}
                      style={{ width:'100%', fontSize:11, padding:'5px 8px', border:'1px solid #eee', borderRadius:6, outline:'none', boxSizing:'border-box' }} />
                  )}
                </div>
              ))}

              <button onClick={copySlide} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', padding:'8px', borderRadius:8, border:'1px solid #eee', background:'#f9f9f9', fontSize:11, color:'#555', cursor:'pointer', marginTop:4 }}>
                <Copy size={12} /> Copiar texto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
