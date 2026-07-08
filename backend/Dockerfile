FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY backend/ .
RUN npm run build
# NAO cria banco no build. O SQLite fica no volume persistente (/data/dev.db) e o
# schema + seed rodam UMA VEZ no runtime (startCommand), sobrevivendo a redeploys.
EXPOSE 3001
# startCommand no backend/railway.json sobrescreve este CMD em producao; mantido como fallback.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node prisma/seed.cjs && node dist/src/main"]
