/**
 * Configuración de Analytics y tracking SEO
 */

// Google Analytics 4 Configuration
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Reemplazar con tu ID real

// Google Tag Manager Configuration
export const GTM_ID = 'GTM-XXXXXXXX'; // Reemplazar con tu ID real

// Google Search Console verification
export const GOOGLE_SITE_VERIFICATION = 'your-verification-code';

// Bing Webmaster Tools verification
export const BING_SITE_VERIFICATION = 'your-bing-verification-code';

// Facebook Pixel ID
export const FACEBOOK_PIXEL_ID = 'your-facebook-pixel-id';

// LinkedIn Insight Tag
export const LINKEDIN_PARTNER_ID = 'your-linkedin-partner-id';

/**
 * Función para inicializar Google Analytics
 */
export function initGA() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
}

/**
 * Función para trackear eventos personalizados
 */
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Función para trackear vistas de página
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
}

/**
 * Función para trackear búsquedas
 */
export function trackSearch(searchTerm: string, resultsCount?: number) {
  trackEvent('search', 'engagement', searchTerm, resultsCount);
}

/**
 * Función para trackear clicks en proveedores
 */
export function trackProviderClick(providerId: string, providerName: string, category: string) {
  trackEvent('click', 'provider_profile', `${providerName} (${category})`);
}

/**
 * Función para trackear contactos con proveedores
 */
export function trackProviderContact(providerId: string, providerName: string, method: 'whatsapp' | 'phone' | 'email') {
  trackEvent('contact', 'provider_interaction', `${providerName} - ${method}`);
}

/**
 * Función para trackear registros
 */
export function trackRegistration(method: 'email' | 'google' | 'facebook') {
  trackEvent('sign_up', 'engagement', method);
}

/**
 * Función para trackear conversiones de proveedores
 */
export function trackProviderSignup() {
  trackEvent('sign_up', 'provider_registration', 'become_provider');
}

// Declaración de tipos para window
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
} 