FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- imagem final (leve, só produção) ----
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

CMD ["node", "./dist/main.js"]

