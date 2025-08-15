FROM node:22-alpine

# dépendances utiles (Prisma, OpenSSL)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
RUN corepack enable

# Monorepo (contexte = racine du repo)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages

# Install (on garde les devDeps car on lance TS via tsx)
RUN pnpm install --frozen-lockfile

# Générer Prisma client
WORKDIR /app/apps/backend
RUN pnpm prisma generate

ENV NODE_ENV=production
EXPOSE 4000

# ✅ Chemin correct depuis la racine du repo
COPY apps/backend/docker-entrypoint.sh /app/apps/backend/docker-entrypoint.sh
RUN chmod +x /app/apps/backend/docker-entrypoint.sh

ENTRYPOINT ["/app/apps/backend/docker-entrypoint.sh"]
