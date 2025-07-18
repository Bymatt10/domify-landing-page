# Jenkins Setup with Node.js

Este proyecto incluye un Dockerfile personalizado para Jenkins que viene con Node.js preinstalado, eliminando la necesidad de instalarlo manualmente.

## 🚀 Setup Rápido

### Opción 1: Script Automático
```bash
# Ejecutar el script de setup
./jenkins-setup.sh
```

### Opción 2: Comandos Manuales
```bash
# 1. Construir la imagen de Jenkins con Node.js
docker build -f Dockerfile.jenkins -t jenkins-with-node .

# 2. Detener el container actual (si existe)
docker stop jenkins
docker rm jenkins

# 3. Ejecutar el nuevo container
docker run -d \
  --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins-with-node
```

## 📋 Características

### ✅ Incluido en la imagen:
- **Jenkins LTS** con JDK 17
- **Node.js 18.x** (LTS)
- **npm** (última versión)
- **Docker CLI** para builds de Docker
- **Git, curl, wget** para herramientas adicionales

### 🔧 Beneficios:
- ✅ **No más errores** de "npm: not found"
- ✅ **Pipeline funciona inmediatamente** sin configuración adicional
- ✅ **Instalación limpia** y reproducible
- ✅ **Herramientas preinstaladas** para desarrollo

## 🌐 Acceso

- **URL:** http://localhost:8080
- **Puerto:** 8080 (web), 50000 (agent)
- **Contraseña inicial:** Ver logs del container

## 📊 Verificación

```bash
# Verificar que el container está corriendo
docker ps | grep jenkins

# Verificar Node.js en el container
docker exec jenkins node --version
docker exec jenkins npm --version

# Ver logs de Jenkins
docker logs jenkins
```

## 🔄 Migración desde Jenkins existente

Si ya tienes un Jenkins corriendo:

1. **Backup de datos** (opcional):
   ```bash
   docker cp jenkins:/var/jenkins_home ./jenkins_backup
   ```

2. **Ejecutar el setup script**:
   ```bash
   ./jenkins-setup.sh
   ```

3. **Restaurar configuración** (si es necesario):
   - Los datos se preservan en el volumen `jenkins_home`
   - Las credenciales y jobs se mantienen

## 🎯 Pipeline

Con esta configuración, el pipeline de Domify funcionará sin problemas:

1. ✅ **Verify Node.js** - Verifica que Node.js esté disponible
2. ✅ **Install Dependencies** - Instala dependencias con npm
3. ✅ **Build Application** - Construye la aplicación SvelteKit
4. ✅ **Build Docker Image** - Crea la imagen Docker
5. ✅ **Deploy** - Despliega la aplicación

## 🆘 Troubleshooting

### Si el container no inicia:
```bash
# Ver logs detallados
docker logs jenkins

# Verificar puertos
netstat -tulpn | grep 8080
```

### Si Node.js no está disponible:
```bash
# Entrar al container
docker exec -it jenkins /bin/bash

# Verificar instalación
node --version
npm --version
```

### Si necesitas reinstalar:
```bash
# Limpiar todo y reinstalar
docker stop jenkins
docker rm jenkins
docker volume rm jenkins_home
./jenkins-setup.sh
``` 