// Auth0 Configuration
// Replace these with your actual Auth0 credentials from https://manage.auth0.com/

// Validate required environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin

// Check if config is valid
export const isAuth0Configured = Boolean(domain && clientId)

if (!isAuth0Configured) {
  console.error('❌ Missing Auth0 configuration!')
  console.error('Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your .env file')
  console.error('Current values:', { domain: domain || 'MISSING', clientId: clientId || 'MISSING' })
}

export const auth0Config = {
  domain: domain || 'placeholder',
  clientId: clientId || 'placeholder',
  authorizationParams: {
    redirect_uri: redirectUri,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Optional: for API access
    scope: 'openid profile email',
  },
  // Use React Router for navigation
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
}

