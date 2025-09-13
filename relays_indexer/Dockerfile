FROM node:20-alpine 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=development
ENV TZ=America/Sao_Paulo

CMD ["node", "./dist/index.js"]

