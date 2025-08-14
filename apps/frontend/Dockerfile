# --- Build ---
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Monorepo (contexte = racine du repo)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages 2>/dev/null || true

# Install à la racine (workspace)
RUN pnpm install --frozen-lockfile

# Build frontend
WORKDIR /app/apps/frontend
RUN pnpm build

# --- Nginx ---
FROM nginx:alpine
# Fichiers statiques construits par Vite
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
# Conf Nginx (créée à: infra/docker/nginx.conf)
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
