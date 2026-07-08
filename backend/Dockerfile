FROM node:20-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY backend/ .
RUN npm run build
# Cria o SQLite com schema + dados demo embutidos na imagem (DB efemero no Railway)
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma db push --skip-generate --accept-data-loss && (node prisma/seed.cjs || true)
EXPOSE 3001
CMD ["node", "dist/src/main"]
