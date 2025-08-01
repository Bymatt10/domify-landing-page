import { Auth0Client } from 'auth0';

// Auth0 configuration
const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID || 'your-client-id',
  redirectUri: typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : 'https://domify.app/auth/callback',
  audience: process.env.AUTH0_AUDIENCE || 'https://your-api.com',
  scope: 'openid profile email'
};

// Create Auth0 client
let auth0Client: Auth0Client | null = null;

export function getAuth0Client(): Auth0Client {
  if (!auth0Client) {
    auth0Client = new Auth0Client({
      domain: auth0Config.domain,
      client_id: auth0Config.clientId,
      redirect_uri: auth0Config.redirectUri,
      audience: auth0Config.audience,
      scope: auth0Config.scope,
      cacheLocation: 'localstorage'
    });
  }
  return auth0Client;
}

// Auth0 helper functions
export async function loginWithGoogle() {
  const client = getAuth0Client();
  await client.loginWithRedirect({
    connection: 'google-oauth2'
  });
}

export async function loginWithFacebook() {
  const client = getAuth0Client();
  await client.loginWithRedirect({
    connection: 'facebook'
  });
}

export async function logout() {
  const client = getAuth0Client();
  await client.logout({
    logoutParams: {
      returnTo: typeof window !== 'undefined' 
        ? window.location.origin 
        : 'https://domify.app'
    }
  });
}

export async function getUser() {
  const client = getAuth0Client();
  try {
    const user = await client.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function isAuthenticated() {
  const client = getAuth0Client();
  try {
    return await client.isAuthenticated();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export async function handleRedirectCallback() {
  const client = getAuth0Client();
  try {
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {
      await client.handleRedirectCallback();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error handling redirect callback:', error);
    return false;
  }
}

export async function getAccessToken() {
  const client = getAuth0Client();
  try {
    const token = await client.getTokenSilently();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

// Export config for environment variables
export { auth0Config }; 