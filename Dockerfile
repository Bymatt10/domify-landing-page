# --- ETAPA DE CONSTRUCCIÓN (BUILDER) ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Usamos 'install' para evitar errores si no hay lockfile en el servidor
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Argumentos requeridos por SvelteKit durante el build
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USER
ARG SMTP_PASS
ARG FROM_EMAIL

# Inyectamos variables al entorno del proceso de compilación
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASS=$SMTP_PASS
ENV FROM_EMAIL=$FROM_EMAIL
ENV NODE_ENV=production

# Ejecutamos el build (SvelteKit analiza las rutas aquí)
RUN npm run build

# --- ETAPA DE PRODUCCIÓN ---
FROM node:18-alpine AS production

# Instalamos curl para el Healthcheck
RUN apk add --no-cache curl

# Configuración de usuario de sistema por seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S svelte -u 1001

WORKDIR /app

# Copiamos solo los archivos necesarios para ejecutar
COPY package*.json ./

# Instalamos solo dependencias de producción (sin devDependencies)
RUN npm install --omit=dev && npm cache clean --force

# Copiamos el output generado por adapter-node
# Importante: adapter-node genera la carpeta 'build' por defecto
COPY --from=builder --chown=svelte:nodejs /app/build ./build
COPY --from=builder --chown=svelte:nodejs /app/package.json ./package.json

# Re-declaramos variables para el tiempo de ejecución (Runtime)
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

# Configuramos el puerto interno (SvelteKit usa 3000 por defecto en adapter-node)
ENV PORT=3000
ENV HOST=0.0.0.0

USER svelte

EXPOSE 3000

# Validación de salud del contenedor
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:3000/ || exit 1

# Comando de inicio para adapter-node
CMD ["node", "build/index.js"]