FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
RUN npx vite build
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
