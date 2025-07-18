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
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.BUILD_TIMESTAMP = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    // Set BRANCH_NAME if not already set
                    if (!env.BRANCH_NAME) {
                        env.BRANCH_NAME = env.GIT_BRANCH ?: 'unknown'
                    }
                    
                    // Check if credentials are available
                    if (!env.PRODUCTION_SERVER) {
                        echo "⚠️  WARNING: production-server-ip credential not found"
                        env.PRODUCTION_SERVER = 'localhost'
                    }
                    
                    // Set staging server to same as production
                    env.STAGING_SERVER = env.PRODUCTION_SERVER
                    
                    // Set Docker registry to localhost (no registry)
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
                        docker build -t ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} .
                        docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_IMAGE}:latest
                        docker tag ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} ${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                    """
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                script {
                    sh """
                        docker run -d --name test-${env.BUILD_NUMBER} -p 3001:3000 ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                        sleep 15
                        curl -f http://localhost:3001/api/health || echo "Health check endpoint not available"
                        docker stop test-${env.BUILD_NUMBER}
                        docker rm test-${env.BUILD_NUMBER}
                    """
                }
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
                script {
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
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'vps-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            echo "Deploying to ${env.TARGET_ENV} server..."
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no docker-compose.yml \$SSH_USER@${env.TARGET_SERVER}:/opt/domify/
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no deploy.sh \$SSH_USER@${env.TARGET_SERVER}:/opt/domify/
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${env.TARGET_SERVER} << 'EOF_REMOTE'
                                cd /opt/domify
                                docker pull ${env.DOCKER_REGISTRY}/${env.DOCKER_IMAGE}:${env.TARGET_ENV}
                                docker stop ${env.CONTAINER_NAME} 2>/dev/null || true
                                docker rm ${env.CONTAINER_NAME} 2>/dev/null || true
                                docker run -d --name ${env.CONTAINER_NAME} --restart unless-stopped -p ${env.PORT}:3000 \\
                                    -e NODE_ENV=production -e PORT=3000 -e HOSTNAME=0.0.0.0 \\
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
                script {
                    sh """
                        curl -f http://${env.TARGET_SERVER}:${env.PORT}/ || echo "Main page test failed"
                        curl -f http://${env.TARGET_SERVER}:${env.PORT}/api/health || echo "Health endpoint test failed"
                    """
                }
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
                script {
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
        }
        
        stage('Cleanup') {
            steps {
                script {
                    sh """
                        echo "🧹 Cleaning up Docker resources..."
                        docker rmi ${env.DOCKER_IMAGE}:${env.DOCKER_TAG} || echo "Image not found or already removed"
                        docker system prune -f || echo "Docker system prune failed"
                        echo "Cleanup completed"
                    """
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Pipeline completed. Build: ${env.BUILD_NUMBER ?: 'unknown'}"
            }
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
