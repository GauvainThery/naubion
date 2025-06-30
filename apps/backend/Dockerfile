# Backend Dockerfile
FROM node:lts-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files for the monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

# Copy source code
COPY libs/shared ./libs/shared
COPY apps/backend ./apps/backend
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build shared library first
RUN pnpm --filter "@naubion/shared" build

# Build backend
RUN pnpm --filter "@naubion/backend" build

# Production stage
FROM node:lts-alpine AS production
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 naubion

# Copy package files for production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod=true

# Copy built applications from builder stage
COPY --from=builder --chown=naubion:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=naubion:nodejs /app/libs/shared/dist ./libs/shared/dist

# Switch to non-root user
USER naubion

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node apps/backend/dist/healthcheck.js

# Start the application
CMD ["node", "apps/backend/dist/app.js"]
