pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify-landing'
        CONTAINER_NAME = 'domify-landing-app'
        PORT_HOST = '5000' // Puerto en tu VPS para domify.app
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Environment') {
            steps {
                script {
                    echo "🔍 Verificando variables de entorno requeridas..."
                    def missing = []
                    if (!env.PUBLIC_SUPABASE_URL)              missing << 'PUBLIC_SUPABASE_URL'
                    if (!env.PUBLIC_SUPABASE_ANON_KEY)         missing << 'PUBLIC_SUPABASE_ANON_KEY'
                    if (!env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) missing << 'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'
                    if (missing) {
                        error("❌ Variables faltantes en Jenkins: ${missing.join(', ')}. Configúralas en Manage Jenkins → Credentials o el .env del pipeline.")
                    }
                    echo "✅ Todas las variables de entorno están presentes."
                }
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker..."

                    sh """
                        docker build -t ${DOCKER_IMAGE}:latest \\
                        --build-arg PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \\
                        --build-arg PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \\
                        --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY}" \\
                        --build-arg SMTP_HOST="${env.SMTP_HOST ?: ''}" \\
                        --build-arg SMTP_PORT="${env.SMTP_PORT ?: '587'}" \\
                        --build-arg SMTP_USER="${env.SMTP_USER ?: ''}" \\
                        --build-arg SMTP_PASS="${env.SMTP_PASS ?: ''}" \\
                        --build-arg FROM_EMAIL="${env.FROM_EMAIL ?: 'noreply@domify.app'}" \\
                        --progress=plain \\
                        .
                    """

                    echo "🛑 Limpiando contenedor anterior..."
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    echo "🚀 Iniciando nuevo contenedor en puerto ${PORT_HOST}..."
                    sh """
                        docker run -d \\
                        --name ${CONTAINER_NAME} \\
                        -p ${PORT_HOST}:3000 \\
                        --restart unless-stopped \\
                        ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker image prune -f || true"
        }
        success {
            echo "✅ Landing Page de Domify desplegada exitosamente en puerto ${PORT_HOST}."
        }
        failure {
            echo "❌ El pipeline falló. Revisa los logs arriba. Tip: verifica que las variables de entorno estén configuradas en Jenkins → Manage Jenkins → System → Global properties → Environment variables."
        }
    }
}