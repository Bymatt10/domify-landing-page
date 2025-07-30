
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .
COPY start.sh .

ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV FROM_EMAIL=$FROM_EMAIL
ENV PORT=4000
ENV HOST=0.0.0.0

RUN npm run build:prod
RUN ls -la /app/.svelte-kit/output/server || echo "Server output directory not found, checking current directory:"
RUN ls -la /app/.svelte-kit/output/ || echo "Output directory contents:"

FROM node:18-alpine AS production

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

# Copy the entire build output (adapts to different adapters)
COPY --from=builder --chown=svelte:nodejs /app/.svelte-kit/output/server ./
COPY --from=builder --chown=svelte:nodejs /app/static ./static
COPY --from=builder --chown=svelte:nodejs /app/package.json ./package.json


ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV FROM_EMAIL=$FROM_EMAIL
ENV PORT=4000
ENV HOST=0.0.0.0

USER svelte

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4000/api/debug/server-status || exit 1

# Start the application directly
CMD ["node", "index.js"]
