const _apiRoot = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const BASE = _apiRoot.endsWith('/api/v1') ? _apiRoot : `${_apiRoot}/api/v1`;

export async function getPersonas() {
  const res = await fetch(`${BASE}/personas`);
  return res.json();
}

export async function getPadroes() {
  const res = await fetch(`${BASE}/padroes`);
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
