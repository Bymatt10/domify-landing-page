pipeline {
    agent any
    
    environment {
        // --- General Config ---
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        
        // --- Credentials & Secrets (loaded from Jenkins Credentials) ---
        PRODUCTION_SERVER = credentials('production-server-ip')
        
        // --- Dynamic Variables (set during pipeline execution) ---
        IS_DEPLOYABLE_BRANCH = false 
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
                    // Set BRANCH_NAME if not already set by Jenkins
                    if (!env.BRANCH_NAME) {
                        env.BRANCH_NAME = env.GIT_BRANCH ?: 'unknown'
                    }
                    
                    // Determine if the current branch is deployable
                    env.IS_DEPLOYABLE_BRANCH = (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master' || env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging')

                    // Check if credentials are available, with a safe fallback
                    if (!env.PRODUCTION_SERVER) {
                        echo "⚠️  WARNING: production-server-ip credential not found. Falling back to localhost."
                        env.PRODUCTION_SERVER = 'localhost'
                    }
                    
                    // Set staging server (can be a different credential or same as prod)
                    env.STAGING_SERVER = env.PRODUCTION_SERVER
                    
                    // Set Docker registry (defaults to no registry)
                    env.DOCKER_REGISTRY = 'localhost'
                    
                    // Determine target environment based on branch name
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.TARGET_ENV = 'production'
                        env.TARGET_SERVER = env.PRODUCTION_SERVER
                    } else if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging') {
                        env.TARGET_ENV = 'staging'
                        env.TARGET_SERVER = env.STAGING_SERVER
                    } else {
                        env.TARGET_ENV = 'development'
                        env.TARGET_SERVER = env.STAGING_SERVER // Feature branches can deploy to staging
                    }
                    
                    echo "=================================================="
                    echo "Branch:           ${env.BRANCH_NAME}"
                    echo "Build for env:    ${env.TARGET_ENV}"
                    echo "Target server:    ${env.TARGET_SERVER}"
                    echo "Deployable:       ${env.IS_DEPLOYABLE_BRANCH}"
                    echo "=================================================="
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "🔧 Installing dependencies using npm ci for speed and consistency..."
                sh '''
                    if [ -f package-lock.json ]; then
                        npm ci
                    else
                        npm install
                    fi
                '''
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run check || echo "Linting completed with warnings"'
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
                sh 'npm run build'
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
                script {
                    sh """
                        docker run -d --name test-${env.BUILD_NUMBER} -p 3001:3000 ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}
                        
                        # Poll the health endpoint for up to 30 seconds
                        echo "Waiting for container to be healthy..."
                        for i in {1..15}; do
                            if curl -sf http://localhost:3001/api/health > /dev/null; then
                                echo "✅ Container is healthy!"
                                break
                            fi
                            echo "Still waiting... attempt \$i"
                            sleep 2
                        done
                        
                        # Final check that fails the stage if the container never became healthy
                        curl -f http://localhost:3001/api/health
                        
                        docker stop test-${env.BUILD_NUMBER}
                        docker rm test-${env.BUILD_NUMBER}
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                allOf {
                    expression { env.IS_DEPLOYABLE_BRANCH }
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
                    expression { env.IS_DEPLOYABLE_BRANCH }
                    expression { env.TARGET_SERVER != 'localhost' }
                }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'vps-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        echo "Deploying to ${env.TARGET_ENV} server using Docker Compose..."
                        
                        # Copy the compose file to the server
                        scp -i \$SSH_KEY -o StrictHostKeyChecking=no docker-compose.yml \$SSH_USER@${env.TARGET_SERVER}:/opt/domify/
                        
                        # Execute remote deployment script
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${env.TARGET_SERVER} << 'EOF_REMOTE'
                            cd /opt/domify
                            
                            # Export Jenkins variables for docker-compose to use
                            export DOCKER_REGISTRY=${env.DOCKER_REGISTRY}
                            export DOCKER_IMAGE=${env.DOCKER_IMAGE}
                            export TARGET_ENV=${env.TARGET_ENV}
                            export CONTAINER_NAME=${env.CONTAINER_NAME}
                            export PORT=${env.PORT}
                            
                            echo "Pulling new image: \${DOCKER_REGISTRY}/\${DOCKER_IMAGE}:\${TARGET_ENV}"
                            docker-compose pull
                            
                            echo "Restarting service..."
                            docker-compose up -d --force-recreate
                            
                            # Health check
                            echo "Waiting for deployment to be healthy..."
                            sleep 10
                            if curl -f http://localhost:${env.PORT}/api/health > /dev/null 2>&1; then
                                echo "✅ Deployment successful!"
                            else
                                echo "❌ Deployment failed! Checking logs..."
                                docker-compose logs
                                exit 1
                            fi
                            
                            echo "Cleaning up old Docker images..."
                            docker image prune -f
EOF_REMOTE
                    """
                }
            }
        }
        
        stage('Smoke Tests') {
            when {
                allOf {
                    expression { env.IS_DEPLOYABLE_BRANCH }
                    expression { env.TARGET_SERVER != 'localhost' }
                }
            }
            steps {
                sh """
                    echo "Running smoke tests against http://${env.TARGET_SERVER}:${env.PORT}"
                    sleep 5 # Give a moment for the server to be fully responsive
                    curl -f http://${env.TARGET_SERVER}:${env.PORT}/ || echo "Smoke test failed: Main page"
                    curl -f http://${env.TARGET_SERVER}:${env.PORT}/api/health || echo "Smoke test failed: Health endpoint"
                """
            }
        }
        
        stage('Deployment Skipped') {
            when {
                expression { env.IS_DEPLOYABLE_BRANCH && env.TARGET_SERVER == 'localhost' }
            }
            steps {
                echo "⚠️  Deployment skipped because server credentials were not found."
            }
        }
        
        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up local Docker resources..."
                sh 'docker system prune -af || true'
            }
        }
    }
    
    post {
        always {
            script {
                echo "Pipeline finished. Status: ${currentBuild.currentResult}"
            }
        }
        success {
            echo "🎉 Deployment completed successfully! Environment: ${env.TARGET_ENV}, Server: ${env.TARGET_SERVER}:${env.PORT}"
        }
        failure {
            echo "❌ Deployment FAILED! Build: ${env.BUILD_NUMBER}, Branch: ${env.BRANCH_NAME}, Environment: ${env.TARGET_ENV}."
        }
        unstable {
            echo "Build completed with warnings. Check logs for details."
        }
    }
}