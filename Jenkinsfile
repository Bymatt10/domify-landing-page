pipeline {
    agent any

    environment {
        DOCKER_IMAGE    = 'domify-landing'
        CONTAINER_NAME  = 'domify-landing-app'
        PORT_HOST       = '5000'
        // Ruta al .env en el servidor Jenkins/VPS (fuera del repo, seguro)
        ENV_FILE        = '/var/lib/jenkins/.env.domify'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Load & Validate .env') {
            steps {
                script {
                    echo "📂 Cargando variables desde ${ENV_FILE}..."

                    // Verificar que el archivo existe en el servidor
                    def envFileExists = sh(
                        script: "test -f ${ENV_FILE} && echo yes || echo no",
                        returnStdout: true
                    ).trim()

                    if (envFileExists == 'no') {
                        error("""❌ No se encontró el archivo ${ENV_FILE} en el servidor Jenkins.
Crea el archivo con este contenido:
  PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
  PRIVATE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
  SMTP_HOST=smtp.example.com
  SMTP_PORT=587
  SMTP_USER=user@example.com
  SMTP_PASS=yourpassword
  FROM_EMAIL=noreply@domify.app
Luego dale permisos: chmod 600 ${ENV_FILE}""")
                    }

                    // Leer cada variable del archivo .env
                    def loadVar = { String key ->
                        def val = sh(
                            script: "grep -E '^${key}=' ${ENV_FILE} | cut -d'=' -f2- | tr -d '\\r\\n'",
                            returnStdout: true
                        ).trim()
                        return val ?: ''
                    }

                    env.PUBLIC_SUPABASE_URL              = loadVar('PUBLIC_SUPABASE_URL')
                    env.PUBLIC_SUPABASE_ANON_KEY         = loadVar('PUBLIC_SUPABASE_ANON_KEY')
                    env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY = loadVar('PRIVATE_SUPABASE_SERVICE_ROLE_KEY')
                    env.SMTP_HOST                        = loadVar('SMTP_HOST') ?: ''
                    env.SMTP_PORT                        = loadVar('SMTP_PORT') ?: '587'
                    env.SMTP_USER                        = loadVar('SMTP_USER') ?: ''
                    env.SMTP_PASS                        = loadVar('SMTP_PASS') ?: ''
                    env.FROM_EMAIL                       = loadVar('FROM_EMAIL') ?: 'noreply@domify.app'

                    // Validar las críticas
                    def missing = []
                    if (!env.PUBLIC_SUPABASE_URL)               missing << 'PUBLIC_SUPABASE_URL'
                    if (!env.PUBLIC_SUPABASE_ANON_KEY)          missing << 'PUBLIC_SUPABASE_ANON_KEY'
                    if (!env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY) missing << 'PRIVATE_SUPABASE_SERVICE_ROLE_KEY'

                    if (missing) {
                        error("❌ Variables faltantes en ${ENV_FILE}: ${missing.join(', ')}")
                    }

                    echo "✅ Todas las variables de entorno cargadas correctamente."
                }
            }
        }

        stage('Build & Deploy Docker') {
            steps {
                script {
                    echo "🐳 Construyendo imagen Docker..."

                    sh """
                        docker build -t ${DOCKER_IMAGE}:latest \\
                        --build-arg PUBLIC_SUPABASE_URL="${env.PUBLIC_SUPABASE_URL}" \\
                        --build-arg PUBLIC_SUPABASE_ANON_KEY="${env.PUBLIC_SUPABASE_ANON_KEY}" \\
                        --build-arg PRIVATE_SUPABASE_SERVICE_ROLE_KEY="${env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY}" \\
                        --build-arg SMTP_HOST="${env.SMTP_HOST}" \\
                        --build-arg SMTP_PORT="${env.SMTP_PORT}" \\
                        --build-arg SMTP_USER="${env.SMTP_USER}" \\
                        --build-arg SMTP_PASS="${env.SMTP_PASS}" \\
                        --build-arg FROM_EMAIL="${env.FROM_EMAIL}" \\
                        --progress=plain \\
                        .
                    """

                    echo "🛑 Limpiando contenedor anterior..."
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    echo "🚀 Iniciando nuevo contenedor en puerto ${PORT_HOST}..."
                    sh """
                        docker run -d \\
                        --name ${CONTAINER_NAME} \\
                        -p ${PORT_HOST}:3000 \\
                        --restart unless-stopped \\
                        ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            sh "docker image prune -f || true"
        }
        success {
            echo "✅ Domify desplegado exitosamente en el puerto ${PORT_HOST}."
        }
        failure {
            echo "❌ Pipeline fallido. Revisa los logs arriba para ver el error exacto."
        }
    }
}