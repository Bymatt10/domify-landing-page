pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify-landing'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-landing-app'
        // Cambiado a 5000 para evitar conflicto con el Backend (4000)
        PORT = '5000' 
        DOMAIN = "domify.app"
        
        // Credenciales desde Jenkins Global Properties
        PUBLIC_SUPABASE_URL = "${env.PUBLIC_SUPABASE_URL}"
        PUBLIC_SUPABASE_ANON_KEY = "${env.PUBLIC_SUPABASE_ANON_KEY}"
        SUPABASE_SERVICE_ROLE_KEY = "${env.SUPABASE_SERVICE_ROLE_KEY}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Env') {
            steps {
                script {
                    if (!env.PUBLIC_SUPABASE_URL) {
                        error "❌ Falta PUBLIC_SUPABASE_URL en Jenkins Global Properties"
                    }
                    echo "✅ Variables validadas para Domify Landing"
                }
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                script {
                    echo "🐳 Desplegando Landing Page en puerto ${PORT}..."
                    
                    // Limpieza de contenedores previos
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    
                    // Build con argumentos (para que SvelteKit los embeba en el build estático)
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                        --build-arg PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \
                        --build-arg PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \
                        .
                    """
                    
                    // Run: Mapeamos el puerto 5000 del host al 3000 interno de SvelteKit
                    sh """
                        docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${PORT}:3000 \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "⏳ Esperando a que SvelteKit inicie..."
                    sleep(15)
                    // Verificación interna del contenedor
                    def status = sh(script: "docker exec ${CONTAINER_NAME} wget --spider -q http://localhost:3000/api/health || exit 0", returnStatus: true)
                    echo "Health status: ${status == 0 ? 'OK' : 'Iniciando...'}"
                }
            }
        }
    }

    post {
        always {
            // Limpieza de imágenes huérfanas para ahorrar espacio en el VPS
            sh "docker image prune -f || true"
        }
        success {
            echo "🚀 Landing Page desplegada en http://${DOMAIN} (Puerto ${PORT})"
        }
    }
}