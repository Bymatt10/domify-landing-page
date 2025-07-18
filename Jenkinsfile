pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        PRODUCTION_SERVER = credentials('production-server-ip')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Deploy to VPS') {
            steps {
                script {
                    sshagent(['vps-ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no usuario@IP_VPS '
                                set -e
                                # Clonar si no existe la carpeta
                                if [ ! -d /opt/domify ]; then
                                    git clone https://github.com/Bymatt10/domify-landing-page.git /opt/domify
                                fi

                                cd /opt/domify
                                git pull origin main

                                # Opcional: revisar rama correcta
                                git checkout main

                                # Copiar o actualizar .env.production si no está versionado
                                # echo "ENV_VARIABLE=value" > .env.production

                                # Levantar con Docker Compose
                                docker compose up -d --build
                            '
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
        }
        failure {
            echo "❌ Deployment failed. Check logs for details."
        }
    }
}
