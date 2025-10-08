FROM node:20-alpine

WORKDIR /app

COPY notes/package*.json ./

RUN npm install

COPY src ./src

COPY notes/* ./

RUN npm run build

CMD ["node", "--expose-gc", "./dist/index.js"]

