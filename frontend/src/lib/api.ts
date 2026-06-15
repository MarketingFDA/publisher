// Resolve a URL base do backend em ordem de prioridade:
// 1. NEXT_PUBLIC_BACKEND_URL (env var configurada no Railway — sobrescreve tudo)
// 2. Em produção sem env var: URL fixa do backend no Railway
// 3. Em desenvolvimento: proxy Next.js para localhost:3001 (/api/v1)
const RAILWAY_BACKEND = 'https://backend-production-c77b2.up.railway.app';

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NODE_ENV === 'production' ? RAILWAY_BACKEND : null);

const BASE = BACKEND
  ? `${BACKEND.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

export async function getPersonas() {
  const res = await fetch(`${BASE}/personas`);
  if (!res.ok) throw new Error(`personas: ${res.status}`);
  return res.json();
}

export async function getPadroes() {
  const res = await fetch(`${BASE}/padroes`);
  if (!res.ok) throw new Error(`padroes: ${res.status}`);
  return res.json();
}

export async function generateContent(personaId: string, padraoId: string, theme: string) {
  const res = await fetch(`${BASE}/generation/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, padraoId, theme }),
  });
  if (!res.ok) throw new Error('Erro ao gerar conteúdo');
  return res.json();
}

export async function getContents() {
  const res = await fetch(`${BASE}/content`);
  if (!res.ok) throw new Error(`content: ${res.status}`);
  return res.json();
}

export async function deleteContent(id: string) {
  await fetch(`${BASE}/content/${id}`, { method: 'DELETE' });
}

export async function updateContent(id: string, data: { title?: string; slides?: string }) {
  const res = await fetch(`${BASE}/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createTextContent(personaId: string, title: string, body: string) {
  const res = await fetch(`${BASE}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, title, body }),
  });
  if (!res.ok) throw new Error('Erro ao salvar conteúdo');
  return res.json();
}
