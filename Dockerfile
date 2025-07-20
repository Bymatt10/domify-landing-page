# Use Node.js 18 as base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

# Set environment variables for build
ENV PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL}
ENV PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY}
ENV PRIVATE_SUPABASE_SERVICE_ROLE_KEY=${PRIVATE_SUPABASE_SERVICE_ROLE_KEY}
ENV SMTP_HOST=${SMTP_HOST}
ENV SMTP_PORT=${SMTP_PORT}
ENV SMTP_USER=${SMTP_USER}
ENV SMTP_PASS=${SMTP_PASS}
ENV FROM_EMAIL=${FROM_EMAIL}

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=svelte:nodejs /app/build ./build
COPY --from=builder --chown=svelte:nodejs /app/static ./static

# Switch to non-root user
USER svelte

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4000 || exit 1

# Start the application
CMD ["node", "build/index.js"]
