FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy prisma schema first — needed if postinstall triggers prisma generate
COPY prisma ./prisma

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (skip postinstall scripts)
RUN npm install --ignore-scripts

# Copy everything else
COPY . .

# Generate Prisma client (schema is now available at ./prisma/schema.prisma)
RUN npx prisma generate

# Build frontend
RUN npm run build

# Remove devDependencies
RUN npm prune --production

EXPOSE 3000
CMD ["node", "--import", "tsx", "server.ts"]
