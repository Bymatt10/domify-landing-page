# --- ETAPA DE CONSTRUCCIÓN ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install

# Copia del código fuente
COPY . .

# Argumentos requeridos por SvelteKit para el análisis estático
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

# Mapeo a variables de entorno para el proceso 'npm run build'
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV FROM_EMAIL=$FROM_EMAIL
ENV NODE_ENV=production

RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:20-alpine AS production

RUN apk add --no-cache curl

# Seguridad: Usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copia del build generado por adapter-node
COPY --from=builder --chown=svelte:nodejs /app/build ./build
COPY --from=builder --chown=svelte:nodejs /app/package.json ./package.json

# Re-declaración de ARGs para Runtime
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

# Puerto interno estándar para el contenedor
ENV PORT=3000
ENV HOST=0.0.0.0

USER svelte
EXPOSE 3000

HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "build/index.js"]