import { auth } from 'express-openid-connect';

// Auth0 configuration for Single Page Application
export const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET || 'a7f447e288545bb9f64d9285ea1bf29001b20949ef335d19bb4940fdc486093d',
  baseURL: process.env.AUTH0_BASE_URL || 'https://domify.app',
  clientID: process.env.AUTH0_CLIENT_ID || '9gkLh80Ec4dSJaI72k3C0pYEwlFll5xO',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-00zfnpqelho1o4f0.us.auth0.com',
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  },
  routes: {
    callback: '/auth/callback',
    login: '/auth/login',
    logout: '/auth/logout'
  }
};

// Export the auth middleware
export { auth };

// Helper function to check if user is authenticated
export function isAuthenticated(req: any): boolean {
  return req.oidc?.isAuthenticated() || false;
}

// Helper function to get user info
export function getUser(req: any) {
  return req.oidc?.user || null;
} 