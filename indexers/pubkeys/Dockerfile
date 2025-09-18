FROM node:20-alpine

WORKDIR /app

COPY pubkeys/package*.json ./

RUN npm install

COPY src ./src

COPY pubkeys/* ./

RUN npm run build

CMD ["node", "./dist/index.js"]

