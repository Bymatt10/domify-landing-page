# Domify 🏠

Domify es una plataforma de servicios para el hogar que conecta a usuarios con profesionales calificados para diferentes tareas domésticas.

## Servicios Disponibles

- 🧹 Limpieza
- 🪴 Jardinería
- 🔧 Montaje y Reparaciones
- 📦 Mudanzas
- 🛠️ Ensamblaje

## Requisitos Previos

- Node.js (v18 o superior)
- npm o pnpm
- Supabase (cuenta y proyecto configurado)

## Configuración

1. Clona el repositorio:
```bash
git clone https://github.com/Bymatt10/domify-landing-page.git
cd domify-landing-page
```

2. Instala las dependencias:
```bash
npm install
# o
pnpm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura tus variables de entorno en el archivo `.env`

## Ejecutar la Aplicación

### Desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

```bash
npm run build
npm run preview
# o
pnpm build
pnpm preview
```

## Stack Tecnológico

- SvelteKit
- Supabase
- TypeScript
- Tailwind CSS

## Licencia

MIT 