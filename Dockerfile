FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# Install ALL dependencies (including vite, tailwind, esbuild)
ENV NODE_ENV=development
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

# Build frontend
COPY . .
RUN npm run build

# Switch to production for runtime
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
