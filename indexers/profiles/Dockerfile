FROM node:20-alpine

WORKDIR /app

COPY profiles/package*.json ./

RUN npm install

COPY src ./src

COPY profiles/* ./

RUN npm run build

CMD ["node", "./dist/index.js"]

