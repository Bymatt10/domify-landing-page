pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'domify'
        DOCKER_TAG = "${BUILD_NUMBER}"
        CONTAINER_NAME = 'domify-app'
        PORT = '4000'
        DOMAIN = "${env.DOMAIN ?: 'domify.app'}"
        
        // Using environment variables (configured in Jenkins Global Properties)
        PUBLIC_SUPABASE_URL = "${env.PUBLIC_SUPABASE_URL}"
        PUBLIC_SUPABASE_ANON_KEY = "${env.PUBLIC_SUPABASE_ANON_KEY}"
        SUPABASE_SERVICE_ROLE_KEY = "${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}"
        SMTP_HOST = "${env.SMTP_HOST}"
        SMTP_PORT = "${env.SMTP_PORT}"
        SMTP_USER = "${env.SMTP_USER}"
        SMTP_PASS = "${env.SMTP_PASS}"
        FROM_EMAIL = "${env.FROM_EMAIL}"
        
        // Keep fallbacks for non-sensitive vars
        PRIVATE_SUPABASE_SERVICE_ROLE_KEY = "${SUPABASE_SERVICE_ROLE_KEY}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Environment Variables') {
            steps {
                script {
                    echo "🔐 Validating Jenkins environment variables configuration..."
                    
                    def requiredVars = [
                        'PUBLIC_SUPABASE_URL': env.PUBLIC_SUPABASE_URL,
                        'PUBLIC_SUPABASE_ANON_KEY': env.PUBLIC_SUPABASE_ANON_KEY,
                        'PUBLIC_SUPABASE_SERVICE_ROLE_KEY': env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
                        'SMTP_HOST': env.SMTP_HOST,
                        'SMTP_USER': env.SMTP_USER,
                        'SMTP_PASS': env.SMTP_PASS,
                        'FROM_EMAIL': env.FROM_EMAIL
                    ]
                    
                    def missingVars = []
                    requiredVars.each { name, value ->
                        if (!value || value.trim().isEmpty()) {
                            missingVars.add(name)
                        }
                    }
                    
                    if (!missingVars.isEmpty()) {
                        def errorMsg = "❌ Missing or empty environment variables: ${missingVars.join(', ')}\n"
                        errorMsg += "💡 Please configure these in Jenkins:\n"
                        errorMsg += "   - Go to Manage Jenkins > Configure System\n"
                        errorMsg += "   - Scroll to 'Global properties' > 'Environment variables'\n"
                        errorMsg += "   - Add the missing variables:\n"
                        missingVars.each { var ->
                            errorMsg += "     * ${var}\n"
                        }
                        error(errorMsg)
                    }
                    
                    echo "✅ All required environment variables are configured"
                  
                }
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
                    echo "Docker available: ${dockerAvailable}"
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
                        
                        // Build new image with environment variables (hidden for security)
                        echo "🔒 Building Docker image with secure environment variables..."
                        sh """
                            set +x  # Hide sensitive commands from logs
                            docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} \
                            --build-arg PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \
                            --build-arg PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \
                            --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}" \
                            --build-arg SMTP_HOST="${env.SMTP_HOST}" \
                            --build-arg SMTP_PORT="${env.SMTP_PORT}" \
                            --build-arg SMTP_USER="${env.SMTP_USER}" \
                            --build-arg SMTP_PASS="${env.SMTP_PASS}" \
                            --build-arg FROM_EMAIL="${env.FROM_EMAIL}" \
                            .
                            set -x  # Re-enable command logging
                        """
                        
                        // Tag as latest
                        sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                        
                        // Run new container with environment variables (hidden for security)
                        echo "🔒 Starting container with secure environment variables..."
                        sh """
                            set +x  # Hide sensitive commands from logs
                            docker run -d \
                            --name ${CONTAINER_NAME} \
                            -p ${PORT}:${PORT} \
                            -e NODE_ENV=production \
                            -e PORT=${PORT} \
                            -e PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \
                            -e PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \
                            -e SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}" \
                            -e PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}" \
                            -e SMTP_HOST="${env.SMTP_HOST}" \
                            -e SMTP_PORT="${env.SMTP_PORT}" \
                            -e SMTP_USER="${env.SMTP_USER}" \
                            -e SMTP_PASS="${env.SMTP_PASS}" \
                            -e FROM_EMAIL="${env.FROM_EMAIL}" \
                            --restart unless-stopped \
                            ${DOCKER_IMAGE}:latest
                            set -x  # Re-enable command logging
                        """
                        
                        // Wait for container to start and SvelteKit to initialize
                        echo "⏳ Waiting for container to start and SvelteKit to initialize..."
                        sleep(30)
                        
                        // Network and health check diagnosis
                        def healthCheckPassed = false
                        for (int i = 1; i <= 5; i++) {
                            echo "🔍 Health check attempt ${i}/5..."
                            
                            // Check if container is running
                            def containerRunning = sh(script: "docker ps --filter name=${CONTAINER_NAME} --filter status=running --quiet", returnStdout: true).trim()
                            if (!containerRunning) {
                                echo "❌ Container is not running"
                                sh "docker ps --filter name=${CONTAINER_NAME}"
                                sh "docker logs --tail 20 ${CONTAINER_NAME}"
                                sleep(10)
                                continue
                            }
                            
                            // Diagnose network issues
                            echo "🔍 Checking container network status..."
                            sh "docker ps --filter name=${CONTAINER_NAME}"
                            sh "docker port ${CONTAINER_NAME}"
                            sh "netstat -tlnp | grep :${PORT} || echo 'Port not bound on host'"
                            
                            // Try health check from inside container first
                            echo "🔍 Testing from inside container..."
                            def internalCheck = sh(script: "docker exec ${CONTAINER_NAME} curl -f -m 10 http://localhost:${PORT}/api/health 2>/dev/null", returnStatus: true)
                            
                            if (internalCheck == 0) {
                                echo "✅ Internal health check passed"
                                
                                // Get and display health check response
                                def healthResponse = sh(script: "docker exec ${CONTAINER_NAME} curl -s http://localhost:${PORT}/api/health", returnStdout: true).trim()
                                echo "📋 Health response: ${healthResponse}"
                            } else {
                                echo "❌ Internal health check failed - app not responding"
                                sh "docker logs --tail 15 ${CONTAINER_NAME}"
                                
                                // Check if the app is at least listening on the port
                                def portCheck = sh(script: "docker exec ${CONTAINER_NAME} netstat -tlnp | grep :${PORT} || echo 'Port not listening'", returnStdout: true)
                                echo "🔍 Port status inside container: ${portCheck}"
                                
                                sleep(15)
                                continue
                            }
                            
                            // Try health check from host
                            echo "🔍 Testing from host..."
                            def healthCheck = sh(script: "curl -f -m 10 http://localhost:${PORT}/api/health 2>/dev/null", returnStatus: true)
                            
                            if (healthCheck == 0) {
                                // Get and display health check response from host
                                def hostHealthResponse = sh(script: "curl -s http://localhost:${PORT}/api/health", returnStdout: true).trim()
                                echo "📋 Health response from host: ${hostHealthResponse}"
                                
                                // Verify static assets are served correctly
                                echo "🔍 Checking static assets..."
                                def faviconCheck = sh(script: "curl -f -m 5 http://localhost:${PORT}/favicon.png 2>/dev/null", returnStatus: true)
                                def logoCheck = sh(script: "curl -f -m 5 http://localhost:${PORT}/icon-domify.png 2>/dev/null", returnStatus: true)
                                
                                if (faviconCheck == 0) {
                                    echo "✅ Favicon is served correctly"
                                } else {
                                    echo "⚠️ Favicon not accessible"
                                }
                                
                                if (logoCheck == 0) {
                                    echo "✅ Logo/Social media image is served correctly"
                                } else {
                                    echo "⚠️ Logo/Social media image not accessible"
                                }
                                
                                healthCheckPassed = true
                                echo "✅ Health check passed - App deployed successfully!"
                                break
                            } else {
                                echo "⚠️ Host health check failed - network issue"
                                echo "🔍 Trying alternative host addresses..."
                                
                                // Try container IP directly
                                def containerIP = sh(script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_NAME}", returnStdout: true).trim()
                                echo "📋 Container IP: ${containerIP}"
                                
                                if (containerIP) {
                                    def ipCheck = sh(script: "curl -f -m 10 http://${containerIP}:${PORT}/api/health 2>/dev/null", returnStatus: true)
                                    if (ipCheck == 0) {
                                        echo "✅ Direct IP health check passed"
                                        
                                        // Get and display health check response from IP
                                        def ipHealthResponse = sh(script: "curl -s http://${containerIP}:${PORT}/api/health", returnStdout: true).trim()
                                        echo "📋 Health response from IP: ${ipHealthResponse}"
                                        
                                        // Verify static assets via IP
                                        echo "🔍 Checking static assets via IP..."
                                        def faviconIPCheck = sh(script: "curl -f -m 5 http://${containerIP}:${PORT}/favicon.png 2>/dev/null", returnStatus: true)
                                        def logoIPCheck = sh(script: "curl -f -m 5 http://${containerIP}:${PORT}/icon-domify.png 2>/dev/null", returnStatus: true)
                                        
                                        if (faviconIPCheck == 0) {
                                            echo "✅ Favicon is served correctly via IP"
                                        } else {
                                            echo "⚠️ Favicon not accessible via IP"
                                        }
                                        
                                        if (logoIPCheck == 0) {
                                            echo "✅ Logo/Social media image is served correctly via IP"
                                        } else {
                                            echo "⚠️ Logo/Social media image not accessible via IP"
                                        }
                                        
                                        healthCheckPassed = true
                                        break
                                    }
                                }
                                
                                sleep(15)
                            }
                        }
                        
                        if (!healthCheckPassed) {
                            throw new Exception("Health check failed - deployment not responding")
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
                            
                            // Run previous container with environment variables (hidden for security)
                            echo "🔒 Restoring previous container with secure environment variables..."
                            sh """
                                set +x  # Hide sensitive commands from logs
                                docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${PORT}:${PORT} \
                                -e NODE_ENV=production \
                                -e PORT=${PORT} \
                                -e PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \
                                -e PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \
                                -e SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}" \
                                -e PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}" \
                                -e SMTP_HOST="${env.SMTP_HOST}" \
                                -e SMTP_PORT="${env.SMTP_PORT}" \
                                -e SMTP_USER="${env.SMTP_USER}" \
                                -e SMTP_PASS="${env.SMTP_PASS}" \
                                -e FROM_EMAIL="${env.FROM_EMAIL}" \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}:latest
                                set -x  # Re-enable command logging
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
                        
                        // Start the application in background (hidden for security)
                        echo "🔒 Starting Node.js application with secure environment variables..."
                        sh """
                            set +x  # Hide sensitive commands from logs
                            # Set environment variables and start the app
                            export NODE_ENV=production
                            export PORT=${PORT}
                            export HOSTNAME=0.0.0.0
                            export PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}"
                            export PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}"
                            export SUPABASE_SERVICE_ROLE_KEY="${env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY}"
                            export SMTP_HOST="${env.SMTP_HOST}"
                            export SMTP_PORT="${env.SMTP_PORT}"
                            export SMTP_USER="${env.SMTP_USER}"
                            export SMTP_PASS="${env.SMTP_PASS}"
                            export FROM_EMAIL="${env.FROM_EMAIL}"
                            
                            # Run app explicitly on configured port
                            nohup node build/index.js --port ${PORT} --host 0.0.0.0 > app.log 2>&1 &
                            
                            # Wait for SvelteKit to initialize
                            sleep 30
                            set -x  # Re-enable command logging
                        """
                        
                        // Health check with retry logic
                        def healthCheckPassed = false
                        for (int i = 1; i <= 5; i++) {
                            echo "🔍 Health check attempt ${i}/5..."
                            
                            // Check if process is running
                            def processCheck = sh(script: "pgrep -f 'node.*build/index.js'", returnStatus: true)
                            if (processCheck != 0) {
                                echo "❌ Node.js process not running"
                                sh "tail -20 app.log || echo 'No log file found'"
                                sleep(10)
                                continue
                            }
                            
                            // Try health check
                            def healthCheck = sh(script: "curl -f -m 10 http://localhost:${PORT}/api/health 2>/dev/null", returnStatus: true)
                            
                            if (healthCheck == 0) {
                                // Get and display health check response
                                def healthResponse = sh(script: "curl -s http://localhost:${PORT}/api/health", returnStdout: true).trim()
                                echo "📋 Health response: ${healthResponse}"
                                
                                // Test root endpoint as well
                                def rootCheck = sh(script: "curl -f -m 10 http://localhost:${PORT} 2>/dev/null", returnStatus: true)
                                if (rootCheck == 0) {
                                    echo "✅ Root endpoint also accessible"
                                } else {
                                    echo "⚠️ Root endpoint not accessible, but health endpoint is working"
                                }
                                
                                healthCheckPassed = true
                                echo "✅ Health check passed - App deployed successfully!"
                                break
                            } else {
                                echo "❌ Health check failed"
                                sh "tail -10 app.log || echo 'No log file found'"
                                
                                // Check if port is being used
                                def portCheck = sh(script: "netstat -tlnp | grep :${PORT} || echo 'Port not in use'", returnStdout: true)
                                echo "🔍 Port status: ${portCheck}"
                                
                                sleep(15)
                            }
                        }
                        
                        if (!healthCheckPassed) {
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
                    // Give the app time to start (already waited in previous stages, but being safe)
                    sleep(5)
                    
                    // Check if the application is responding
                    sh """
                        echo "🔍 Final application accessibility test..."
                        
                        # Test localhost health endpoint
                        if curl -f -m 10 http://localhost:${PORT}/api/health > /dev/null 2>&1; then
                            echo "✅ Local health check passed - Application is running on port ${PORT}"
                            
                            # Display health status
                            echo "📋 Health status:"
                            curl -s http://localhost:${PORT}/api/health | head -5
                            
                            # Test root endpoint
                            if curl -f -m 10 http://localhost:${PORT} > /dev/null 2>&1; then
                                echo "✅ Root endpoint also accessible"
                            else
                                echo "⚠️ Root endpoint check failed, but health endpoint is working"
                            fi
                        else
                            echo "❌ Local health check failed"
                            if [ -f app.log ]; then
                                echo "📋 Recent application logs:"
                                tail -10 app.log
                            fi
                            exit 1
                        fi
                        
                        # Test domain health endpoint (if accessible)
                        if curl -f -m 10 http://${DOMAIN}/api/health > /dev/null 2>&1; then
                            echo "✅ Domain health check passed - Application accessible at http://${DOMAIN}"
                            
                            # Display domain health status
                            echo "📋 Domain health status:"
                            curl -s http://${DOMAIN}/api/health | head -5
                        else
                            echo "⚠️ Domain not yet accessible. May need DNS configuration."
                        fi
                    """
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.DOCKER_AVAILABLE == 'true') {
                    sh "docker image prune -f || true"
                }
                // Archive the log file
                archiveArtifacts artifacts: 'app.log', fingerprint: true, allowEmptyArchive: true
            }
        }
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
            script {
                echo "❌ Deployment failed. Check logs for details."
                sh "cat app.log || echo 'No log file found'"
            }
        }
    }
}
