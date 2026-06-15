import type { NextConfig } from "next";

const RAILWAY_BACKEND = 'https://backend-production-c77b2.up.railway.app';

// Resolve backend em ordem de prioridade:
// 1. BACKEND_URL (env var server-side do Railway)
// 2. NEXT_PUBLIC_BACKEND_URL (env var pública, disponível em ambos)
// 3. Em produção sem env var: URL fixa conhecida do Railway
// 4. Desenvolvimento: localhost:3001
const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === 'production' ? RAILWAY_BACKEND : 'http://localhost:3001')
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  devIndicators: { position: 'bottom-left' },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
