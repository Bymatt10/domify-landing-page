#!/usr/bin/env node

/**
 * Script para probar la configuración de Mailcow
 * Uso: node scripts/test-mailcow.js
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración SMTP
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'mail.domify.app',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: (parseInt(process.env.SMTP_PORT) || 587) === 465,
    auth: {
        user: process.env.SMTP_USER || 'info@domify.app',
        pass: process.env.SMTP_PASS || ''
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    requireTLS: true,
    logger: false,
    debug: false
};

// Función para probar la conexión
async function testMailcowConnection() {
    console.log('🧪 Probando configuración de Mailcow...\n');
    
    // Mostrar configuración (sin contraseña)
    console.log('📧 Configuración SMTP:');
    console.log(`   Host: ${SMTP_CONFIG.host}`);
    console.log(`   Puerto: ${SMTP_CONFIG.port}`);
    console.log(`   Usuario: ${SMTP_CONFIG.auth.user}`);
    console.log(`   Seguro: ${SMTP_CONFIG.secure ? 'Sí (SSL)' : 'No (TLS)'}`);
    console.log(`   Contraseña: ${SMTP_CONFIG.auth.pass ? '✅ Configurada' : '❌ No configurada'}\n`);

    if (!SMTP_CONFIG.auth.pass) {
        console.error('❌ Error: No se encontró la contraseña SMTP_PASS en las variables de entorno');
        console.log('💡 Asegúrate de tener configurado el archivo .env con SMTP_PASS');
        process.exit(1);
    }

    try {
        // Crear transporter
        console.log('🔌 Creando conexión SMTP...');
        const transporter = nodemailer.createTransporter(SMTP_CONFIG);

        // Verificar conexión
        console.log('🔍 Verificando conexión...');
        await transporter.verify();
        console.log('✅ Conexión SMTP verificada correctamente\n');

        // Enviar email de prueba
        console.log('📤 Enviando email de prueba...');
        const testEmail = {
            from: `"Domify Test" <${SMTP_CONFIG.auth.user}>`,
            to: SMTP_CONFIG.auth.user, // Enviar a nosotros mismos
            subject: '🧪 Prueba de configuración Mailcow - Domify',
            html: `
                <h2>Prueba de configuración Mailcow</h2>
                <p>Este es un email de prueba para verificar que la configuración de Mailcow está funcionando correctamente.</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-NI')}</p>
                <p><strong>Servidor SMTP:</strong> ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}</p>
                <p><strong>Usuario:</strong> ${SMTP_CONFIG.auth.user}</p>
                <hr>
                <p><small>Si recibes este email, la configuración de Mailcow está funcionando correctamente.</small></p>
            `,
            text: `
                Prueba de configuración Mailcow
                
                Este es un email de prueba para verificar que la configuración de Mailcow está funcionando correctamente.
                
                Fecha: ${new Date().toLocaleString('es-NI')}
                Servidor SMTP: ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}
                Usuario: ${SMTP_CONFIG.auth.user}
                
                Si recibes este email, la configuración de Mailcow está funcionando correctamente.
            `
        };

        const info = await transporter.sendMail(testEmail);
        
        console.log('✅ Email de prueba enviado correctamente');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log(`📬 Revisa tu correo ${SMTP_CONFIG.auth.user} para confirmar la recepción\n`);

        console.log('🎉 ¡Configuración de Mailcow funcionando correctamente!');
        console.log('💡 Tu aplicación Domify ya puede enviar correos usando Mailcow.');

    } catch (error) {
        console.error('❌ Error en la prueba de Mailcow:');
        console.error(error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   - Verifica que el usuario y contraseña sean correctos');
            console.log('   - Asegúrate de que el correo esté activo en Mailcow');
            console.log('   - Verifica que SMTP Auth esté habilitado');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   - Verifica que el servidor Mailcow esté funcionando');
            console.log('   - Confirma que el host sea correcto');
            console.log('   - Verifica que el puerto esté abierto');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('\n💡 Posibles soluciones:');
            console.log('   - Verifica la conectividad de red');
            console.log('   - Confirma que el firewall no esté bloqueando');
            console.log('   - Prueba con un puerto diferente (465 para SSL)');
        }
        
        process.exit(1);
    }
}

// Función para mostrar ayuda
function showHelp() {
    console.log(`
🧪 Script de Prueba de Mailcow para Domify

Uso:
  node scripts/test-mailcow.js

Requisitos:
  - Archivo .env configurado con las credenciales de Mailcow
  - Servidor Mailcow funcionando
  - Correo info@domify.app configurado

Variables de entorno necesarias:
  SMTP_HOST=mail.domify.app
  SMTP_PORT=587
  SMTP_USER=info@domify.app
  SMTP_PASS=tu_contraseña
  FROM_EMAIL=info@domify.app

Ejemplo de archivo .env:
  SMTP_HOST=mail.domify.app
  SMTP_PORT=587
  SMTP_USER=info@domify.app
  SMTP_PASS=tu_contraseña_segura
  FROM_EMAIL=info@domify.app
  ADMIN_EMAIL=admin@domify.app
`);
}

// Ejecutar script
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
} else {
    testMailcowConnection();
} 