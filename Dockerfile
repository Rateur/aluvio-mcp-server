FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copie du code source et compilation
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Image finale de production
FROM node:20-alpine

WORKDIR /app

# Copie uniquement des fichiers nécessaires
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

# Le serveur utilise stdio pour MCP, pas besoin d'exposer de port réseau
CMD ["node", "build/index.js"]
