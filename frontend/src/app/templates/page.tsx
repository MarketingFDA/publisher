'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const PALETTES: Record<string, { bg: string; text: string; accent: string; sub: string }> = {
  cream: { bg: '#F5EFE6', text: '#1A1A1A', accent: '#C0392B', sub: '#888' },
  dark:  { bg: '#0D0D10', text: '#FFFFFF', accent: '#C9A840', sub: '#666' },
  blue:  { bg: '#0A1628', text: '#FFFFFF', accent: '#4A9EFF', sub: '#4A6080' },
  white: { bg: '#FFFFFF', text: '#111',    accent: '#6C47FF', sub: '#999' },
  rose:  { bg: '#FDF0F0', text: '#1A1A1A', accent: '#E91E8C', sub: '#999' },
  green: { bg: '#0E1F1A', text: '#FFFFFF', accent: '#2ECC71', sub: '#2a4a40' },
};
type PKey = keyof typeof PALETTES;

interface TSlide { eyebrow: string; headline: string; accentWord: string; body: string; highlight: string; cta: string; }
interface Template { id: string; name: string; desc: string; category: string; palette: PKey; slides: TSlide[]; }

const TEMPLATES: Template[] = [
  {
    id: 'lancamento', name: 'Lançamento', desc: 'Apresente um produto, serviço ou novidade', category: 'Negócios', palette: 'dark',
    slides: [
      { eyebrow: 'NOVIDADE', headline: 'Título do seu lançamento aqui', accentWord: 'lançamento', body: '', highlight: '', cta: '' },
      { eyebrow: 'O PROBLEMA', headline: 'A dor que você resolve', accentWord: 'dor', body: 'Descreva o problema que seu público enfrenta hoje. Seja específico.', highlight: '', cta: '' },
      { eyebrow: 'A SOLUÇÃO', headline: 'Como você resolve isso', accentWord: 'resolve', body: 'Apresente sua solução de forma clara e direta. O que muda?', highlight: '', cta: '' },
      { eyebrow: 'DIFERENCIAIS', headline: '3 razões para escolher', accentWord: 'escolher', body: '1. Diferencial A\n2. Diferencial B\n3. Diferencial C', highlight: '', cta: '' },
      { eyebrow: 'RESULTADO', headline: 'O que você vai conquistar', accentWord: 'conquistar', body: 'Descreva o resultado esperado para o cliente após usar sua solução.', highlight: '', cta: '' },
      { eyebrow: 'PRÓXIMO PASSO', headline: 'Comece agora', accentWord: 'agora', body: '', highlight: 'Link na bio', cta: 'Quero saber mais' },
    ],
  },
  {
    id: 'dicas', name: 'Dicas Práticas', desc: '5 dicas sobre um tema relevante', category: 'Educação', palette: 'cream',
    slides: [
      { eyebrow: 'GUIA PRÁTICO', headline: '5 dicas de [tema] que ninguém te conta', accentWord: 'ninguém', body: '', highlight: '', cta: '' },
      { eyebrow: 'DICA 01', headline: 'Primeira dica aqui', accentWord: '', body: 'Detalhe a dica. Seja prático e direto. Máximo duas frases.', highlight: '', cta: '' },
      { eyebrow: 'DICA 02', headline: 'Segunda dica aqui', accentWord: '', body: 'Detalhe a dica. Seja prático e direto. Máximo duas frases.', highlight: '', cta: '' },
      { eyebrow: 'DICA 03', headline: 'Terceira dica aqui', accentWord: '', body: 'Detalhe a dica. Seja prático e direto. Máximo duas frases.', highlight: '', cta: '' },
      { eyebrow: 'DICA 04', headline: 'Quarta dica aqui', accentWord: '', body: 'Detalhe a dica. Seja prático e direto. Máximo duas frases.', highlight: '', cta: '' },
      { eyebrow: 'BÔNUS', headline: 'Dica bônus que transforma', accentWord: 'transforma', body: 'Detalhe a dica bônus. Salva e compartilha com quem precisa.', highlight: '', cta: 'Salva esse post' },
    ],
  },
  {
    id: 'estatistica', name: 'Estatística de Impacto', desc: 'Use um dado para gerar autoridade', category: 'Dados', palette: 'blue',
    slides: [
      { eyebrow: 'VOCÊ SABIA?', headline: 'XX% das empresas cometem esse erro', accentWord: 'erro', body: '', highlight: '', cta: '' },
      { eyebrow: 'O CONTEXTO', headline: 'Por que esse número importa', accentWord: 'importa', body: 'Explique de onde vem esse dado e por que ele é relevante para o seu público.', highlight: '', cta: '' },
      { eyebrow: 'O IMPACTO', headline: 'O que esse erro custa', accentWord: 'custa', body: 'Detalhe as consequências práticas desse comportamento ou situação.', highlight: 'Tempo, dinheiro ou reputação', cta: '' },
      { eyebrow: 'A CAUSA', headline: 'Por que isso acontece', accentWord: 'acontece', body: 'Explique a raiz do problema. Normalmente é desconhecimento ou falta de processo.', highlight: '', cta: '' },
      { eyebrow: 'A SOLUÇÃO', headline: 'Como você evita isso', accentWord: 'evita', body: 'Apresente o caminho para resolver. Seja objetivo e prático.', highlight: '', cta: '' },
      { eyebrow: 'PRÓXIMO PASSO', headline: 'Faz assim agora', accentWord: 'agora', body: '', highlight: '', cta: 'Comenta: já passei por isso' },
    ],
  },
  {
    id: 'antes-depois', name: 'Antes e Depois', desc: 'Mostre a transformação do cliente', category: 'Resultados', palette: 'white',
    slides: [
      { eyebrow: 'TRANSFORMAÇÃO', headline: 'De [estado atual] para [estado desejado]', accentWord: 'estado', body: '', highlight: '', cta: '' },
      { eyebrow: 'ANTES', headline: 'Como a situação chegou até aqui', accentWord: '', body: 'Descreva o estado inicial. Use linguagem empática com o leitor.', highlight: 'Situação difícil que todos reconhecem', cta: '' },
      { eyebrow: 'O PONTO DE VIRADA', headline: 'O que mudou tudo', accentWord: 'tudo', body: 'Qual foi a decisão, ferramenta ou estratégia que iniciou a transformação?', highlight: '', cta: '' },
      { eyebrow: 'O PROCESSO', headline: 'Passo a passo da mudança', accentWord: 'mudança', body: '1. Primeiro passo\n2. Segundo passo\n3. Terceiro passo', highlight: '', cta: '' },
      { eyebrow: 'DEPOIS', headline: 'Resultado real alcançado', accentWord: 'real', body: 'Descreva o estado atual com dados ou descrição concreta do resultado.', highlight: 'Resultado específico e mensurável', cta: '' },
      { eyebrow: 'SUA VEZ', headline: 'Você também pode chegar lá', accentWord: 'você', body: '', highlight: '', cta: 'Fala comigo aqui nos comentários' },
    ],
  },
  {
    id: 'tutorial', name: 'Tutorial Passo a Passo', desc: 'Ensine um processo de forma visual', category: 'Educação', palette: 'cream',
    slides: [
      { eyebrow: 'TUTORIAL', headline: 'Como fazer [tarefa] em X passos', accentWord: '', body: 'Arrasta para ver o passo a passo completo.', highlight: '', cta: '' },
      { eyebrow: 'PASSO 01', headline: 'Primeiro passo', accentWord: '', body: 'Descreva o primeiro passo de forma clara. O que fazer, como e por quê.', highlight: 'Dica: atalho ou facilitador', cta: '' },
      { eyebrow: 'PASSO 02', headline: 'Segundo passo', accentWord: '', body: 'Descreva o segundo passo. Inclua o que evitar nessa etapa.', highlight: '', cta: '' },
      { eyebrow: 'PASSO 03', headline: 'Terceiro passo', accentWord: '', body: 'Descreva o terceiro passo. Este costuma ser o mais crítico.', highlight: '', cta: '' },
      { eyebrow: 'PASSO 04', headline: 'Quarto passo', accentWord: '', body: 'Descreva o quarto passo. Como saber se está certo?', highlight: '', cta: '' },
      { eyebrow: 'PRONTO!', headline: 'Resultado esperado', accentWord: 'resultado', body: 'Descreva o que acontece quando o processo é feito corretamente.', highlight: '', cta: 'Salva e tenta agora' },
    ],
  },
  {
    id: 'mito-verdade', name: 'Mito vs Verdade', desc: 'Quebre crenças falsas com fatos', category: 'Autoridade', palette: 'rose',
    slides: [
      { eyebrow: 'DESMISTIFICANDO', headline: 'Tudo que você acredita sobre [tema] está errado', accentWord: 'errado', body: '', highlight: '', cta: '' },
      { eyebrow: 'MITO 01', headline: 'Crença falsa número um', accentWord: 'falsa', body: 'Detalhe o mito. Por que as pessoas acreditam nisso?', highlight: '❌ Isso não é verdade', cta: '' },
      { eyebrow: 'VERDADE 01', headline: 'O que realmente acontece', accentWord: 'realmente', body: 'Apresente a verdade com embasamento. Dados ou experiência prática.', highlight: '✓ A verdade é essa', cta: '' },
      { eyebrow: 'MITO 02', headline: 'Segunda crença equivocada', accentWord: 'equivocada', body: 'Detalhe o segundo mito. Qual é o risco de acreditar nisso?', highlight: '❌ Cuidado com isso', cta: '' },
      { eyebrow: 'VERDADE 02', headline: 'Como funciona de verdade', accentWord: 'verdade', body: 'Apresente a perspectiva correta com clareza.', highlight: '✓ Assim funciona', cta: '' },
      { eyebrow: 'CONCLUSÃO', headline: 'Agora você sabe a diferença', accentWord: 'diferença', body: '', highlight: '', cta: 'Salva para não esquecer' },
    ],
  },
  {
    id: 'case', name: 'Case de Sucesso', desc: 'Conte um resultado real ou fictício', category: 'Prova Social', palette: 'dark',
    slides: [
      { eyebrow: 'CASE REAL', headline: 'Como [empresa/pessoa] triplicou resultados', accentWord: 'triplicou', body: '', highlight: '', cta: '' },
      { eyebrow: 'O DESAFIO', headline: 'Qual era o problema', accentWord: 'problema', body: 'Descreva o desafio enfrentado. Contexto, tamanho do impacto, urgência.', highlight: '', cta: '' },
      { eyebrow: 'A ESTRATÉGIA', headline: 'O que foi feito', accentWord: 'feito', body: 'Descreva a solução aplicada. Etapas, ferramentas, decisões.', highlight: '', cta: '' },
      { eyebrow: 'RESULTADO', headline: 'Números que comprovam', accentWord: 'comprovam', body: 'X% de aumento\nR$ X economizados\nX dias de implementação', highlight: 'Resultado em 90 dias', cta: '' },
      { eyebrow: 'APRENDIZADO', headline: 'O que esse case ensina', accentWord: 'ensina', body: 'Qual é o insight transferível para o seu leitor?', highlight: '', cta: '' },
      { eyebrow: 'PRÓXIMO PASSO', headline: 'Você quer um resultado assim?', accentWord: 'resultado', body: '', highlight: '', cta: 'Fala comigo no Direct' },
    ],
  },
  {
    id: 'checklist', name: 'Checklist', desc: 'Lista de verificação sobre qualquer tema', category: 'Ferramentas', palette: 'green',
    slides: [
      { eyebrow: 'CHECKLIST', headline: 'X coisas para verificar antes de [ação]', accentWord: 'verificar', body: 'Salva esse post, você vai precisar.', highlight: '', cta: '' },
      { eyebrow: 'ITEM 01 + 02', headline: 'Primeiros dois pontos', accentWord: '', body: '☐ Primeiro item do checklist\n☐ Segundo item do checklist', highlight: '', cta: '' },
      { eyebrow: 'ITEM 03 + 04', headline: 'Próximos dois pontos', accentWord: '', body: '☐ Terceiro item do checklist\n☐ Quarto item do checklist', highlight: '', cta: '' },
      { eyebrow: 'ITEM 05 + 06', headline: 'Itens críticos', accentWord: 'críticos', body: '☐ Quinto item — o mais importante\n☐ Sexto item — frequentemente esquecido', highlight: '', cta: '' },
      { eyebrow: 'BÔNUS', headline: 'Item bônus que faz diferença', accentWord: 'diferença', body: '☐ Item extra que poucos aplicam mas que multiplica o resultado', highlight: '', cta: '' },
      { eyebrow: 'CONCLUÍDO', headline: 'Checklist completo?', accentWord: '', body: '', highlight: 'Marca aqui nos comentários: ✓ Feito', cta: 'Salva para usar depois' },
    ],
  },
  {
    id: 'tendencia', name: 'Tendência de Mercado', desc: 'Posicione-se como referência no setor', category: 'Mercado', palette: 'blue',
    slides: [
      { eyebrow: 'TENDÊNCIA 2025', headline: 'O que vai mudar no [setor] nos próximos meses', accentWord: 'mudar', body: '', highlight: '', cta: '' },
      { eyebrow: 'O CONTEXTO', headline: 'Por que isso está acontecendo', accentWord: 'acontecendo', body: 'Qual é o movimento de mercado, regulatório ou comportamental que está provocando essa mudança?', highlight: '', cta: '' },
      { eyebrow: 'O DADO', headline: 'Números que confirmam', accentWord: 'confirmam', body: 'Insira dados, pesquisas ou evidências que comprovem essa tendência.', highlight: 'Fonte: [nome da fonte]', cta: '' },
      { eyebrow: 'O IMPACTO', headline: 'Quem vai sentir primeiro', accentWord: 'primeiro', body: 'Quais empresas ou profissionais serão mais afetados? Como e quando?', highlight: '', cta: '' },
      { eyebrow: 'A OPORTUNIDADE', headline: 'Como usar isso a favor', accentWord: 'favor', body: 'Qual é a ação concreta que seu leitor pode tomar agora para se posicionar?', highlight: '', cta: '' },
      { eyebrow: 'AÇÃO', headline: 'Comece antes dos outros', accentWord: 'antes', body: '', highlight: '', cta: 'Comenta: já vi isso chegando' },
    ],
  },
  {
    id: 'aviso', name: 'Aviso Importante', desc: 'Alerte sobre mudança, prazo ou risco', category: 'Urgência', palette: 'rose',
    slides: [
      { eyebrow: 'ATENÇÃO', headline: 'Mudança importante sobre [tema]', accentWord: 'importante', body: 'Isso afeta diretamente você. Arrasta para entender.', highlight: '', cta: '' },
      { eyebrow: 'O QUE MUDOU', headline: 'A situação anterior era assim', accentWord: '', body: 'Descreva como as coisas funcionavam antes da mudança.', highlight: '', cta: '' },
      { eyebrow: 'A MUDANÇA', headline: 'O que entra em vigor', accentWord: 'vigor', body: 'Descreva a nova regra, prazo ou situação com clareza.', highlight: 'Data de início: [data]', cta: '' },
      { eyebrow: 'O IMPACTO', headline: 'Quem é afetado e como', accentWord: 'afetado', body: 'Especifique quem precisa agir e qual é a consequência de não agir.', highlight: '', cta: '' },
      { eyebrow: 'O QUE FAZER', headline: 'Ação necessária agora', accentWord: 'agora', body: '1. Primeiro passo\n2. Segundo passo\n3. Procure orientação especializada', highlight: '', cta: '' },
      { eyebrow: 'PRECISA DE AJUDA?', headline: 'Estamos prontos para orientar', accentWord: 'prontos', body: '', highlight: '', cta: 'Fala comigo aqui' },
    ],
  },
  {
    id: 'citacao', name: 'Citação Impactante', desc: 'Uma frase poderosa como conteúdo', category: 'Inspiração', palette: 'dark',
    slides: [
      { eyebrow: 'REFLEXÃO', headline: '"A frase impactante que você quer compartilhar"', accentWord: 'impactante', body: '— Autor da citação', highlight: '', cta: '' },
      { eyebrow: 'O CONTEXTO', headline: 'Por que isso importa', accentWord: 'importa', body: 'Explique em que contexto essa citação faz sentido. O que acontecia quando ela foi dita?', highlight: '', cta: '' },
      { eyebrow: 'A LIÇÃO', headline: 'O que podemos aprender', accentWord: 'aprender', body: 'Qual é o princípio ou insight que essa frase carrega para o seu público?', highlight: '', cta: '' },
      { eyebrow: 'APLICAÇÃO', headline: 'Como usar no dia a dia', accentWord: 'usar', body: 'Traga exemplos práticos de como esse princípio se aplica no contexto do seu público.', highlight: '', cta: '' },
      { eyebrow: 'NA PRÁTICA', headline: 'Um exercício para hoje', accentWord: 'hoje', body: 'Proponha uma ação concreta que o leitor pode fazer hoje com base nessa reflexão.', highlight: '', cta: '' },
      { eyebrow: 'SUA VEZ', headline: 'Qual citação te guia?', accentWord: 'guia', body: '', highlight: '', cta: 'Comenta a sua aqui embaixo' },
    ],
  },
  {
    id: 'comparacao', name: 'Comparação', desc: 'Compare duas abordagens ou soluções', category: 'Decisão', palette: 'white',
    slides: [
      { eyebrow: 'COMPARATIVO', headline: '[Opção A] vs [Opção B]: qual escolher?', accentWord: 'qual', body: 'Você vai entender a diferença de uma vez por todas.', highlight: '', cta: '' },
      { eyebrow: 'OPÇÃO A', headline: 'Como a opção A funciona', accentWord: '', body: 'Descreva a primeira opção. Vantagens, para quem é indicada.', highlight: 'Melhor para: [perfil A]', cta: '' },
      { eyebrow: 'OPÇÃO B', headline: 'Como a opção B funciona', accentWord: '', body: 'Descreva a segunda opção. Vantagens, para quem é indicada.', highlight: 'Melhor para: [perfil B]', cta: '' },
      { eyebrow: 'DIFERENÇAS', headline: 'O que muda na prática', accentWord: 'prática', body: 'Custo, prazo, complexidade, resultado esperado. Seja específico.', highlight: '', cta: '' },
      { eyebrow: 'RECOMENDAÇÃO', headline: 'Nossa indicação', accentWord: 'indicação', body: 'Com base em X anos de experiência, se X então A. Se Y então B.', highlight: '', cta: '' },
      { eyebrow: 'DÚVIDAS?', headline: 'Te ajudo a escolher o certo', accentWord: 'certo', body: '', highlight: '', cta: 'Comenta: qual é o seu caso?' },
    ],
  },
];

function MiniSlide({ slide, palette }: { slide: TSlide; palette: PKey }) {
  const t = PALETTES[palette];
  const hl = slide.headline;
  const acc = slide.accentWord;
  const parts = acc ? hl.split(new RegExp(`(${acc})`, 'gi')) : [hl];
  return (
    <div style={{ background: t.bg, width: '100%', aspectRatio: '1/1', borderRadius: 8, padding: '10px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', border: `1px solid rgba(0,0,0,0.06)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 5, fontWeight: 700, color: t.sub, letterSpacing: 1, textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>MARCA / CAT</div>
        <div style={{ fontSize: 5, color: t.sub }}>0{slide.eyebrow ? 1 : 2}/06</div>
      </div>
      <div style={{ width: 8, height: 1.5, background: t.accent, borderRadius: 1, marginBottom: 5 }} />
      {slide.eyebrow && <div style={{ fontSize: 5, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{slide.eyebrow.slice(0,20)}</div>}
      <div style={{ fontSize: 6, color: t.text, marginBottom: 3 }}>✦</div>
      <div style={{ fontSize: slide.headline.length > 30 ? 7 : 9, fontWeight: 900, color: t.text, lineHeight: 1.2, flex: 1 }}>
        {parts.map((p, i) => p.toLowerCase() === acc?.toLowerCase() ? <span key={i} style={{ color: t.accent, fontStyle: 'italic' }}>{p}</span> : <span key={i}>{p}</span>)}
      </div>
      {slide.body && <div style={{ fontSize: 5.5, color: t.sub, lineHeight: 1.4, marginTop: 4 }}>{slide.body.slice(0, 60)}</div>}
      {slide.cta && <div style={{ marginTop: 'auto', paddingTop: 6 }}><span style={{ fontSize: 5, fontWeight: 700, color: t.bg, background: t.accent, borderRadius: 4, padding: '2px 5px' }}>{slide.cta}</span></div>}
      <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 4, color: t.sub, textTransform: 'uppercase', letterSpacing: 1 }}>MARCA</div>
        <div style={{ fontSize: 4, color: t.sub, textTransform: 'uppercase', letterSpacing: 1 }}>ARRASTA +</div>
      </div>
    </div>
  );
}

export default function Templates() {
  const router = useRouter();
  const [preview, setPreview] = useState<Template | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)));

  const useTemplate = (t: Template) => {
    localStorage.setItem('pending_template', JSON.stringify(t));
    router.push('/conteudos/novo');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">{TEMPLATES.length} templates prontos para usar</p>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{cat}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {TEMPLATES.filter(t => t.category === cat).map(tpl => (
              <button key={tpl.id} onClick={() => { setPreview(tpl); setPreviewIdx(0); }}
                className="group bg-white rounded-xl border border-gray-100 p-3 text-left hover:border-blue-300 hover:shadow-md transition-all">
                <div className="mb-3 overflow-hidden rounded-lg">
                  <MiniSlide slide={tpl.slides[0]} palette={tpl.palette} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{tpl.desc}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-400">{tpl.slides.length} slides</span>
                    <span className="text-xs text-gray-200 mx-1">·</span>
                    <span className="w-3 h-3 rounded-full inline-block border border-gray-100" style={{ background: PALETTES[tpl.palette].bg }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{preview.name}</h3>
                <p className="text-xs text-gray-400">{preview.desc} · {preview.slides.length} slides</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-gray-50"><X size={16} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setPreviewIdx(i => Math.max(0, i - 1))} disabled={previewIdx === 0}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                <div className="flex-1">
                  <MiniSlide slide={preview.slides[previewIdx]} palette={preview.palette} />
                </div>
                <button onClick={() => setPreviewIdx(i => Math.min(preview.slides.length - 1, i + 1))} disabled={previewIdx === preview.slides.length - 1}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
              <div className="flex justify-center gap-1 mb-5">
                {preview.slides.map((_, i) => (
                  <button key={i} onClick={() => setPreviewIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === previewIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">Slide {previewIdx + 1} de {preview.slides.length}</p>
              <button onClick={() => useTemplate(preview)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                <Zap size={14} /> Usar este template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
