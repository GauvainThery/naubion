# Unified Multi-stage Docker build for both frontend and backend
FROM node:lts-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Shared dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Shared builder stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

# Copy source code
COPY . .

# Build shared library first (used by both frontend and backend)
RUN pnpm --filter "@naubion/shared" build

# Build both applications
RUN pnpm --filter "@naubion/backend" build
RUN pnpm --filter "@naubion/frontend" build

# Backend production stage
FROM node:lts-alpine AS backend
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

# Frontend production stage
FROM nginx:alpine AS frontend

# Create non-root user
RUN addgroup --system --gid 1001 nginx-custom
RUN adduser --system --uid 1001 naubion

# Copy built application from builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Change ownership of nginx files
RUN chown -R naubion:nginx-custom /usr/share/nginx/html
RUN chown -R naubion:nginx-custom /var/cache/nginx
RUN chown -R naubion:nginx-custom /var/log/nginx
RUN chown -R naubion:nginx-custom /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R naubion:nginx-custom /var/run/nginx.pid

# Switch to non-root user
USER naubion

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
