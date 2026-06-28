FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/server.js"]
