'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPersonas, getPadroes, generateContent, createTextContent } from '@/lib/api';
import { Check, ChevronRight, Loader2, AlignLeft, Layers } from 'lucide-react';

type ContentType = 'carrossel' | 'texto';
type Step = 'tipo' | 'persona' | 'padrao' | 'tema' | 'gerar' | 'escrever';

const CARROSSEL_STEPS: Step[] = ['tipo', 'persona', 'padrao', 'tema', 'gerar'];
const TEXTO_STEPS: Step[] = ['tipo', 'persona', 'escrever'];

const STEP_LABELS: Record<Step, string> = {
  tipo: 'Tipo', persona: 'Persona', padrao: 'Padrão', tema: 'Tema', gerar: 'Gerar', escrever: 'Escrever',
};

export default function NovoConteudo() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>('carrossel');
  const [step, setStep] = useState<Step>('tipo');
  const [personas, setPersonas] = useState<any[]>([]);
  const [padroes, setPadroes] = useState<any[]>([]);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [padraoId, setPadraoId] = useState<string | null>(null);
  const [theme, setTheme] = useState('');
  const [textoTitle, setTextoTitle] = useState('');
  const [textoBody, setTextoBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPersonas().then(setPersonas).catch(() => {});
    getPadroes().then(setPadroes).catch(() => {});
  }, []);

  const STEPS = contentType === 'carrossel' ? CARROSSEL_STEPS : TEXTO_STEPS;
  const stepIndex = STEPS.indexOf(step);

  const goNext = () => setStep(STEPS[stepIndex + 1]);
  const goPrev = () => setStep(STEPS[stepIndex - 1]);

  const selectType = (t: ContentType) => {
    setContentType(t);
    setPersonaId(null);
    setPadraoId(null);
  };

  const handleGenerate = async () => {
    if (!personaId || !padraoId || !theme.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await generateContent(personaId, padraoId, theme);
      router.push(`/conteudos/${data.contentId}`);
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar conteúdo');
      setLoading(false);
    }
  };

  const handleSaveTexto = async () => {
    if (!personaId || !textoBody.trim()) return;
    setLoading(true); setError('');
    try {
      const data = await createTextContent(personaId, textoTitle.trim() || 'Texto avulso', textoBody);
      router.push(`/conteudos/${data.id}`);
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar texto');
      setLoading(false);
    }
  };

  const selectedPersona = personas.find((p) => p.id === personaId);
  const selectedPadrao = padroes.find((p) => p.id === padraoId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Novo conteúdo</h1>
        <p className="text-sm text-gray-500 mt-1">
          {contentType === 'texto' ? 'Escreva um texto avulso para redes sociais' : 'Siga os passos para gerar seu carrossel'}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < stepIndex ? 'bg-blue-600 text-white' :
                i === stepIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < stepIndex ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === stepIndex ? 'text-gray-900' : 'text-gray-400'}`}>{STEP_LABELS[s]}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">

        {/* TIPO */}
        {step === 'tipo' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Que tipo de conteúdo?</h2>
            <p className="text-sm text-gray-500 mb-5">Escolha o formato do conteúdo a criar</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => selectType('carrossel')}
                className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all ${
                  contentType === 'carrossel' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 hover:border-blue-200'
                }`}>
                <Layers size={24} className={contentType === 'carrossel' ? 'text-white' : 'text-blue-600'} />
                <div>
                  <p className={`font-semibold text-sm ${contentType === 'carrossel' ? 'text-white' : 'text-gray-900'}`}>Carrossel</p>
                  <p className={`text-xs mt-0.5 ${contentType === 'carrossel' ? 'text-blue-100' : 'text-gray-400'}`}>Gerado por IA com múltiplos slides</p>
                </div>
              </button>
              <button onClick={() => selectType('texto')}
                className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all ${
                  contentType === 'texto' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 hover:border-blue-200'
                }`}>
                <AlignLeft size={24} className={contentType === 'texto' ? 'text-white' : 'text-blue-600'} />
                <div>
                  <p className={`font-semibold text-sm ${contentType === 'texto' ? 'text-white' : 'text-gray-900'}`}>Texto Avulso</p>
                  <p className={`text-xs mt-0.5 ${contentType === 'texto' ? 'text-blue-100' : 'text-gray-400'}`}>Post de texto para LinkedIn ou Instagram</p>
                </div>
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={goNext}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PERSONA */}
        {step === 'persona' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Para quem é este conteúdo?</h2>
            <p className="text-sm text-gray-500 mb-5">Escolha a marca ou o perfil do público-alvo</p>
            {personas.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">Carregando personas...</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {personas.map((p) => (
                  <button key={p.id} onClick={() => setPersonaId(p.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      personaId === p.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 hover:border-blue-200'
                    }`}>
                    <span className="text-2xl shrink-0">{p.icon}</span>
                    <div>
                      <p className={`font-semibold text-sm ${personaId === p.id ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                      <p className={`text-xs mt-0.5 ${personaId === p.id ? 'text-blue-100' : 'text-gray-400'}`}>{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-between mt-6">
              <button onClick={goPrev} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">Voltar</button>
              <button onClick={goNext} disabled={!personaId}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors">
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ESCREVER — texto avulso */}
        {step === 'escrever' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escreva o texto</h2>
            <p className="text-sm text-gray-500 mb-5">Texto para LinkedIn, Instagram ou outra rede</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Título (opcional)</label>
                <input value={textoTitle} onChange={e => setTextoTitle(e.target.value)}
                  placeholder="Ex: Reforma tributária — o que muda para sua empresa"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Texto</label>
                <textarea value={textoBody} onChange={e => setTextoBody(e.target.value)}
                  placeholder="Escreva o post aqui..." rows={8}
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                <p className="text-xs text-gray-400 mt-1">{textoBody.length} caracteres</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                <span className="text-lg">{selectedPersona?.icon}</span>
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">{selectedPersona?.name}</span> · Texto Avulso
                </p>
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 mt-4">{error}</div>}
            <div className="flex justify-between mt-6">
              <button onClick={goPrev} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">Voltar</button>
              <button onClick={handleSaveTexto} disabled={loading || !textoBody.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-blue-700 transition-colors">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : '✦ Salvar texto'}
              </button>
            </div>
          </div>
        )}

        {/* PADRAO */}
        {step === 'padrao' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha o padrão do carrossel</h2>
            <p className="text-sm text-gray-500 mb-5">Cada padrão tem uma estrutura narrativa diferente</p>
            <div className="grid grid-cols-2 gap-3">
              {padroes.filter(p => p.type !== 'Texto').map((p) => (
                <button key={p.id} onClick={() => setPadraoId(p.id)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-all ${
                    padraoId === p.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-100 hover:border-blue-200'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${padraoId === p.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{p.code}</span>
                    <span className={`text-xs uppercase tracking-wider font-medium ${padraoId === p.id ? 'text-blue-100' : 'text-gray-400'}`}>{p.type}</span>
                  </div>
                  <p className={`font-semibold text-sm ${padraoId === p.id ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  <p className={`text-xs ${padraoId === p.id ? 'text-blue-100' : 'text-gray-400'}`}>{p.description}</p>
                  <p className={`text-xs font-medium mt-1 ${padraoId === p.id ? 'text-blue-200' : 'text-gray-500'}`}>{p.slides} slides</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={goPrev} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">Voltar</button>
              <button onClick={goNext} disabled={!padraoId}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors">
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TEMA */}
        {step === 'tema' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Qual é o tema?</h2>
            <p className="text-sm text-gray-500 mb-5">Descreva o assunto do carrossel com detalhes</p>
            <textarea value={theme} onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: 5 erros de planejamento tributário que custam caro para PMEs no Simples Nacional"
              className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows={4} />
            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
              <span className="text-lg">{selectedPersona?.icon}</span>
              <p className="text-xs text-blue-700">
                <span className="font-semibold">{selectedPersona?.name}</span> · {selectedPadrao?.name} · {selectedPadrao?.slides} slides
              </p>
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={goPrev} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">Voltar</button>
              <button onClick={goNext} disabled={!theme.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors">
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* GERAR */}
        {step === 'gerar' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Tudo pronto</h2>
            <p className="text-sm text-gray-500 mb-5">Revise e clique para gerar o carrossel</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-xl">{selectedPersona?.icon}</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Persona</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPersona?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-400 w-6">{selectedPadrao?.code}</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Padrão</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPadrao?.name} · {selectedPadrao?.slides} slides</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Tema</p>
                <p className="text-sm text-gray-900">{theme}</p>
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 mb-4">{error}</div>}
            <div className="flex justify-between">
              <button onClick={goPrev} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">Voltar</button>
              <button onClick={handleGenerate} disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-blue-700 transition-colors">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Gerando slides...</> : '✦ Gerar carrossel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
