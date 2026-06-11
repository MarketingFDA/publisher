'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Printer, Trash2 } from 'lucide-react';

const EVENT_TYPES = {
  meeting:    { label: 'Reunião',        color: '#3B82F6', bg: '#EFF6FF', dot: '●' },
  post:       { label: 'Post/Conteúdo',  color: '#22C55E', bg: '#F0FDF4', dot: '●' },
  reminder:   { label: 'Lembrete',       color: '#EAB308', bg: '#FEFCE8', dot: '●' },
  deadline:   { label: 'Prazo',          color: '#EF4444', bg: '#FEF2F2', dot: '●' },
  annotation: { label: 'Anotação',       color: '#A855F7', bg: '#FAF5FF', dot: '●' },
} as const;
type EventType = keyof typeof EVENT_TYPES;

interface CalEvent { id: string; date: string; title: string; type: EventType; time: string; description: string; }

const uid = () => Math.random().toString(36).slice(2, 9);
const pad = (n: number) => String(n).padStart(2, '0');

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function useEvents() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  useEffect(() => {
    try { setEvents(JSON.parse(localStorage.getItem('cal_events') || '[]')); } catch {}
  }, []);
  const save = (evs: CalEvent[]) => { setEvents(evs); localStorage.setItem('cal_events', JSON.stringify(evs)); };
  const add = (ev: CalEvent) => save([...events, ev]);
  const remove = (id: string) => save(events.filter(e => e.id !== id));
  const update = (ev: CalEvent) => save(events.map(e => e.id === ev.id ? ev : e));
  return { events, add, remove, update };
}

export default function Calendario() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<{ date: string; ev?: CalEvent } | null>(null);
  const [form, setForm] = useState<Partial<CalEvent>>({});
  const calRef = useRef<HTMLDivElement>(null);
  const { events, add, remove, update } = useEvents();

  const eventsOn = (date: string) => events.filter(e => e.date === date);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells: { date: string | null; day: number; faded: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ date: null, day: prevMonthDays - i, faded: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: `${year}-${pad(month + 1)}-${pad(d)}`, day: d, faded: false });
  while (cells.length % 7 !== 0) cells.push({ date: null, day: cells.length - daysInMonth - firstDay + 1, faded: true });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const openAdd = (date: string) => { setModal({ date }); setForm({ date, type: 'meeting', time: '09:00' }); };
  const openEdit = (ev: CalEvent) => { setModal({ date: ev.date, ev }); setForm(ev); };

  const saveForm = () => {
    if (!form.title?.trim()) return;
    if (modal?.ev) update({ ...modal.ev, ...form } as CalEvent);
    else add({ id: uid(), title: '', type: 'meeting', time: '', description: '', ...form } as CalEvent);
    setModal(null);
  };

  const printCal = () => { window.print(); };

  const today = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cal-print { display: block !important; }
          @page { size: A4 landscape; margin: 12mm; }
        }
        #cal-print { display: none; }
        @media print { #cal-print { display: block !important; } }
        .cal-cell:hover { background: #f0f4ff !important; }
        .group:hover .del-btn { display: flex !important; }
      `}</style>

      <div className="max-w-5xl mx-auto print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendário Editorial</h1>
            <p className="text-sm text-gray-500 mt-0.5">Agende reuniões, posts, prazos e anotações</p>
          </div>
          <button onClick={printCal} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Printer size={15} /> Exportar PDF
          </button>
        </div>

        {/* Nav */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <h2 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-50"><ChevronRight size={18} /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const dayEvs = cell.date ? eventsOn(cell.date) : [];
              const isToday = cell.date === today;
              return (
                <div
                  key={i}
                  cal-cell=""
                  onClick={() => cell.date && openAdd(cell.date)}
                  className="cal-cell border-r border-b border-gray-50 min-h-[90px] p-2 cursor-pointer transition-colors"
                  style={{ opacity: cell.faded ? 0.3 : 1 }}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                    {cell.day}
                  </div>
                  <div className="space-y-1">
                    {dayEvs.slice(0, 3).map(ev => (
                      <div key={ev.id} onClick={e => { e.stopPropagation(); openEdit(ev); }}
                        className="group relative flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer"
                        style={{ background: EVENT_TYPES[ev.type].bg, color: EVENT_TYPES[ev.type].color }}>
                        <span className="truncate flex-1">{ev.time && `${ev.time} `}{ev.title}</span>
                        <button className="del-btn hidden absolute right-0 top-0 bottom-0 px-1 rounded-r items-center justify-center"
                          style={{ background: EVENT_TYPES[ev.type].color, color: '#fff' }}
                          onClick={e => { e.stopPropagation(); remove(ev.id); }}>
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                    {dayEvs.length > 3 && <div className="text-xs text-gray-400 pl-1">+{dayEvs.length - 3} mais</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Legenda</p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(EVENT_TYPES).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span style={{ color: val.color }} className="text-sm font-bold">●</span>
                  <span className="text-xs text-gray-600">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{modal.ev ? 'Editar evento' : `Novo evento — ${modal.date}`}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-50"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Título</label>
                <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Reunião de marketing" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo</label>
                  <select value={form.type || 'meeting'} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Horário</label>
                  <input type="time" value={form.time || ''} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Descrição</label>
                <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Detalhes do evento..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-between p-5 border-t border-gray-100">
              {modal.ev && (
                <button onClick={() => { remove(modal.ev!.id); setModal(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  <Trash2 size={14} /> Excluir
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 border border-gray-200">Cancelar</button>
                <button onClick={saveForm} className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">
                  {modal.ev ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print version */}
      <div id="cal-print" className="hidden">
        <div style={{ fontFamily: 'system-ui', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Calendário Editorial — {MONTHS[month]} {year}</h1>
            <div style={{ fontSize: 11, color: '#888' }}>Publisher · Marketing FDA</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#888', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>{d}</div>
            ))}
            {cells.map((cell, i) => (
              <div key={i} style={{ minHeight: 80, padding: '6px 8px', borderRight: i % 7 !== 6 ? '1px solid #f3f4f6' : 'none', borderBottom: '1px solid #f3f4f6', opacity: cell.faded ? 0.3 : 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: cell.date === today ? '#2563eb' : '#374151', marginBottom: 4 }}>{cell.day}</div>
                {cell.date && eventsOn(cell.date).map(ev => (
                  <div key={ev.id} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, marginBottom: 2, background: EVENT_TYPES[ev.type].bg, color: EVENT_TYPES[ev.type].color, fontWeight: 600 }}>
                    {ev.time && `${ev.time} `}{ev.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginRight: 8 }}>LEGENDA:</div>
            {Object.entries(EVENT_TYPES).map(([, v]) => (
              <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 }}>
                <span style={{ color: v.color, fontSize: 12 }}>●</span> {v.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
