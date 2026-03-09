FROM node:18-alpine AS builder

WORKDIR /app

# Usamos wildcard para asegurar que tome package.json y package-lock.json si existe
COPY package*.json ./

# Cambiamos a npm install para mayor flexibilidad en el servidor
RUN npm install

COPY . .

# Argumentos necesarios para SvelteKit durante el build
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

# Inyección de variables para el proceso de compilación
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

# --- ETAPA DE PRODUCCIÓN ---
FROM node:18-alpine AS production

RUN apk add --no-cache curl

# Configuración de usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

WORKDIR /app

COPY package*.json ./

# SOLUCIÓN AL ERROR: Cambiamos 'npm ci' por 'npm install'
RUN npm install --omit=dev && npm cache clean --force

# Copiamos el output del build (SvelteKit con adapter-node genera index.js y carpetas)
COPY --from=builder --chown=svelte:nodejs /app/build ./
# Si tu proyecto usa archivos estáticos fuera del build
COPY --from=builder --chown=svelte:nodejs /app/package.json ./package.json

# Re-declaramos las variables para el tiempo de ejecución (Runtime)
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

# Healthcheck usando el puerto configurado
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:4000/api/debug/server-status || exit 1

# SvelteKit con adapter-node arranca con node index.js
CMD ["node", "index.js"]