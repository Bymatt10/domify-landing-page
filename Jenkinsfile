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

        stage('Build & Deploy Docker') {
            steps {
                script {
                    echo "🐳 Construyendo imagen con argumentos de Supabase..."
                    
                    // Es CRUCIAL pasar cada --build-arg para evitar el error de URL inválida
                    sh """
                        docker build -t ${DOCKER_IMAGE}:latest \
                        --build-arg PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \
                        --build-arg PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \
                        --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.SUPABASE_SERVICE_ROLE_KEY}" \
                        --build-arg SMTP_HOST="${env.SMTP_HOST}" \
                        --build-arg SMTP_PORT="${env.SMTP_PORT}" \
                        --build-arg SMTP_USER="${env.SMTP_USER}" \
                        --build-arg SMTP_PASS="${env.SMTP_PASS}" \
                        --build-arg FROM_EMAIL="${env.FROM_EMAIL}" \
                        .
                    """

                    echo "🛑 Limpiando contenedor anterior..."
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    echo "🚀 Iniciando nuevo contenedor en puerto ${PORT_HOST}..."
                    sh """
                        docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${PORT_HOST}:3000 \
                        --restart unless-stopped \
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
            echo "✅ Landing Page de Domify desplegada exitosamente."
        }
    }
}