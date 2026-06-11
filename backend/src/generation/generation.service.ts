import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenerationService {
  private client: Groq;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.client = new Groq({ apiKey: this.config.get<string>('GROQ_API_KEY') });
  }

  async generate(personaId: string, padraoId: string, theme: string) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    const padrao = await this.prisma.padrao.findUnique({ where: { id: padraoId } });
    if (!persona || !padrao) throw new NotFoundException('Persona ou padrão não encontrado');

    const numSlides = padrao.slides;

    const prompt = `Você é um designer de conteúdo para Instagram e LinkedIn especializado em ${persona.name}.
Crie um carrossel de ${numSlides} slides para redes sociais sobre: "${theme}"
Padrão narrativo: ${padrao.name} — ${padrao.description}

REGRAS DE CONTEÚDO:
- Headlines curtos e impactantes (máximo 8 palavras)
- Em "accentWord": escolha UMA palavra-chave do headline para destacar em cor (pode ser vazia)
- Corpo: máximo 2 frases curtas, direto ao ponto
- Slide 1 (capa): headline de impacto, eyebrow com categoria, sem body longo
- Slides intermediários: 1 insight por slide
- Último slide: CTA de engajamento ("Salva esse post", "Comenta aqui")
- Sem travessões, sem IA-speak, português brasileiro
- "category": máximo 3 palavras em maiúsculas (ex: "GESTÃO TRIBUTÁRIA")
- "brand": nome do ${persona.name} (ex: "FRADEMA", "ARRIGHI", use o contexto do tema)

Retorne SOMENTE JSON válido:
{
  "title": "título do carrossel",
  "category": "CATEGORIA EM MAIÚSCULAS",
  "brand": "NOME DA MARCA",
  "slides": [
    {
      "index": 1,
      "eyebrow": "SUBTÍTULO EM CAPS",
      "headline": "Headline impactante aqui",
      "accentWord": "impactante",
      "body": "Texto de desenvolvimento. Máximo duas frases curtas.",
      "highlight": "",
      "cta": ""
    }
  ]
}`;

    const message = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta inválida da IA');

    const result = JSON.parse(jsonMatch[0]);

    const slidesWithShapes = (result.slides || []).map((s: any) => ({
      ...s,
      accentWord: s.accentWord || '',
      shapes: [],
    }));

    const content = await this.prisma.content.create({
      data: {
        title: result.title,
        theme,
        slides: JSON.stringify({
          category: result.category || 'CONTEÚDO',
          brand: result.brand || persona.name.toUpperCase(),
          slides: slidesWithShapes,
        }),
        personaId,
        padraoId,
        status: 'draft',
      },
    });

    return { ...result, slides: slidesWithShapes, contentId: content.id };
  }
}
