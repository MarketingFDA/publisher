// CommonJS seed — executado com: node prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PERSONAS = [
  { slug: 'fradema', name: 'Fradema Consultores Tributários', description: 'Consultoria tributária premium para empresas de médio e grande porte', icon: '🏛️' },
  { slug: 'arrighi', name: 'Arrighi Advogados & Associados', description: 'Escritório full service — PI, tributário, societário, civil, trabalhista', icon: '⚖️' },
  { slug: 'contador', name: 'Contador', description: 'Profissionais contábeis, escritórios, BPO fiscal', icon: '📊' },
  { slug: 'empresario', name: 'Empresário', description: 'Gestores, donos de empresa, diretores', icon: '💼' },
  { slug: 'agencia', name: 'Agência de Marketing', description: 'Agências de marketing, publicidade, social media', icon: '📣' },
];

const PADROES = [
  { code: 'A', name: 'Lista de dicas', description: 'N dicas práticas sobre um tema', type: 'Carrossel', slides: 7, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":false,"cta":true}' },
  { code: 'B', name: 'Passo a passo', description: 'Processo dividido em etapas numeradas', type: 'Carrossel', slides: 6, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":true,"cta":true}' },
  { code: 'C', name: 'Errado vs Certo', description: 'Contraste entre erro comum e prática correta', type: 'Carrossel', slides: 6, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":true,"cta":true}' },
  { code: 'D', name: 'Mito vs Verdade', description: 'Derruba crenças falsas com fatos reais', type: 'Carrossel', slides: 6, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":false,"cta":true}' },
  { code: 'E', name: 'Número impactante', description: 'Dado ou estatística como âncora central', type: 'Carrossel', slides: 5, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":true,"cta":true}' },
  { code: 'F', name: 'Antes e Depois', description: 'Transformação ou resultado antes e depois de uma ação', type: 'Carrossel', slides: 5, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":true,"cta":true}' },
  { code: 'G', name: 'Lei que você não sabia', description: 'Artigo ou norma pouco conhecida com impacto prático', type: 'Carrossel', slides: 6, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":true,"cta":true}' },
  { code: 'H', name: 'Timeline', description: 'Evolução cronológica de um tema ou processo', type: 'Carrossel', slides: 6, structure: '{"eyebrow":true,"headline":true,"body":true,"highlight":false,"cta":true}' },
  { code: 'T', name: 'Texto Avulso', description: 'Post de texto único para LinkedIn ou Instagram', type: 'Texto', slides: 1, structure: '{"eyebrow":false,"headline":true,"body":true,"highlight":false,"cta":true}' },
];

function makeSlidesJson(category, brand, slides) {
  return JSON.stringify({ category, brand, slides });
}

async function main() {
  console.log('Iniciando seed...');

  // Upsert personas
  for (const p of PERSONAS) {
    await prisma.persona.upsert({ where: { slug: p.slug }, update: { name: p.name, description: p.description, icon: p.icon }, create: p });
  }
  console.log('Personas: OK');

  // Upsert padroes
  for (const p of PADROES) {
    await prisma.padrao.upsert({ where: { code: p.code }, update: { name: p.name, description: p.description, type: p.type, slides: p.slides, structure: p.structure }, create: p });
  }
  console.log('Padroes: OK');

  // Verificar se ja tem conteudo
  const existingCount = await prisma.content.count();
  if (existingCount > 0) {
    console.log(`Conteudo ja existe (${existingCount} registros). Seed concluido.`);
    return;
  }

  // Buscar IDs das personas e padroes
  const pfradema = await prisma.persona.findUnique({ where: { slug: 'fradema' } });
  const parrighi = await prisma.persona.findUnique({ where: { slug: 'arrighi' } });
  const padraoA = await prisma.padrao.findUnique({ where: { code: 'A' } });
  const padraoD = await prisma.padrao.findUnique({ where: { code: 'D' } });
  const padraoG = await prisma.padrao.findUnique({ where: { code: 'G' } });
  const padraoT = await prisma.padrao.findUnique({ where: { code: 'T' } });

  if (!pfradema || !parrighi || !padraoA || !padraoD || !padraoG || !padraoT) {
    console.log('Erro: personas ou padroes nao encontrados após upsert.');
    return;
  }

  // Conteudo 1 — Fradema / Lista de dicas / Split Payment
  await prisma.content.create({
    data: {
      title: 'Split Payment: o que sua empresa precisa saber',
      theme: 'Split Payment na Reforma Tributária — impacto no fluxo de caixa',
      status: 'published',
      personaId: pfradema.id,
      padraoId: padraoA.id,
      slides: makeSlidesJson('REFORMA TRIBUTÁRIA', 'FRADEMA', [
        { index: 1, eyebrow: 'REFORMA TRIBUTÁRIA', headline: 'Split Payment chegou. Você está pronto?', accentWord: 'pronto', body: 'O pagamento automático de tributos muda o fluxo de caixa das empresas. Entenda o impacto.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 2, eyebrow: 'O QUE É', headline: 'O tributo sai na hora da venda', accentWord: 'hora', body: 'Com o Split Payment, a cada nota emitida o valor dos tributos é retido diretamente pelo sistema de pagamentos.', highlight: 'Sem etapas manuais.', cta: '', shapes: [], images: [] },
        { index: 3, eyebrow: 'IMPACTO NO CAIXA', headline: 'Seu capital de giro vai encolher', accentWord: 'encolher', body: 'Empresas que antes pagavam tributos mensalmente agora perdem liquidez no ato da venda.', highlight: 'Revise sua projeção de caixa.', cta: '', shapes: [], images: [] },
        { index: 4, eyebrow: 'QUEM É AFETADO', headline: 'Começa pelo Lucro Real em 2026', accentWord: 'Lucro Real', body: 'A implantação será gradual. Empresas do Lucro Real entram primeiro, seguidas pelas demais.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 5, eyebrow: 'ATENÇÃO', headline: 'Créditos de CBS e IBS em tempo real', accentWord: 'tempo real', body: 'O lado positivo: os créditos tributários também serão reconhecidos automaticamente, acelerando o aproveitamento.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 6, eyebrow: 'O QUE FAZER', headline: 'Renegocie prazos e revise o giro', accentWord: 'Renegocie', body: 'Ajuste limites de crédito, revise contratos com fornecedores e antecipe o planejamento de caixa.', highlight: 'Não espere 2026 para agir.', cta: '', shapes: [], images: [] },
        { index: 7, eyebrow: 'FRADEMA', headline: 'Consultoria para a transição tributária', accentWord: 'transição', body: 'A Fradema acompanha sua empresa na adaptação ao novo sistema. Planejamento preventivo desde já.', highlight: '', cta: 'Fale com a Fradema', shapes: [], images: [] },
      ]),
    },
  });

  // Conteudo 2 — Fradema / Mito vs Verdade / Simples Nacional
  await prisma.content.create({
    data: {
      title: 'Simples Nacional: 5 mitos que custam caro',
      theme: 'Mitos sobre o Simples Nacional e planejamento tributário para PMEs',
      status: 'draft',
      personaId: pfradema.id,
      padraoId: padraoD.id,
      slides: makeSlidesJson('PLANEJAMENTO TRIBUTÁRIO', 'FRADEMA', [
        { index: 1, eyebrow: 'PLANEJAMENTO TRIBUTÁRIO', headline: 'O Simples Nacional não é simples assim', accentWord: 'simples', body: 'Muitas empresas mantêm regimes tributários inadequados por acreditar em mitos. Veja os principais.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 2, eyebrow: 'MITO 1', headline: 'Simples é sempre mais barato', accentWord: 'sempre', body: 'Empresas com muitos créditos de ICMS e IPI podem pagar mais no Simples do que no Lucro Presumido.', highlight: 'Faça a comparação antes.', cta: '', shapes: [], images: [] },
        { index: 3, eyebrow: 'MITO 2', headline: 'Não preciso de contador especializado', accentWord: 'especializado', body: 'Erros de enquadramento e cálculo no Simples Nacional geram autuações milionárias.', highlight: 'Especialização importa.', cta: '', shapes: [], images: [] },
        { index: 4, eyebrow: 'MITO 3', headline: 'Migrar de regime é arriscado', accentWord: 'arriscado', body: 'Com planejamento correto, a migração para Lucro Presumido ou Real pode reduzir a carga em até 40%.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 5, eyebrow: 'MITO 4', headline: 'Limite de faturamento não tem saída', accentWord: 'saída', body: 'Existem estratégias legais de reorganização societária que permitem crescer sem ultrapassar os limites.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 6, eyebrow: 'FRADEMA', headline: 'Diagnóstico tributário gratuito', accentWord: 'gratuito', body: 'Identificamos o regime ideal para a sua empresa. Sem compromisso.', highlight: '', cta: 'Solicite agora', shapes: [], images: [] },
      ]),
    },
  });

  // Conteudo 3 — Arrighi / Lei que você não sabia / IA e PI
  await prisma.content.create({
    data: {
      title: 'IA e Propriedade Intelectual: seus direitos em risco',
      theme: 'Impacto da Inteligência Artificial na proteção de marcas e direitos autorais',
      status: 'published',
      personaId: parrighi.id,
      padraoId: padraoG.id,
      slides: makeSlidesJson('PROPRIEDADE INTELECTUAL', 'ARRIGHI', [
        { index: 1, eyebrow: 'PROPRIEDADE INTELECTUAL', headline: 'A IA pode estar usando sua marca', accentWord: 'marca', body: 'Modelos de IA treinados com dados públicos podem reproduzir logos, textos e criações protegidas sem autorização.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 2, eyebrow: 'O PROBLEMA', headline: 'Treinamento com obras protegidas', accentWord: 'protegidas', body: 'A Lei 9.610/98 (LDA) protege obras desde a criação. Uso sem licença em datasets de IA pode configurar violação.', highlight: 'Art. 29 — licença obrigatória.', cta: '', shapes: [], images: [] },
        { index: 3, eyebrow: 'MARCAS', headline: 'Registro não impede uso indevido pela IA', accentWord: 'indevido', body: 'Ferramentas de geração de imagem podem produzir visuais confusamente similares às marcas registradas.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 4, eyebrow: 'COMO SE PROTEGER', headline: 'Registre tudo. Monitore sempre.', accentWord: 'Monitore', body: 'Registro de marca + monitoramento ativo + notificação extrajudicial são as primeiras linhas de defesa.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 5, eyebrow: 'LEGISLAÇÃO', headline: 'PL 2338/2023 — Regulação da IA no Brasil', accentWord: '2338/2023', body: 'O projeto em tramitação prevê responsabilidade objetiva para desenvolvedores de IA em casos de violação de PI.', highlight: 'Fique atento à aprovação.', cta: '', shapes: [], images: [] },
        { index: 6, eyebrow: 'ARRIGHI', headline: 'Proteja sua marca antes que seja tarde', accentWord: 'tarde', body: 'A Arrighi atua em registro, monitoramento e litígios de PI digital. Consultoria especializada.', highlight: '', cta: 'Fale com a Arrighi', shapes: [], images: [] },
      ]),
    },
  });

  // Conteudo 4 — Arrighi / Lista de dicas / Compliance Trabalhista
  await prisma.content.create({
    data: {
      title: '5 riscos trabalhistas que toda empresa digital enfrenta',
      theme: 'Compliance trabalhista para empresas com equipes remotas e plataformas digitais',
      status: 'draft',
      personaId: parrighi.id,
      padraoId: padraoA.id,
      slides: makeSlidesJson('COMPLIANCE TRABALHISTA', 'ARRIGHI', [
        { index: 1, eyebrow: 'COMPLIANCE TRABALHISTA', headline: 'Sua startup pode estar descumprindo a CLT', accentWord: 'descumprindo', body: 'Equipes remotas, PJs e plataformas criam novos riscos trabalhistas que muitas empresas ignoram.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 2, eyebrow: 'RISCO 1', headline: 'PJ com características de empregado', accentWord: 'empregado', body: 'Subordinação + exclusividade + habitualidade = vínculo empregatício. Mesmo com contrato PJ firmado.', highlight: 'Risco de passivo milionário.', cta: '', shapes: [], images: [] },
        { index: 3, eyebrow: 'RISCO 2', headline: 'Jornada de teletrabalho sem controle', accentWord: 'teletrabalho', body: 'A Reforma Trabalhista permite home office, mas exige política interna clara e controle de jornada documentado.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 4, eyebrow: 'RISCO 3', headline: 'Piso salarial e enquadramento errado', accentWord: 'enquadramento', body: 'Classificação incorreta do CBO e convenção coletiva aplicável geram diferenças salariais retroativas.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 5, eyebrow: 'RISCO 4', headline: 'LGPD e dados dos colaboradores', accentWord: 'dados', body: 'Coleta e tratamento de dados de funcionários sem base legal e política de privacidade geram sanções da ANPD.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 6, eyebrow: 'RISCO 5', headline: 'Falta de política de assédio documentada', accentWord: 'documentada', body: 'Lei 14.457/2022 — canais de denúncia e treinamentos são obrigatórios para empresas com CIPA.', highlight: '', cta: '', shapes: [], images: [] },
        { index: 7, eyebrow: 'ARRIGHI', headline: 'Auditoria trabalhista preventiva', accentWord: 'preventiva', body: 'A Arrighi identifica e elimina passivos trabalhistas antes que virem processos. Agende uma conversa.', highlight: '', cta: 'Solicitar auditoria', shapes: [], images: [] },
      ]),
    },
  });

  console.log('Conteudo pre-gerado: OK (4 registros)');
  console.log('Seed concluido com sucesso.');
}

main().catch(err => { console.error('Seed falhou (nao critico):', err.message || err); }).finally(() => prisma.$disconnect());
