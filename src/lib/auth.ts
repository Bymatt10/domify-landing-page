/**
 * Limpia cualquier estado previo de autenticación para evitar conflictos
 */
export function cleanPKCEState() {
  if (typeof window === 'undefined') return;

  // console.log removed

  try {
    // Limpiar localStorage - pero preservar estado PKCE activo si estamos en callback
    const isInCallback = window.location.pathname.includes('/auth/callback');
    const lsKeys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('auth'))) {
        
        // Durante callback, preservar PKCE keys activos
        if (isInCallback && (key.includes('pkce') || key.includes('code_verifier'))) {
          // console.log removed
          continue;
        }
        
        // En otros casos, limpiar normalmente
        if (!isInCallback && (key.includes('pkce') || key.includes('code_verifier'))) {
          lsKeys.push(key);
        } else if (!key.includes('pkce') && !key.includes('code_verifier')) {
          lsKeys.push(key);
        }
      }
    }

    // Borrar las claves en una pasada separada para evitar problemas de iteración
    lsKeys.forEach(key => {
      localStorage.removeItem(key);
      // console.log removed
    });

    // Limpiar sessionStorage
    const ssKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('pkce') || 
          key.includes('code_verifier') ||
          key.includes('auth'))) {
        ssKeys.push(key);
      }
    }

    // Borrar las claves en una pasada separada
    ssKeys.forEach(key => {
      sessionStorage.removeItem(key);
      // console.log removed
    });

    // Limpiar cookies relacionadas
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');

    cookies.forEach(cookie => {
      const cookieParts = cookie.trim().split('=');
      const cookieName = cookieParts[0];

      if (cookieName && (cookieName.includes('supabase') || 
          cookieName.includes('sb-') || 
          cookieName.includes('pkce') || 
          cookieName.includes('code_verifier') ||
          cookieName.includes('auth'))) {

        // Eliminar la cookie en múltiples rutas y dominios para mayor seguridad
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        // console.log removed
      }
    });

    // console.log removed
    return true;
  } catch (error) {
    console.error('❌ Error al limpiar estado de autenticación:', error);
    return false;
  }
}

/**
 * Función para limpiar el estado de OAuth y mostrar un mensaje al usuario
 */
export function clearOAuthStateAndRetry() {
  if (typeof window === 'undefined') return;

  // console.log removed
  
  const success = cleanPKCEState();
  
  if (success) {
    // Mostrar mensaje al usuario
    alert('Estado de autenticación limpiado. Por favor, intenta iniciar sesión con Google nuevamente.');
  } else {
    alert('Error al limpiar el estado. Por favor, recarga la página e intenta de nuevo.');
  }
  
  return success;
}

/**
 * Verifica si hay un estado de OAuth activo que pueda causar conflictos
 */
export function checkOAuthState() {
  if (typeof window === 'undefined') return null;

  const oauthKeys = [];
  
  // Verificar localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('pkce') || 
        key.includes('code_verifier') ||
        key.includes('auth'))) {
      oauthKeys.push(`localStorage: ${key}`);
    }
  }

  // Verificar sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('pkce') || 
        key.includes('code_verifier') ||
        key.includes('auth'))) {
      oauthKeys.push(`sessionStorage: ${key}`);
    }
  }

  return oauthKeys.length > 0 ? oauthKeys : null;
}
