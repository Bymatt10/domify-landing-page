pipeline {
    agent any

    environment {
        DOCKER_IMAGE   = 'domify-landing'
        CONTAINER_NAME = 'domify-landing-app'
        PORT_HOST      = '5000'
        // Secret File guardado en Jenkins Credentials con ID 'domify-landing-env'
        ENV_FILE       = credentials('domify-landing-env')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Preparar Configuración') {
            steps {
                // Copia el Secret File al workspace como .env
                sh 'cp $ENV_FILE .env'
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker con variables del .env..."

                    // Lee las variables del .env y las pasa como --build-arg
                    sh """
                        set -a && . ./.env && set +a
                        docker build -t ${DOCKER_IMAGE}:latest \\
                        --build-arg PUBLIC_SUPABASE_URL="\$PUBLIC_SUPABASE_URL" \\
                        --build-arg PUBLIC_SUPABASE_ANON_KEY="\$PUBLIC_SUPABASE_ANON_KEY" \\
                        --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY="\$PRIVATE_SUPABASE_SERVICE_ROLE_KEY" \\
                        --build-arg SMTP_HOST="\${SMTP_HOST:-}" \\
                        --build-arg SMTP_PORT="\${SMTP_PORT:-587}" \\
                        --build-arg SMTP_USER="\${SMTP_USER:-}" \\
                        --build-arg SMTP_PASS="\${SMTP_PASS:-}" \\
                        --build-arg FROM_EMAIL="\${FROM_EMAIL:-noreply@domify.app}" \\
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
            // Elimina el .env del workspace por seguridad
            sh 'rm -f .env'
            sh 'docker image prune -f || true'
        }
        success {
            echo "✅ Domify Landing desplegado exitosamente en el puerto ${PORT_HOST}."
        }
        failure {
            echo "❌ Pipeline fallido. Revisa los logs arriba."
        }
    }
}