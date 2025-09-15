FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ../src ./src

COPY . .

RUN npm run build

CMD ["node", "./dist/index.js"]

