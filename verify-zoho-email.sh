#!/bin/bash

echo "🧪 Verificando configuración de Zoho Email..."

echo ""
echo "1. Verificando configuración SMTP:"
curl -s http://localhost:5173/api/debug/check-sendgrid | jq '.'

echo ""
echo "2. Verificando formulario de contacto:"
curl -s http://localhost:5173/api/debug/test-contact-form | jq '.'

echo ""
echo "3. Probando envío de email de prueba:"
curl -X POST http://localhost:5173/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Zoho","email":"test@example.com","subject":"Test Zoho Email","message":"Este es un mensaje de prueba para verificar que Zoho Email funciona correctamente."}' \
  -w "\n" | jq '.'

echo ""
echo "✅ Verificación completada!"
echo "📧 Si todo está configurado correctamente, deberías ver:"
echo "   - smtp_configured: true"
echo "   - from_email: tu_email@zoho.com"
echo "   - success: true en el envío de email"
echo ""
echo "🔧 Para configurar Zoho Email:"
echo "1. Edita .env.local con tus credenciales de Zoho"
echo "2. SMTP_HOST=smtp.zoho.com"
echo "3. SMTP_PORT=587"
echo "4. SMTP_USER=tu_email@zoho.com"
echo "5. SMTP_PASS=tu_password_de_aplicacion"
echo "6. FROM_EMAIL=tu_email@zoho.com" 