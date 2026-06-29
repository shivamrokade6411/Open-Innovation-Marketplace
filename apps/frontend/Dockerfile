# Multi-stage Dockerfile for Next.js Frontend
# Context: Root of the monorepo

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy root lockfile, workspaces, package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build the shared library and the frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --filter=@oim/shared... --filter=frontend...

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user and setup permissions
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs

# Copy runtime files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder /app/apps/frontend/next.config.js ./apps/frontend/
COPY --from=builder /app/apps/frontend/tailwind.config.ts ./apps/frontend/
COPY --from=builder /app/apps/frontend/postcss.config.js ./apps/frontend/ || true
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install pnpm for runner to trigger filter start command
USER root
RUN npm install -g pnpm@9.0.0
USER nextjs

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["pnpm", "--filter", "frontend", "start"]
