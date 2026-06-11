'use client';
import { useEffect, useState } from 'react';
import { getContents } from '@/lib/api';
import Link from 'next/link';
import { Plus, FileText, TrendingUp, Clock, Lightbulb, ChevronRight, Zap } from 'lucide-react';

const IDEAS = [
  { emoji: '⚡', title: '5 erros que custam caro no Simples Nacional', persona: 'Contador', padrao: 'Lista de dicas', hook: 'Muitos empresários perdem dinheiro por desconhecer essas regras.' },
  { emoji: '📊', title: 'Como montar um relatório de KPI em 14 minutos', persona: 'Empresário', padrao: 'Tutorial', hook: 'Automatize o que antes levava horas.' },
  { emoji: '⚖️', title: 'O artigo da CLT que a maioria ignora', persona: 'Advogado', padrao: 'Lei que você não sabia', hook: 'Esse direito existe desde 2017 e poucos usam.' },
  { emoji: '🏛️', title: 'Antes e depois: projeto entregue com BIM', persona: 'Arquiteto', padrao: 'Antes e Depois', hook: 'Veja como a tecnologia reduziu o prazo em 40%.' },
  { emoji: '📣', title: 'Tendência: IA no atendimento ao cliente B2B', persona: 'Agência', padrao: 'Tendência de Mercado', hook: 'Empresas que adotarem agora sairão na frente.' },
  { emoji: '🔴', title: 'Prazo importante: DCTF web entra em vigor', persona: 'Contador', padrao: 'Aviso Importante', hook: 'Afeta todas as empresas a partir de março.' },
  { emoji: '💼', title: 'Checklist: o que revisar antes de fechar o ano fiscal', persona: 'Empresário', padrao: 'Checklist', hook: 'Evite surpresas na declaração de IR.' },
  { emoji: '⚙️', title: 'Comparativo: laudo vs ART — qual usar?', persona: 'Engenheiro', padrao: 'Comparação', hook: 'Muita confusão sobre isso. Vamos esclarecer.' },
];

export default function Dashboard() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContents().then(setContents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const published = contents.filter(c => c.status === 'published').length;
  const drafts = contents.filter(c => c.status === 'draft').length;
  const recent = contents.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Visão geral da sua produção de conteúdo</p>
        </div>
        <Link href="/conteudos/novo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Novo conteúdo
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total gerado', value: contents.length, Icon: FileText, bg: 'bg-blue-50', ic: 'text-blue-600' },
          { label: 'Publicados', value: published, Icon: TrendingUp, bg: 'bg-green-50', ic: 'text-green-600' },
          { label: 'Rascunhos', value: drafts, Icon: Clock, bg: 'bg-yellow-50', ic: 'text-yellow-600' },
        ].map(({ label, value, Icon, bg, ic }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={16} className={ic} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Recent contents */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Recentes</h2>
            <Link href="/conteudos" className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1">Ver todos <ChevronRight size={12} /></Link>
          </div>
          {loading ? (
            <div className="p-6 text-center text-xs text-gray-400">Carregando...</div>
          ) : recent.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-gray-400 mb-3">Nenhum conteúdo ainda</p>
              <Link href="/conteudos/novo" className="text-xs text-blue-600 font-semibold underline">Criar agora</Link>
            </div>
          ) : (
            <div>
              {recent.map(c => (
                <Link key={c.id} href={`/conteudos/${c.id}`} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{c.title}</p>
                    <p className="text-xs text-gray-400 truncate">{c.theme}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-3 shrink-0 ${c.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {c.status === 'published' ? 'Pub.' : 'Rascunho'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ideas */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <Lightbulb size={15} className="text-yellow-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Ideias Prontas para Criar</h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {IDEAS.map((idea, i) => (
                <Link
                  key={i}
                  href={`/conteudos/novo?idea=${encodeURIComponent(idea.title)}&persona=${encodeURIComponent(idea.persona)}`}
                  className="group flex flex-col gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg">{idea.emoji}</span>
                    <Zap size={12} className="text-gray-300 group-hover:text-blue-400 mt-1 shrink-0 transition-colors" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{idea.title}</p>
                  <p className="text-xs text-gray-400 leading-tight">{idea.hook}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{idea.persona}</span>
                    <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-medium truncate">{idea.padrao}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
