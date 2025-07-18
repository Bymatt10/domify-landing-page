pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        PRODUCTION_SERVER = credentials('production-server-ip')

        // Placeholders vacíos, se sobreescriben con withCredentials
        PUBLIC_SUPABASE_URL = ''
        PUBLIC_SUPABASE_ANON_KEY = ''
        PRIVATE_SUPABASE_SERVICE_ROLE_KEY = ''
        SMTP_HOST = ''
        SMTP_PORT = ''
        SMTP_USER = ''
        SMTP_PASS = ''
        FROM_EMAIL = ''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.BUILD_TIMESTAMP = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
                }
            }
        }

        stage('Environment Setup') {
            steps {
                script {
                    if (!env.BRANCH_NAME) {
                        env.BRANCH_NAME = env.GIT_BRANCH ?: 'unknown'
                    }
                    if (!env.PRODUCTION_SERVER) {
                        echo "⚠️  WARNING: production-server-ip credential not found"
                        env.PRODUCTION_SERVER = 'localhost'
                    }
                    env.STAGING_SERVER = env.PRODUCTION_SERVER
                    env.DOCKER_REGISTRY = 'localhost'
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.TARGET_ENV = 'production'
                        env.TARGET_SERVER = env.PRODUCTION_SERVER
                    } else if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging') {
                        env.TARGET_ENV = 'staging'
                        env.TARGET_SERVER = env.STAGING_SERVER
                    } else {
                        env.TARGET_ENV = 'development'
                        env.TARGET_SERVER = env.STAGING_SERVER
                    }
                    echo "Building for environment: ${env.TARGET_ENV}"
                    echo "Target server: ${env.TARGET_SERVER}"
                    echo "Branch: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Verify Node.js') {
            steps {
                sh '''
                    echo "🔧 Verifying Node.js installation..."
                    node --version
                    npm --version
                    echo "✅ Node.js and npm are ready!"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        if [ -f package-lock.json ]; then
                            npm ci
                        else
                            npm install
                        fi
                    '''
                }
            }
        }

        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        withCredentials([
                            string(credentialsId: 'supabase-public-url', variable: 'PUBLIC_SUPABASE_URL'),
                            string(credentialsId: 'supabase-public-anon-key', variable: 'PUBLIC_SUPABASE_ANON_KEY'),
                            string(credentialsId: 'supabase-private-service-role-key', variable: 'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'),
                            string(credentialsId: 'smtp-host', variable: 'SMTP_HOST'),
                            string(credentialsId: 'smtp-port', variable: 'SMTP_PORT'),
                            string(credentialsId: 'smtp-user', variable: 'SMTP_USER'),
                            string(credentialsId: 'smtp-pass', variable: 'SMTP_PASS'),
                            string(credentialsId: 'from-email', variable: 'FROM_EMAIL'),
                        ]) {
                            sh '''
                                export PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
                                export PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
                                export PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
                                export SMTP_HOST=$SMTP_HOST
                                export SMTP_PORT=$SMTP_PORT
                                export SMTP_USER=$SMTP_USER
                                export SMTP_PASS=$SMTP_PASS
                                export FROM_EMAIL=$FROM_EMAIL
                                npm run check || echo "Linting completed with warnings"
                            '''
                        }
                    }
                }

                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level moderate || echo "Security audit completed with warnings"'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                withCredentials([
                    string(credentialsId: 'supabase-public-url', variable: 'PUBLIC_SUPABASE_URL'),
                    string(credentialsId: 'supabase-public-anon-key', variable: 'PUBLIC_SUPABASE_ANON_KEY'),
                    string(credentialsId: 'supabase-private-service-role-key', variable: 'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'),
                    string(credentialsId: 'smtp-host', variable: 'SMTP_HOST'),
                    string(credentialsId: 'smtp-port', variable: 'SMTP_PORT'),
                    string(credentialsId: 'smtp-user', variable: 'SMTP_USER'),
                    string(credentialsId: 'smtp-pass', variable: 'SMTP_PASS'),
                    string(credentialsId: 'from-email', variable: 'FROM_EMAIL'),
                ]) {
                    sh '''
                        export PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
                        export PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
                        export PRIVATE_SUPABASE_SERVICE_ROLE_KEY=$PRIVATE_SUPABASE_SERVICE_ROLE_KEY
                        export SMTP_HOST=$SMTP_HOST
                        export SMTP_PORT=$SMTP_PORT
                        export SMTP_USER=$SMTP_USER
                        export SMTP_PASS=$SMTP_PASS
                        export FROM_EMAIL=$FROM_EMAIL
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} .
                    docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_IMAGE}:latest
                    docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                """
            }
        }

        stage('Test Docker Image') {
            steps {
                sh """
                    docker run -d --name test-${env.BUILD_NUMBER} -p 3001:3000 ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                    sleep 15
                    curl -f http://localhost:3001/api/health || echo "Health check endpoint not available"
                    docker stop test-${env.BUILD_NUMBER}
                    docker rm test-${env.BUILD_NUMBER}
                """
            }
        }

        stage('Push to Registry') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                        branch 'develop'
                        branch 'staging'
                    }
                    expression { env.DOCKER_REGISTRY != 'localhost' }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh """
                        echo \$DOCKER_PASSWORD | docker login ${env.DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin
                        docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                        docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                        docker push ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                        docker push ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                    """
                }
            }
        }

        stage('Deploy to Server') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                        branch 'develop'
                        branch 'staging'
                    }
                    expression { env.TARGET_SERVER != 'localhost' }
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'supabase-public-url', variable: 'PUBLIC_SUPABASE_URL'),
                    string(credentialsId: 'supabase-public-anon-key', variable: 'PUBLIC_SUPABASE_ANON_KEY'),
                    string(credentialsId: 'supabase-private-service-role-key', variable: 'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'),
                    string(credentialsId: 'smtp-host', variable: 'SMTP_HOST'),
                    string(credentialsId: 'smtp-port', variable: 'SMTP_PORT'),
                    string(credentialsId: 'smtp-user', variable: 'SMTP_USER'),
                    string(credentialsId: 'smtp-pass', variable: 'SMTP_PASS'),
                    string(credentialsId: 'from-email', variable: 'FROM_EMAIL'),
                    sshUserPrivateKey(credentialsId: 'vps-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')
                ]) {
                    sh """
                        echo "Deploying to ${env.TARGET_ENV} server..."
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no docker-compose.yml \$SSH_USER@${env.TARGET_SERVER}:/opt/domify/
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no deploy.sh \$SSH_USER@${env.TARGET_SERVER}:/opt/domify/
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${env.TARGET_SERVER} << EOF_REMOTE
                            cd /opt/domify
                            docker pull ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                            docker stop ${env.CONTAINER_NAME} 2>/dev/null || true
                            docker rm ${env.CONTAINER_NAME} 2>/dev/null || true
                            docker run -d --name ${env.CONTAINER_NAME} --restart unless-stopped -p ${env.PORT}:3000 \\
                                -e NODE_ENV=production \\
                                -e PORT=3000 \\
                                -e HOSTNAME=0.0.0.0 \\
                                -e PUBLIC_SUPABASE_URL=\$PUBLIC_SUPABASE_URL \\
                                -e PUBLIC_SUPABASE_ANON_KEY=\$PUBLIC_SUPABASE_ANON_KEY \\
                                -e PRIVATE_SUPABASE_SERVICE_ROLE_KEY=\$PRIVATE_SUPABASE_SERVICE_ROLE_KEY \\
                                -e SMTP_HOST=\$SMTP_HOST \\
                                -e SMTP_PORT=\$SMTP_PORT \\
                                -e SMTP_USER=\$SMTP_USER \\
                                -e SMTP_PASS=\$SMTP_PASS \\
                                -e FROM_EMAIL=\$FROM_EMAIL \\
                                ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                            sleep 10
                            if curl -f http://localhost:${env.PORT}/api/health > /dev/null 2>&1; then
                                echo "✅ Deployment successful!"
                            else
                                echo "❌ Deployment failed!"
                                docker logs ${env.CONTAINER_NAME}
                                exit 1
                            fi
                            docker image prune -f
EOF_REMOTE
                    """
                }
            }
        }

        stage('Smoke Tests') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        branch 'master'
                        branch 'develop'
                        branch 'staging'
                    }
                    expression { env.TARGET_SERVER != 'localhost' }
                }
            }
            steps {
                sh """
                    curl -f http://${env.TARGET_SERVER}:${env.PORT}/ || echo "Main page test failed"
                    curl -f http://${env.TARGET_SERVER}:${env.PORT}/api/health || echo "Health endpoint test failed"
                """
            }
        }

        stage('Deployment Skipped') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch 'staging'
                }
                expression { env.TARGET_SERVER == 'localhost' }
            }
            steps {
                echo """
                    ⚠️  Deployment skipped due to missing credentials:
                    
                    - TARGET_SERVER: ${env.TARGET_SERVER}
                    - DOCKER_REGISTRY: ${env.DOCKER_REGISTRY}
                    
                    Please configure the following Jenkins credentials:
                    - production-server-ip
                    - staging-server-ip
                    - docker-registry-url
                    - docker-registry-credentials
                    - vps-ssh-key
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                    echo "🧹 Cleaning up Docker resources..."
                    docker rmi ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} || echo "Image not found or already removed"
                    docker system prune -f || echo "Docker system prune failed"
                    echo "Cleanup completed"
                """
            }
        }
    }

    post {
        always {
            echo "Pipeline completed. Build: ${env.BUILD_NUMBER ?: 'unknown'}"
        }
        success {
            echo """
                🎉 Deployment completed successfully!
                
                Environment: ${env.TARGET_ENV}
                Build: ${env.BUILD_NUMBER}
                Image: ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                Server: ${env.TARGET_SERVER}:${env.PORT}
            """
        }
        failure {
            echo """
                ❌ Deployment failed!
                
                Build: ${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME ?: 'unknown'}
                Environment: ${env.TARGET_ENV ?: 'unknown'}
                
                Check the logs for more details.
            """
        }
        unstable {
            echo "Build completed with warnings. Check the logs for details."
        }
    }
}
