# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /usr/src/app

# Copia só os manifests primeiro para aproveitar cache
COPY package*.json ./

# Instala todas dependências (incluindo dev, necessárias para build)
RUN npm ci

# Copia o resto do código
COPY . .

# Gera build de produção
RUN npm run build


# Etapa 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copia apenas node_modules necessários para rodar
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.js ./

# Definir NODE_ENV produção
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
