pipeline {
    agent any

    environment {
        CONTAINER_NAME = 'domify-app'
        PORT = '3000'
        DOMAIN = "${env.DOMAIN ?: 'domify.app'}"
        
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

        stage('Deploy with Node.js') {
            steps {
                script {
                    // Stop any existing process on port 3000
                    sh """
                        # Kill any process using port 3000
                        sudo pkill -f 'node.*3000' || true
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
                        
                        # Start the application in background
                        nohup node build/index.js > app.log 2>&1 &
                        
                        # Wait a moment for startup
                        sleep 3
                        
                        # Check if app is running locally first
                        if curl -f http://localhost:${PORT} > /dev/null 2>&1; then
                            echo "✅ Application started successfully on port ${PORT}"
                        else
                            echo "⚠️ Application may not be responding yet, check logs"
                        fi
                    """
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
            echo "✅ Deployment completed successfully!"
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
            // Archive the log file
            archiveArtifacts artifacts: 'app.log', fingerprint: true, allowEmptyArchive: true
        }
    }
}
