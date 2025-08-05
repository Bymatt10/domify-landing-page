#!/usr/bin/env node

/**
 * Script para verificar la configuración de Google AdSense
 * Uso: node scripts/verify-adsense.js
 */

import { execSync } from 'child_process';

const SITE_URL = 'https://domify.app';
const PUBLISHER_ID = 'pub-8295935893651488';

console.log('🔍 Verificando configuración de Google AdSense...\n');

// Función para hacer peticiones HTTP
function fetchUrl(url) {
    try {
        return execSync(`curl -s "${url}"`, { encoding: 'utf8' });
    } catch (error) {
        return null;
    }
}

// Función para verificar ads.txt
function verifyAdsTxt() {
    console.log('📄 Verificando ads.txt...');
    
    const adsTxtUrl = `${SITE_URL}/ads.txt`;
    const content = fetchUrl(adsTxtUrl);
    
    if (!content) {
        console.log('❌ No se pudo acceder a ads.txt');
        return false;
    }
    
    console.log(`✅ ads.txt accesible en: ${adsTxtUrl}`);
    console.log(`📋 Contenido: ${content.trim()}`);
    
    // Verificar formato
    const expectedLine = `google.com, ${PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`;
    if (content.trim() === expectedLine) {
        console.log('✅ Formato de ads.txt correcto');
        return true;
    } else {
        console.log('❌ Formato de ads.txt incorrecto');
        console.log(`   Esperado: ${expectedLine}`);
        console.log(`   Encontrado: ${content.trim()}`);
        return false;
    }
}

// Función para verificar meta tag
function verifyMetaTag() {
    console.log('\n🏷️ Verificando meta tag de Google AdSense...');
    
    const homePage = fetchUrl(SITE_URL);
    
    if (!homePage) {
        console.log('❌ No se pudo acceder a la página principal');
        return false;
    }
    
    const metaTag = `name="google-adsense-account" content="ca-${PUBLISHER_ID}"`;
    
    if (homePage.includes(metaTag)) {
        console.log('✅ Meta tag de Google AdSense encontrada');
        return true;
    } else {
        console.log('❌ Meta tag de Google AdSense no encontrada');
        console.log('   Buscando:', metaTag);
        return false;
    }
}

// Función para verificar app-ads.txt
function verifyAppAdsTxt() {
    console.log('\n📱 Verificando app-ads.txt...');
    
    const appAdsTxtUrl = `${SITE_URL}/app-ads.txt`;
    const content = fetchUrl(appAdsTxtUrl);
    
    if (!content) {
        console.log('❌ No se pudo acceder a app-ads.txt');
        return false;
    }
    
    console.log(`✅ app-ads.txt accesible en: ${appAdsTxtUrl}`);
    console.log(`📋 Contenido: ${content.trim()}`);
    
    const expectedLine = `google.com, ${PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`;
    if (content.trim() === expectedLine) {
        console.log('✅ Formato de app-ads.txt correcto');
        return true;
    } else {
        console.log('❌ Formato de app-ads.txt incorrecto');
        return false;
    }
}

// Función para verificar robots.txt
function verifyRobotsTxt() {
    console.log('\n🤖 Verificando robots.txt...');
    
    const robotsTxtUrl = `${SITE_URL}/robots.txt`;
    const content = fetchUrl(robotsTxtUrl);
    
    if (!content) {
        console.log('❌ No se pudo acceder a robots.txt');
        return false;
    }
    
    console.log(`✅ robots.txt accesible en: ${robotsTxtUrl}`);
    
    // Verificar que no esté bloqueando ads.txt
    if (content.includes('Disallow: /ads.txt')) {
        console.log('❌ robots.txt está bloqueando ads.txt');
        return false;
    } else {
        console.log('✅ robots.txt no bloquea ads.txt');
        return true;
    }
}

// Función principal
async function main() {
    console.log(`🌐 Verificando sitio: ${SITE_URL}`);
    console.log(`📊 Publisher ID: ${PUBLISHER_ID}\n`);
    
    const results = {
        adsTxt: verifyAdsTxt(),
        metaTag: verifyMetaTag(),
        appAdsTxt: verifyAppAdsTxt(),
        robotsTxt: verifyRobotsTxt()
    };
    
    console.log('\n📊 Resumen de Verificación:');
    console.log('========================');
    console.log(`ads.txt: ${results.adsTxt ? '✅' : '❌'}`);
    console.log(`Meta tag: ${results.metaTag ? '✅' : '❌'}`);
    console.log(`app-ads.txt: ${results.appAdsTxt ? '✅' : '❌'}`);
    console.log(`robots.txt: ${results.robotsTxt ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 ¡Todas las verificaciones pasaron!');
        console.log('💡 Tu sitio está listo para Google AdSense.');
        console.log('📝 Próximos pasos:');
        console.log('   1. Despliega los cambios en producción');
        console.log('   2. Espera 24-48 horas para que Google verifique');
        console.log('   3. Revisa el estado en tu cuenta de AdSense');
    } else {
        console.log('\n⚠️ Algunas verificaciones fallaron.');
        console.log('🔧 Revisa los errores arriba y corrige los problemas.');
    }
    
    console.log('\n🔗 Enlaces útiles:');
    console.log(`   - ads.txt: ${SITE_URL}/ads.txt`);
    console.log(`   - app-ads.txt: ${SITE_URL}/app-ads.txt`);
    console.log(`   - robots.txt: ${SITE_URL}/robots.txt`);
    console.log(`   - Página principal: ${SITE_URL}`);
}

// Ejecutar verificación
main().catch(console.error); 