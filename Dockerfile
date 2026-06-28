FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package.json AND prisma schema BEFORE npm install
# This way postinstall (prisma generate) can find the schema
COPY package.json package-lock.json* prisma/ ./prisma/
COPY package.json package-lock.json* ./

# Remove postinstall from package.json before npm install
# We'll run prisma generate explicitly after copying source
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client (schema is now available)
RUN npx prisma generate

# Build frontend with Vite
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

EXPOSE 3000
CMD ["node", "--import", "tsx", "server.ts"]
