pipeline {
    agent any

    environment {
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
                        
                        # Check if app is running
                        if curl -f http://localhost:${PORT} > /dev/null 2>&1; then
                            echo "✅ Application started successfully on port ${PORT}"
                        else
                            echo "⚠️ Application may not be responding yet, check logs"
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
                        for i in {1..5}; do
                            if curl -f http://localhost:${PORT} > /dev/null 2>&1; then
                                echo "✅ Health check passed - Application is running"
                                exit 0
                            fi
                            echo "⏳ Attempt \$i/5 - Waiting for application to start..."
                            sleep 3
                        done
                        echo "⚠️ Health check incomplete - Application may still be starting"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
            echo "🚀 Application should be running at http://localhost:${PORT}"
            echo "📝 Check logs with: tail -f app.log"
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
