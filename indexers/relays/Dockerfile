FROM node:20-alpine

WORKDIR /app

COPY relays/package*.json ./

RUN npm install

COPY src ./src

COPY relays/* ./

RUN npm run build

CMD ["node", "--expose-gc", "./dist/index.js"]

