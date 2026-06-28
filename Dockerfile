FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Force development mode so npm install includes devDependencies
# (vite, esbuild, typescript, prisma — all needed at build time)
ENV NODE_ENV=development

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# Switch to production for runtime
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "dist/server.js"]
