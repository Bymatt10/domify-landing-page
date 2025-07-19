pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        
        // Environment variables for build with fallbacks
        PUBLIC_SUPABASE_URL = "${env.PUBLIC_SUPABASE_URL ?: 'https://fallback.supabase.co'}"
        PUBLIC_SUPABASE_ANON_KEY = "${env.PUBLIC_SUPABASE_ANON_KEY ?: 'fallback-anon-key'}"
        SUPABASE_SERVICE_ROLE_KEY = "${env.SUPABASE_SERVICE_ROLE_KEY ?: 'fallback-service-role-key'}"
        SMTP_HOST = "${env.SMTP_HOST ?: 'localhost'}"
        SMTP_PORT = "${env.SMTP_PORT ?: '587'}"
        SMTP_USER = "${env.SMTP_USER ?: 'fallback-user'}"
        SMTP_PASS = "${env.SMTP_PASS ?: 'fallback-password'}"
        FROM_EMAIL = "${env.FROM_EMAIL ?: 'noreply@domify.app'}"
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

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image locally
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                        --build-arg PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}' \
                        --build-arg PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}' \
                        --build-arg SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                        --build-arg SMTP_HOST='${SMTP_HOST}' \
                        --build-arg SMTP_PORT='${SMTP_PORT}' \
                        --build-arg SMTP_USER='${SMTP_USER}' \
                        --build-arg SMTP_PASS='${SMTP_PASS}' \
                        --build-arg FROM_EMAIL='${FROM_EMAIL}' \
                        .
                    """
                    
                    // Tag as latest
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy Locally') {
            steps {
                script {
                    // Stop existing container if running
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    
                    // Run new container
                    sh """
                        docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${PORT}:3000 \
                        -e NODE_ENV=production \
                        -e PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}' \
                        -e PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}' \
                        -e SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                        -e SMTP_HOST='${SMTP_HOST}' \
                        -e SMTP_PORT='${SMTP_PORT}' \
                        -e SMTP_USER='${SMTP_USER}' \
                        -e SMTP_PASS='${SMTP_PASS}' \
                        -e FROM_EMAIL='${FROM_EMAIL}' \
                        --restart unless-stopped \
                        ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
            echo "🚀 Application is running at http://localhost:${PORT}"
        }
        failure {
            echo "❌ Deployment failed. Check logs for details."
        }
        always {
            // Clean up old images to save space
            sh "docker image prune -f || true"
        }
    }
}
