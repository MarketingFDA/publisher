'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, Star, Activity, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Content { id: string; title: string; status: string; createdAt: string; persona?: { name: string }; padrao?: { name: string; code: string }; }

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs text-gray-500 w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-6 text-right">{value}</span>
    </div>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#EAB308' : '#EF4444';
  const label = score >= 70 ? 'Saudável' : score >= 40 ? 'Em crescimento' : 'Precisa de atenção';
  return (
    <div className="flex flex-col items-center">
      <div style={{ position: 'relative', width: 120, height: 60, overflow: 'hidden' }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 0 }}>
          <path d="M 10 110 A 50 50 0 0 1 110 110" fill="none" stroke="#f0f0f0" strokeWidth="10" strokeLinecap="round" />
          <path d="M 10 110 A 50 50 0 0 1 110 110" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`} />
        </svg>
      </div>
      <p className="text-3xl font-black mt-1" style={{ color }}>{score}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}

export default function Analiticos() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/content`).then(r => r.json()).then(setContents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-gray-400">Carregando análise...</div>;

  const total = contents.length;
  const published = contents.filter(c => c.status === 'published').length;
  const drafts = total - published;
  const publishRate = total > 0 ? Math.round((published / total) * 100) : 0;

  // Persona breakdown
  const personaMap: Record<string, number> = {};
  contents.forEach(c => { const n = c.persona?.name || 'Sem persona'; personaMap[n] = (personaMap[n] || 0) + 1; });
  const topPersonas = Object.entries(personaMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPersona = topPersonas[0]?.[1] || 1;

  // Pattern breakdown
  const padraoMap: Record<string, number> = {};
  contents.forEach(c => { const n = c.padrao ? `${c.padrao.code} - ${c.padrao.name}` : 'Sem padrão'; padraoMap[n] = (padraoMap[n] || 0) + 1; });
  const topPadroes = Object.entries(padraoMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPadrao = topPadroes[0]?.[1] || 1;

  // Weekly trend (last 8 weeks)
  const weekBuckets: Record<string, number> = {};
  const now = new Date();
  for (let w = 7; w >= 0; w--) {
    const d = new Date(now); d.setDate(d.getDate() - w * 7);
    const key = `Sem ${8 - w}`;
    weekBuckets[key] = 0;
  }
  contents.forEach(c => {
    const d = new Date(c.createdAt); const diff = Math.floor((now.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (diff <= 7) { const key = `Sem ${8 - diff}`; if (weekBuckets[key] !== undefined) weekBuckets[key]++; }
  });
  const maxWeek = Math.max(...Object.values(weekBuckets), 1);

  // Last 7 days
  const recent7 = contents.filter(c => { const d = new Date(c.createdAt); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length;
  const avgPerWeek = total > 0 ? (total / Math.max(1, Math.ceil((now.getTime() - new Date(contents[contents.length - 1]?.createdAt || now).getTime()) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1) : '0';

  // Customer Success Score
  const activation = total > 0 ? 25 : 0;
  const adoption = topPersonas.length > 1 ? 20 : topPersonas.length === 1 ? 10 : 0;
  const engagement = recent7 > 3 ? 25 : recent7 > 0 ? 15 : 0;
  const value = publishRate > 50 ? 20 : publishRate > 20 ? 10 : 0;
  const consistency = total > 5 ? 10 : total > 2 ? 5 : 0;
  const csScore = Math.min(100, activation + adoption + engagement + value + consistency);

  const recommendations: { icon: any; text: string; ok: boolean }[] = [
    { icon: CheckCircle, text: `${total} conteúdo${total !== 1 ? 's' : ''} gerado${total !== 1 ? 's' : ''} no total`, ok: total > 0 },
    { icon: total > 0 ? CheckCircle : AlertCircle, text: total > 0 ? 'Publisher ativado com sucesso' : 'Crie seu primeiro conteúdo para ativar o Publisher', ok: total > 0 },
    { icon: topPersonas.length > 1 ? CheckCircle : AlertCircle, text: topPersonas.length > 1 ? `${topPersonas.length} personas em uso — boa diversificação` : 'Explore mais personas para ampliar o alcance', ok: topPersonas.length > 1 },
    { icon: recent7 > 0 ? CheckCircle : AlertCircle, text: recent7 > 0 ? `${recent7} conteúdo${recent7 !== 1 ? 's' : ''} criado${recent7 !== 1 ? 's' : ''} nos últimos 7 dias` : 'Nenhuma geração nos últimos 7 dias — mantenha a cadência', ok: recent7 > 0 },
    { icon: publishRate > 30 ? CheckCircle : AlertCircle, text: publishRate > 30 ? `${publishRate}% de taxa de publicação — ótimo aproveitamento` : `Apenas ${publishRate}% publicados — publique mais conteúdos`, ok: publishRate > 30 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Análise do Publisher</h1>
        <p className="text-sm text-gray-500 mt-1">Panorama de uso e saúde da plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total gerado', value: total, icon: FileText, color: 'blue', bg: 'bg-blue-50', ic: 'text-blue-600' },
          { label: 'Publicados', value: published, icon: TrendingUp, color: 'green', bg: 'bg-green-50', ic: 'text-green-600' },
          { label: 'Rascunhos', value: drafts, icon: Clock, color: 'yellow', bg: 'bg-yellow-50', ic: 'text-yellow-600' },
          { label: 'Taxa publicação', value: `${publishRate}%`, icon: Activity, color: 'purple', bg: 'bg-purple-50', ic: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={17} className={ic} />
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Customer Success Score */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Award size={15} className="text-yellow-500" />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Publisher Health Score</p>
          </div>
          <p className="text-xs text-gray-400 mb-4">Avaliação de Customer Success</p>
          <ScoreMeter score={csScore} />
          <div className="mt-4 space-y-1.5">
            {[
              { label: 'Ativação', v: activation, max: 25 },
              { label: 'Adoção', v: adoption, max: 20 },
              { label: 'Engajamento', v: engagement, max: 25 },
              { label: 'Valor gerado', v: value, max: 20 },
              { label: 'Consistência', v: consistency, max: 10 },
            ].map(({ label, v, max }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-24">{label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${(v / max) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500">{v}/{max}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personas */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-blue-500" />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Personas Mais Usadas</p>
          </div>
          {topPersonas.length > 0 ? topPersonas.map(([name, count]) => (
            <Bar key={name} label={name} value={count} max={maxPersona} color="#3B82F6" />
          )) : <p className="text-xs text-gray-400">Nenhum dado ainda</p>}
        </div>

        {/* Patterns */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-yellow-500" />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Padrões Mais Usados</p>
          </div>
          {topPadroes.length > 0 ? topPadroes.map(([name, count]) => (
            <Bar key={name} label={name} value={count} max={maxPadrao} color="#EAB308" />
          )) : <p className="text-xs text-gray-400">Nenhum dado ainda</p>}
        </div>
      </div>

      {/* Weekly trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-green-500" />
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tendência de Geração</p>
          </div>
          <span className="text-xs text-gray-400">{avgPerWeek} conteúdos/semana em média</span>
        </div>
        <div className="flex items-end gap-2 h-24">
          {Object.entries(weekBuckets).map(([week, count]) => (
            <div key={week} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-blue-500 transition-all" style={{ height: `${(count / maxWeek) * 72}px`, minHeight: count > 0 ? 4 : 0, opacity: count > 0 ? 1 : 0.15 }} />
              <span className="text-xs text-gray-400">{week.replace('Sem ', 'S')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={15} className="text-blue-500" />
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Diagnóstico e Recomendações</p>
        </div>
        <div className="space-y-3">
          {recommendations.map(({ icon: Icon, text, ok }, i) => (
            <div key={i} className="flex items-start gap-3">
              <Icon size={15} className={ok ? 'text-green-500 mt-0.5 shrink-0' : 'text-yellow-500 mt-0.5 shrink-0'} />
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
