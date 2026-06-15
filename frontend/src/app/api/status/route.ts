import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || null;
  const proxyTarget = backendUrl
    ? `${backendUrl.replace(/\/+$/, '')}/api/v1`
    : 'http://localhost:3001/api/v1 (padrão — BACKEND_URL não configurado)';

  let backendOnline = false;
  let backendError: string | null = null;
  const testUrl = backendUrl
    ? `${backendUrl.replace(/\/+$/, '')}/api/v1/personas`
    : 'http://localhost:3001/api/v1/personas';

  try {
    const res = await fetch(testUrl, { signal: AbortSignal.timeout(5000) });
    backendOnline = res.ok;
    if (!res.ok) backendError = `HTTP ${res.status}`;
  } catch (e: any) {
    backendError = e.message;
  }

  return NextResponse.json({
    ok: backendOnline,
    backend: {
      url: backendUrl ?? '(não definido — usando localhost:3001)',
      testUrl,
      online: backendOnline,
      error: backendError,
    },
    env: {
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL ?? null,
      BACKEND_URL: process.env.BACKEND_URL ?? null,
    },
    fix: backendOnline ? null : 'Defina NEXT_PUBLIC_BACKEND_URL no serviço frontend do Railway com a URL pública do backend (ex: https://meu-backend.up.railway.app)',
  });
}
