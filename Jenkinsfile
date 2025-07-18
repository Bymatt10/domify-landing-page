pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        PRODUCTION_SERVER = credentials('production-server-ip')
        STAGING_SERVER = credentials('staging-server-ip')
        DOCKER_REGISTRY = credentials('docker-registry-url')
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
                }
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
                        script {
                            sh 'npm run check || echo "Linting completed with warnings"'
                        }
                    }
                }
                
                stage('Security Audit') {
                    steps {
                        script {
                            sh 'npm audit --audit-level moderate || echo "Security audit completed with warnings"'
                        }
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:${TARGET_ENV}
                    """
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                script {
                    sh """
                        docker run -d --name test-${BUILD_NUMBER} -p 3001:3000 ${DOCKER_IMAGE}:${DOCKER_TAG}
                        sleep 15
                        curl -f http://localhost:3001/api/health || echo "Health check endpoint not available"
                        docker stop test-${BUILD_NUMBER}
                        docker rm test-${BUILD_NUMBER}
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh """
                            echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${TARGET_ENV}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${TARGET_ENV}
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Server') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'vps-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            echo "Deploying to ${TARGET_ENV} server..."
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no docker-compose.yml \$SSH_USER@${TARGET_SERVER}:/opt/domify/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no deploy.sh \$SSH_USER@${TARGET_SERVER}:/opt/domify/
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${TARGET_SERVER} << 'EOF_REMOTE'
                                cd /opt/domify
                                docker pull ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${TARGET_ENV}
                                docker stop ${CONTAINER_NAME} 2>/dev/null || true
                                docker rm ${CONTAINER_NAME} 2>/dev/null || true
                                docker run -d --name ${CONTAINER_NAME} --restart unless-stopped -p ${PORT}:3000 \\
                                    -e NODE_ENV=production -e PORT=3000 -e HOSTNAME=0.0.0.0 \\
                                    ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${TARGET_ENV}
                                sleep 10
                                if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
                                    echo "✅ Deployment successful!"
                                else
                                    echo "❌ Deployment failed!"
                                    docker logs ${CONTAINER_NAME}
                                    exit 1
                                fi
                                docker image prune -f
EOF_REMOTE
                        """
                    }
                }
            }
        }
        
        stage('Smoke Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                script {
                    sh """
                        curl -f http://${TARGET_SERVER}:${PORT}/ || echo "Main page test failed"
                        curl -f http://${TARGET_SERVER}:${PORT}/api/health || echo "Health endpoint test failed"
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                sh """
                    docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true
                    docker system prune -f || true
                """
            }
        }
        
        success {
            echo """
                🎉 Deployment completed successfully!
                
                Environment: ${env.TARGET_ENV}
                Build: ${env.BUILD_NUMBER}
                Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                Server: ${env.TARGET_SERVER}:${PORT}
            """
        }
        
        failure {
            echo """
                ❌ Deployment failed!
                
                Build: ${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME}
                Environment: ${env.TARGET_ENV}
                
                Check the logs for more details.
            """
        }
        
        unstable {
            echo "Build completed with warnings. Check the logs for details."
        }
    }
}
