FROM node:20-alpine

WORKDIR /app

COPY pubkeys/package*.json ./

RUN npm install

COPY src ./src

COPY pubkeys/* ./

RUN npm run build

CMD ["node", "--expose-gc", "./dist/index.js"]

