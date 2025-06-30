# Frontend Dockerfile
FROM node:lts-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files for the monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/shared/package.json ./libs/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/libs/shared/node_modules ./libs/shared/node_modules

# Copy source code
COPY libs/shared ./libs/shared
COPY apps/frontend ./apps/frontend
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build shared library first
RUN pnpm --filter "@naubion/shared" build

# Build frontend
RUN pnpm --filter "@naubion/frontend" build

# Production stage
FROM nginx:alpine AS production

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
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
