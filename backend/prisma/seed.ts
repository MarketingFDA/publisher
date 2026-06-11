import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.persona.deleteMany();
  await prisma.padrao.deleteMany();

  await prisma.persona.createMany({
    data: [
      { slug: 'contador', name: 'Contador', description: 'Profissionais contábeis, escritórios, BPO fiscal', icon: '📊' },
      { slug: 'advogado', name: 'Advogado', description: 'Escritórios jurídicos, departamentos legais', icon: '⚖️' },
      { slug: 'empresario', name: 'Empresário', description: 'Gestores, donos de empresa, diretores', icon: '💼' },
      { slug: 'arquiteto', name: 'Arquiteto', description: 'Escritórios de arquitetura e engenharia', icon: '🏛️' },
      { slug: 'engenheiro', name: 'Engenheiro', description: 'Engenheiros civis, mecânicos, elétricos', icon: '⚙️' },
      { slug: 'agencia', name: 'Agência', description: 'Agências de marketing, publicidade, social media', icon: '📣' },
    ],
  });

  await prisma.padrao.createMany({
    data: [
      {
        code: 'A',
        name: 'Lista de dicas',
        description: 'N dicas práticas sobre um tema',
        type: 'Carrossel',
        slides: 7,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: false, cta: true }),
      },
      {
        code: 'B',
        name: 'Passo a passo',
        description: 'Processo dividido em etapas numeradas',
        type: 'Carrossel',
        slides: 6,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: true, cta: true }),
      },
      {
        code: 'C',
        name: 'Movimento errado vs certo',
        description: 'Contraste entre erro comum e prática correta',
        type: 'Carrossel',
        slides: 6,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: true, cta: true }),
      },
      {
        code: 'D',
        name: 'Mito vs Verdade',
        description: 'Derruba crenças falsas com fatos reais',
        type: 'Carrossel',
        slides: 6,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: false, cta: true }),
      },
      {
        code: 'E',
        name: 'Número impactante',
        description: 'Dado ou estatística como âncora central',
        type: 'Carrossel',
        slides: 5,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: true, cta: true }),
      },
      {
        code: 'F',
        name: 'Antes e Depois',
        description: 'Transformação ou resultado antes e depois de uma ação',
        type: 'Carrossel',
        slides: 5,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: true, cta: true }),
      },
      {
        code: 'G',
        name: 'Lei que você não sabia',
        description: 'Artigo ou norma pouco conhecida com impacto prático',
        type: 'Carrossel',
        slides: 6,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: true, cta: true }),
      },
      {
        code: 'H',
        name: 'Timeline',
        description: 'Evolução cronológica de um tema ou processo',
        type: 'Carrossel',
        slides: 6,
        structure: JSON.stringify({ eyebrow: true, headline: true, body: true, highlight: false, cta: true }),
      },
    ],
  });

  console.log('Seed concluído: personas e padrões criados.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
