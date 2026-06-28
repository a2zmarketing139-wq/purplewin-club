# PurpleWin Club - Dockerfile for Railway.app
FROM oven/bun:latest AS base

WORKDIR /app

# Copy package files first for caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bun x prisma generate

# Build frontend
RUN bun run build

# Expose port
EXPOSE 3000

# Start server
CMD ["bun", "run", "server.ts"]
