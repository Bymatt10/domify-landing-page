#!/bin/bash

# Jenkins Helper Scripts para Domify
# Conjunto de comandos útiles para gestionar el pipeline de Jenkins

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración por defecto
JENKINS_URL=${JENKINS_URL:-"http://localhost:8080"}
JOB_NAME=${JOB_NAME:-"domify-deployment"}

echo -e "${BLUE}🛠️  Jenkins Helper Scripts para Domify${NC}"
echo "=================================================="

# Función para mostrar ayuda
show_help() {
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo ""
    echo -e "${GREEN}build${NC}           - Ejecutar build manualmente"
    echo -e "${GREEN}status${NC}          - Ver estado del último build"
    echo -e "${GREEN}logs${NC}            - Ver logs del último build"
    echo -e "${GREEN}console${NC}         - Ver console output en tiempo real"
    echo -e "${GREEN}queue${NC}           - Ver cola de builds"
    echo -e "${GREEN}abort${NC}           - Abortar build actual"
    echo -e "${GREEN}health${NC}          - Verificar health check de la app"
    echo -e "${GREEN}rollback${NC}        - Script de rollback manual"
    echo -e "${GREEN}cleanup${NC}         - Limpiar workspace de Jenkins"
    echo -e "${GREEN}install-plugins${NC} - Instalar plugins requeridos"
    echo -e "${GREEN}setup-creds${NC}     - Guía para configurar credenciales"
    echo ""
    echo -e "${YELLOW}Variables de entorno:${NC}"
    echo "JENKINS_URL    - URL de tu servidor Jenkins (default: http://localhost:8080)"
    echo "JOB_NAME       - Nombre del job (default: domify-deployment)"
    echo "JENKINS_CLI    - Ruta al jenkins-cli.jar"
    echo ""
    echo -e "${YELLOW}Ejemplo de uso:${NC}"
    echo "  ./jenkins-helpers.sh build"
    echo "  JENKINS_URL=http://mi-jenkins:8080 ./jenkins-helpers.sh status"
}

# Función para verificar jenkins-cli
check_jenkins_cli() {
    if [ -z "$JENKINS_CLI" ]; then
        if [ -f "jenkins-cli.jar" ]; then
            JENKINS_CLI="java -jar jenkins-cli.jar"
        elif [ -f "/var/lib/jenkins/war/WEB-INF/jenkins-cli.jar" ]; then
            JENKINS_CLI="java -jar /var/lib/jenkins/war/WEB-INF/jenkins-cli.jar"
        else
            echo -e "${RED}❌ jenkins-cli.jar no encontrado${NC}"
            echo "Descárgalo con: wget ${JENKINS_URL}/jnlpJars/jenkins-cli.jar"
            return 1
        fi
    fi
    
    JENKINS_CLI="$JENKINS_CLI -s $JENKINS_URL"
    return 0
}

# Ejecutar build
build_project() {
    echo -e "${BLUE}🚀 Ejecutando build de $JOB_NAME...${NC}"
    
    if check_jenkins_cli; then
        $JENKINS_CLI build $JOB_NAME
        echo -e "${GREEN}✅ Build iniciado${NC}"
        echo "Ver progreso: $JENKINS_URL/job/$JOB_NAME/"
    fi
}

# Ver estado del último build
check_status() {
    echo -e "${BLUE}📊 Estado del último build...${NC}"
    
    if check_jenkins_cli; then
        BUILD_NUMBER=$($JENKINS_CLI get-job $JOB_NAME | grep -oP '<lastBuild><number>\K[^<]+')
        if [ -n "$BUILD_NUMBER" ]; then
            echo "Último build: #$BUILD_NUMBER"
            curl -s "$JENKINS_URL/job/$JOB_NAME/$BUILD_NUMBER/api/json" | \
                jq -r '"Estado: \(.result // "RUNNING") | Duración: \(.duration/1000)s"' 2>/dev/null || \
                echo "Build #$BUILD_NUMBER (usar 'logs' para más detalles)"
        else
            echo -e "${YELLOW}⚠️  No hay builds disponibles${NC}"
        fi
    fi
}

# Ver logs del último build
view_logs() {
    echo -e "${BLUE}📋 Logs del último build...${NC}"
    
    if check_jenkins_cli; then
        BUILD_NUMBER=$($JENKINS_CLI get-job $JOB_NAME | grep -oP '<lastBuild><number>\K[^<]+')
        if [ -n "$BUILD_NUMBER" ]; then
            $JENKINS_CLI console $JOB_NAME $BUILD_NUMBER
        else
            echo -e "${YELLOW}⚠️  No hay builds disponibles${NC}"
        fi
    fi
}

# Ver console output en tiempo real
follow_console() {
    echo -e "${BLUE}👁️  Siguiendo console output...${NC}"
    echo "Presiona Ctrl+C para salir"
    
    BUILD_NUMBER=$($JENKINS_CLI get-job $JOB_NAME | grep -oP '<lastBuild><number>\K[^<]+' 2>/dev/null)
    if [ -n "$BUILD_NUMBER" ]; then
        while true; do
            curl -s "$JENKINS_URL/job/$JOB_NAME/$BUILD_NUMBER/consoleText" | tail -20
            sleep 5
            clear
        done
    else
        echo -e "${YELLOW}⚠️  No hay builds activos${NC}"
    fi
}

# Ver cola de builds
view_queue() {
    echo -e "${BLUE}⏳ Cola de builds...${NC}"
    curl -s "$JENKINS_URL/queue/api/json" | \
        jq -r '.items[] | "\(.task.name) - \(.why)"' 2>/dev/null || \
        echo "Ver en: $JENKINS_URL/queue/"
}

# Abortar build actual
abort_build() {
    echo -e "${YELLOW}⚠️  Abortando build actual...${NC}"
    
    if check_jenkins_cli; then
        BUILD_NUMBER=$($JENKINS_CLI get-job $JOB_NAME | grep -oP '<lastBuild><number>\K[^<]+')
        if [ -n "$BUILD_NUMBER" ]; then
            $JENKINS_CLI stop-builds $JOB_NAME
            echo -e "${GREEN}✅ Build abortado${NC}"
        else
            echo -e "${YELLOW}⚠️  No hay builds activos${NC}"
        fi
    fi
}

# Verificar health check de la aplicación
check_app_health() {
    echo -e "${BLUE}🏥 Verificando health de la aplicación...${NC}"
    
    SERVERS=("production-server:3000" "staging-server:3000" "localhost:3000")
    
    for server in "${SERVERS[@]}"; do
        echo -n "Verificando $server... "
        if curl -s -f "http://$server/api/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ FAIL${NC}"
        fi
    done
}

# Script de rollback manual
manual_rollback() {
    echo -e "${YELLOW}🔄 Iniciando rollback manual...${NC}"
    echo "Este script te ayudará a hacer rollback a una versión anterior"
    echo ""
    
    read -p "IP del servidor: " SERVER_IP
    read -p "Usuario SSH: " SSH_USER
    read -p "Versión a la que hacer rollback (ej: 123): " VERSION
    
    if [ -z "$SERVER_IP" ] || [ -z "$SSH_USER" ] || [ -z "$VERSION" ]; then
        echo -e "${RED}❌ Todos los campos son requeridos${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🚀 Ejecutando rollback en $SERVER_IP...${NC}"
    
    ssh "$SSH_USER@$SERVER_IP" << EOF
        cd /opt/domify
        
        echo "Parando contenedor actual..."
        docker stop domify-app 2>/dev/null || true
        docker rm domify-app 2>/dev/null || true
        
        echo "Iniciando versión $VERSION..."
        docker run -d \\
            --name domify-app \\
            --restart unless-stopped \\
            -p 3000:3000 \\
            --env-file .env.production \\
            domify:$VERSION
        
        echo "Verificando salud de la aplicación..."
        sleep 10
        
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "✅ Rollback exitoso!"
        else
            echo "❌ Rollback falló - revisar logs"
            docker logs domify-app
        fi
EOF
}

# Limpiar workspace
cleanup_workspace() {
    echo -e "${BLUE}🧹 Limpiando workspace de Jenkins...${NC}"
    
    if check_jenkins_cli; then
        $JENKINS_CLI build $JOB_NAME -p "CLEANUP=true"
        echo -e "${GREEN}✅ Limpieza iniciada${NC}"
    fi
}

# Instalar plugins requeridos
install_plugins() {
    echo -e "${BLUE}🔌 Instalando plugins requeridos...${NC}"
    
    PLUGINS=(
        "docker-workflow"
        "ssh-agent" 
        "credentials-binding"
        "slack"
        "git"
        "workflow-aggregator"
    )
    
    if check_jenkins_cli; then
        for plugin in "${PLUGINS[@]}"; do
            echo "Instalando $plugin..."
            $JENKINS_CLI install-plugin $plugin
        done
        echo -e "${GREEN}✅ Plugins instalados - reinicia Jenkins${NC}"
    fi
}

# Guía para configurar credenciales
setup_credentials() {
    echo -e "${BLUE}🔐 Guía de Configuración de Credenciales${NC}"
    echo "======================================="
    echo ""
    echo -e "${YELLOW}Ve a: ${NC}$JENKINS_URL/manage/credentials/"
    echo ""
    echo -e "${GREEN}1. SSH Key para VPS:${NC}"
    echo "   ID: vps-ssh-key"
    echo "   Tipo: SSH Username with private key"
    echo ""
    echo -e "${GREEN}2. Docker Registry:${NC}"
    echo "   ID: docker-registry-credentials"
    echo "   Tipo: Username with password"
    echo ""
    echo -e "${GREEN}3. Servidor de Producción:${NC}"
    echo "   ID: production-server-ip"
    echo "   Tipo: Secret text"
    echo ""
    echo -e "${GREEN}4. Servidor de Staging:${NC}"
    echo "   ID: staging-server-ip"
    echo "   Tipo: Secret text"
    echo ""
    echo -e "${GREEN}5. Docker Registry URL:${NC}"
    echo "   ID: docker-registry-url"
    echo "   Tipo: Secret text (ej: docker.io)"
}

# Comando principal
case "$1" in
    build)
        build_project
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    console)
        follow_console
        ;;
    queue)
        view_queue
        ;;
    abort)
        abort_build
        ;;
    health)
        check_app_health
        ;;
    rollback)
        manual_rollback
        ;;
    cleanup)
        cleanup_workspace
        ;;
    install-plugins)
        install_plugins
        ;;
    setup-creds)
        setup_credentials
        ;;
    *)
        show_help
        ;;
esac 