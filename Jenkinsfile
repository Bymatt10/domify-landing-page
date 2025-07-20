pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '4000'
        DOMAIN = "${env.DOMAIN ?: 'domify.app'}"
        
        // Environment variables for build with fallbacks
        PUBLIC_SUPABASE_URL = "${env.PUBLIC_SUPABASE_URL ?: 'https://fallback.supabase.co'}"
        PUBLIC_SUPABASE_ANON_KEY = "${env.PUBLIC_SUPABASE_ANON_KEY ?: 'fallback-anon-key'}"
        SUPABASE_SERVICE_ROLE_KEY = "${env.SUPABASE_SERVICE_ROLE_KEY ?: 'fallback-service-role-key'}"
        PRIVATE_SUPABASE_SERVICE_ROLE_KEY = "${env.SUPABASE_SERVICE_ROLE_KEY ?: 'fallback-service-role-key'}"
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

        stage('Check Docker Availability') {
            steps {
                script {
                    def dockerAvailable = sh(script: 'command -v docker', returnStatus: true) == 0
                    env.DOCKER_AVAILABLE = dockerAvailable.toString()
                    
                    if (dockerAvailable) {
                        echo "✅ Docker is available - will use containerized deployment"
                    } else {
                        echo "⚠️ Docker not found - will use direct Node.js deployment"
                        echo "💡 To use Docker, install it with:"
                        echo "   sudo apt update && sudo apt install docker.io"
                        echo "   sudo usermod -aG docker jenkins"
                        echo "   sudo systemctl restart jenkins"
                    }
                }
            }
        }

        stage('Deploy with Docker') {
            when {
                environment name: 'DOCKER_AVAILABLE', value: 'true'
            }
            steps {
                script {
                    echo "🐳 Deploying with Docker..."
                    
                    // Save current version for rollback
                    def currentImage = sh(script: "docker images ${DOCKER_IMAGE}:latest --format '{{.ID}}'", returnStdout: true).trim()
                    def currentContainer = sh(script: "docker ps -a --filter name=${CONTAINER_NAME} --format '{{.Image}}'", returnStdout: true).trim()
                    
                    if (currentImage && currentImage != '<none>') {
                        env.PREVIOUS_IMAGE = currentImage
                        echo "📸 Saved current image for rollback: ${currentImage}"
                    }
                    
                    if (currentContainer && currentContainer != '<none>') {
                        env.PREVIOUS_CONTAINER = currentContainer
                        echo "📸 Saved current container for rollback: ${currentContainer}"
                    }
                    
                    try {
                        // Stop and remove existing container
                        sh "docker stop ${CONTAINER_NAME} || true"
                        sh "docker rm ${CONTAINER_NAME} || true"
                        
                        // Build new image
                        sh """
                            docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                            --build-arg PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}' \
                            --build-arg PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}' \
                            --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                            --build-arg SMTP_HOST='${SMTP_HOST}' \
                            --build-arg SMTP_PORT='${SMTP_PORT}' \
                            --build-arg SMTP_USER='${SMTP_USER}' \
                            --build-arg SMTP_PASS='${SMTP_PASS}' \
                            --build-arg FROM_EMAIL='${FROM_EMAIL}' \
                            .
                        """
                        
                        // Tag as latest
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                        
                        // Run new container
                        sh """
                            docker run -d \
                            --name ${CONTAINER_NAME} \
                            -p ${PORT}:${PORT} \
                            -e NODE_ENV=production \
                            -e PORT=${PORT} \
                            -e PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}' \
                            -e PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}' \
                            -e SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                            -e PRIVATE_SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                            -e SMTP_HOST='${SMTP_HOST}' \
                            -e SMTP_PORT='${SMTP_PORT}' \
                            -e SMTP_USER='${SMTP_USER}' \
                            -e SMTP_PASS='${SMTP_PASS}' \
                            -e FROM_EMAIL='${FROM_EMAIL}' \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}:latest
                        """
                        
                        // Wait for container to start and check health
                        sleep(10)
                        
                        // Health check
                        def healthCheck = sh(script: "curl -f http://localhost:${PORT} > /dev/null 2>&1", returnStatus: true)
                        
                        if (healthCheck != 0) {
                            throw new Exception("Health check failed - new deployment is not responding")
                        }
                        
                        echo "✅ New deployment successful and healthy!"
                        
                    } catch (Exception e) {
                        echo "❌ Deployment failed: ${e.getMessage()}"
                        echo "🔄 Starting rollback to previous version..."
                        
                        // Rollback to previous version
                        sh "docker stop ${CONTAINER_NAME} || true"
                        sh "docker rm ${CONTAINER_NAME} || true"
                        
                        if (env.PREVIOUS_IMAGE && env.PREVIOUS_IMAGE != '<none>') {
                            // Restore previous image as latest
                            sh "docker tag ${env.PREVIOUS_IMAGE} ${DOCKER_IMAGE}:latest"
                            
                            // Run previous container
                            sh """
                                docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${PORT}:${PORT} \
                                -e NODE_ENV=production \
                                -e PORT=${PORT} \
                                -e PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}' \
                                -e PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}' \
                                -e SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                                -e PRIVATE_SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}' \
                                -e SMTP_HOST='${SMTP_HOST}' \
                                -e SMTP_PORT='${SMTP_PORT}' \
                                -e SMTP_USER='${SMTP_USER}' \
                                -e SMTP_PASS='${SMTP_PASS}' \
                                -e FROM_EMAIL='${FROM_EMAIL}' \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}:latest
                            """
                            
                            echo "✅ Rollback completed - previous version restored"
                        } else {
                            echo "⚠️ No previous version available for rollback"
                        }
                        
                        // Re-throw the exception to mark the build as failed
                        throw e
                    }
                }
            }
        }

        stage('Deploy with Node.js') {
            when {
                environment name: 'DOCKER_AVAILABLE', value: 'false'
            }
            steps {
                script {
                    echo "📦 Deploying with Node.js (fallback)..."
                    
                    // Save current process PID for rollback
                    def currentPid = sh(script: "pgrep -f 'node.*${PORT}'", returnStdout: true).trim()
                    if (currentPid) {
                        env.PREVIOUS_PID = currentPid
                        echo "📸 Saved current process PID for rollback: ${currentPid}"
                    }
                    
                    try {
                        // Stop any existing process on port 4000
                        sh """
                            # Kill any process using port 4000
                            sudo pkill -f 'node.*${PORT}' || true
                            sleep 2
                        """
                        
                        // Start the application in background
                        sh """
                            # Set environment variables and start the app
                            export NODE_ENV=production
                            export PORT=${PORT}
                            export HOSTNAME=0.0.0.0
                            export PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}'
                            export PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}'
                            export SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}'
                            export SMTP_HOST='${SMTP_HOST}'
                            export SMTP_PORT='${SMTP_PORT}'
                            export SMTP_USER='${SMTP_USER}'
                            export SMTP_PASS='${SMTP_PASS}'
                            export FROM_EMAIL='${FROM_EMAIL}'
                            
                            # Run app explicitly on configured port
                            nohup node build/index.js --port ${PORT} --host 0.0.0.0 > app.log 2>&1 &
                            
                            # Wait a moment for startup
                            sleep 3
                        """
                        
                        // Health check
                        def healthCheck = sh(script: "curl -f http://localhost:${PORT} > /dev/null 2>&1", returnStatus: true)
                        
                        if (healthCheck != 0) {
                            throw new Exception("Health check failed - new deployment is not responding")
                        }
                        
                        echo "✅ New deployment successful and healthy!"
                        
                    } catch (Exception e) {
                        echo "❌ Deployment failed: ${e.getMessage()}"
                        echo "🔄 Starting rollback to previous version..."
                        
                        // Kill new process if it exists
                        sh "sudo pkill -f 'node.*${PORT}' || true"
                        sleep(2)
                        
                        if (env.PREVIOUS_PID) {
                            // Try to restart the previous process
                            sh """
                                # Check if previous process still exists
                                if ps -p ${env.PREVIOUS_PID} > /dev/null 2>&1; then
                                    echo "✅ Previous process still running, no action needed"
                                else
                                    echo "🔄 Restarting previous version..."
                                    # Restart with previous environment (you might want to save this)
                                    export NODE_ENV=production
                                    export PORT=${PORT}
                                    export HOSTNAME=0.0.0.0
                                    export PUBLIC_SUPABASE_URL='${PUBLIC_SUPABASE_URL}'
                                    export PUBLIC_SUPABASE_ANON_KEY='${PUBLIC_SUPABASE_ANON_KEY}'
                                    export SUPABASE_SERVICE_ROLE_KEY='${SUPABASE_SERVICE_ROLE_KEY}'
                                    export SMTP_HOST='${SMTP_HOST}'
                                    export SMTP_PORT='${SMTP_PORT}'
                                    export SMTP_USER='${SMTP_USER}'
                                    export SMTP_PASS='${SMTP_PASS}'
                                    export FROM_EMAIL='${FROM_EMAIL}'
                                    
                                    nohup node build/index.js --port ${PORT} --host 0.0.0.0 > app.log 2>&1 &
                                fi
                            """
                            
                            echo "✅ Rollback completed - previous version restored"
                        } else {
                            echo "⚠️ No previous version available for rollback"
                        }
                        
                        // Re-throw the exception to mark the build as failed
                        throw e
                    }
                }
            }
        }

        stage('Configure Reverse Proxy') {
            steps {
                script {
                    // Configure nginx or Apache to proxy to the Node.js app
                    sh """
                        # Check if nginx is available
                        if command -v nginx > /dev/null 2>&1; then
                            echo "📝 Configuring nginx reverse proxy..."
                            
                            # Create nginx configuration for domify
                            sudo tee /etc/nginx/sites-available/domify > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirect HTTP to HTTPS (optional)
    # return 301 https://\\\$server_name\\\$request_uri;
    
    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF
                            
                            # Enable the site
                            sudo ln -sf /etc/nginx/sites-available/domify /etc/nginx/sites-enabled/
                            
                            # Test nginx configuration
                            sudo nginx -t && sudo systemctl reload nginx
                            echo "✅ Nginx configured for domain: ${DOMAIN}"
                        else
                            echo "⚠️ Nginx not found. Application running on port ${PORT}"
                            echo "💡 Configure your web server to proxy requests to localhost:${PORT}"
                        fi
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    // Give the app time to start
                    sleep(5)
                    
                    // Check if the application is responding
                    sh """
                        echo "🔍 Testing application accessibility..."
                        
                        # Test localhost
                        for i in {1..5}; do
                            if curl -f http://localhost:${PORT} > /dev/null 2>&1; then
                                echo "✅ Local health check passed - Application is running on port ${PORT}"
                                break
                            fi
                            echo "⏳ Attempt \$i/5 - Waiting for application to start..."
                            sleep 3
                        done
                        
                        # Test domain (if accessible)
                        if curl -f http://${DOMAIN} > /dev/null 2>&1; then
                            echo "✅ Domain health check passed - Application accessible at http://${DOMAIN}"
                        else
                            echo "⚠️ Domain not yet accessible. May need DNS configuration."
                        fi
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.DOCKER_AVAILABLE == 'true') {
                    echo "✅ Deployment completed successfully with Docker!"
                    echo "🐳 Container: ${CONTAINER_NAME}"
                } else {
                    echo "✅ Deployment completed successfully with Node.js!"
                    echo "📦 Process: node build/index.js"
                }
            }
            echo "🚀 Application is running on port ${PORT}"
            echo "🌐 Should be accessible at: http://${DOMAIN}"
            echo "📝 Check logs with: tail -f app.log"
            echo ""
            echo "📋 Next steps if domain not working:"
            echo "   1. Point your domain DNS to this server IP"
            echo "   2. Configure firewall to allow port 80/443"
            echo "   3. Set DOMAIN environment variable in Jenkins"
        }
        failure {
            echo "❌ Deployment failed. Check logs for details."
            sh "cat app.log || echo 'No log file found'"
        }
        always {
            // Clean up old Docker images if Docker is available
            script {
                if (env.DOCKER_AVAILABLE == 'true') {
                    sh "docker image prune -f || true"
                }
            }
            // Archive the log file
            archiveArtifacts artifacts: 'app.log', fingerprint: true, allowEmptyArchive: true
        }
    }
}
