FROM node:20-slim AS base

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files first for Docker layer caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for prisma)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend with Vite
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start server with Node.js
CMD ["node", "--import", "tsx", "server.ts"]
