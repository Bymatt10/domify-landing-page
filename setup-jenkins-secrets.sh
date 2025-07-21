#!/bin/bash

# Script para configurar secrets en Jenkins
# Ejecutar en el servidor Jenkins

echo "🔐 Configurando secrets en Jenkins para Domify..."
echo ""

# Verificar que estamos en Jenkins
if [ ! -d "/var/jenkins_home" ]; then
    echo "❌ Este script debe ejecutarse en el servidor Jenkins"
    echo "💡 Ejecuta: ssh tu-servidor-jenkins"
    exit 1
fi

# Lista de secrets requeridos
declare -A secrets=(
    ["public-supabase-url"]="URL pública de Supabase (ej: https://abcdefghijk.supabase.co)"
    ["public-supabase-anon-key"]="Clave anónima pública de Supabase"
    ["supabase-service-role-key"]="Clave de service role de Supabase"
    ["smtp-host"]="Servidor SMTP (ej: smtp.gmail.com)"
    ["smtp-port"]="Puerto SMTP (ej: 587)"
    ["smtp-user"]="Usuario SMTP"
    ["smtp-pass"]="Contraseña SMTP"
    ["from-email"]="Email remitente"
)

echo "📋 Secrets requeridos:"
echo ""

for id in "${!secrets[@]}"; do
    description="${secrets[$id]}"
    echo "   • $id: $description"
done

echo ""
echo "🚀 Para configurar estos secrets:"
echo ""
echo "1. Ve a Jenkins Dashboard"
echo "2. Manage Jenkins > Credentials"
echo "3. Selecciona 'Global' domain"
echo "4. Add Credentials"
echo "5. Para cada secret:"
echo "   - Kind: Secret text"
echo "   - Scope: Global"
echo "   - Secret: [valor real]"
echo "   - ID: [ID de la lista arriba]"
echo "   - Description: [descripción útil]"
echo ""

echo "🔍 Verificando secrets existentes..."
echo ""

# Verificar si existen los secrets (esto requiere acceso a Jenkins CLI o API)
if command -v jenkins-cli >/dev/null 2>&1; then
    echo "✅ Jenkins CLI disponible"
    echo "💡 Puedes verificar secrets con: jenkins-cli list-credentials"
else
    echo "⚠️ Jenkins CLI no disponible"
    echo "💡 Verifica manualmente en la interfaz web de Jenkins"
fi

echo ""
echo "📝 Comandos útiles:"
echo "   • Ver logs de Jenkins: tail -f /var/jenkins_home/jenkins.log"
echo "   • Reiniciar Jenkins: sudo systemctl restart jenkins"
echo "   • Verificar estado: sudo systemctl status jenkins"
echo ""

echo "🎯 Próximos pasos:"
echo "   1. Configura todos los secrets en Jenkins"
echo "   2. Ejecuta el pipeline nuevamente"
echo "   3. Verifica que pase la validación de secrets"
echo "" 