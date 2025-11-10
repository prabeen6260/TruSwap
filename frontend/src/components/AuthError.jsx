import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { auth0Config } from '../auth/auth0-config.js'

function AuthError() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    // If it's a callback URL error, show helpful message
    if (error === 'access_denied' && errorDescription?.includes('Service not found')) {
      console.error('Auth0 Callback URL Error:', errorDescription)
    }
  }, [error, errorDescription])

  // Handle "stuck session" - user tried to log in with non-Truman email
  const handleTryAgain = () => {
    // Clear only Auth0-specific localStorage keys (preserve wishlist and other app data)
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('@@auth0spa') || key.startsWith('auth0') || key.includes('auth0'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // Clear session storage
    sessionStorage.clear()
    
    // Always redirect to Auth0 logout endpoint to clear the session
    // This is necessary because Auth0 remembers the failed login attempt in a session cookie
    // Even if the user isn't "authenticated" in our app, Auth0 has a session that needs clearing
    const domain = auth0Config.domain || import.meta.env.VITE_AUTH0_DOMAIN
    const clientId = auth0Config.clientId || import.meta.env.VITE_AUTH0_CLIENT_ID
    
    if (domain && clientId) {
      // Construct Auth0 logout URL with federated=true to clear Google session
      const logoutUrl = `https://${domain}/v2/logout?` +
        `client_id=${clientId}&` +
        `returnTo=${encodeURIComponent(window.location.origin)}&` +
        `federated=true`
      
      // Redirect to Auth0 logout, which will clear the session and redirect back
      window.location.href = logoutUrl
    } else {
      // Fallback: try using the logout hook if config is missing
      if (isAuthenticated) {
        logout({
          logoutParams: {
            returnTo: window.location.origin,
            federated: true,
          },
        })
      } else {
        // Last resort: just redirect to home and hope for the best
        window.location.href = window.location.origin
      }
    }
  }

  // Callback URL configuration error
  if (error === 'access_denied' && errorDescription?.includes('Service not found')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">Auth0 Configuration Error</h2>
          <p className="text-gray-700 mb-4">
            The callback URL <code className="bg-gray-100 px-2 py-1 rounded">{window.location.origin}</code> is not registered in your Auth0 application.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">To fix this:</p>
            <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
              <li>Go to <a href="https://manage.auth0.com" target="_blank" rel="noopener noreferrer" className="underline">Auth0 Dashboard</a></li>
              <li>Navigate to <strong>Applications</strong> → Your Application</li>
              <li>Scroll to <strong>Allowed Callback URLs</strong></li>
              <li>Add: <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code></li>
              <li>Also add: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/*</code></li>
              <li>Scroll to <strong>Allowed Logout URLs</strong> and add: <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code></li>
              <li>Click <strong>Save Changes</strong></li>
              <li>Refresh this page and try logging in again</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Access denied - likely non-Truman email blocked (stuck session)
  if (error === 'access_denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-red-600 mb-4 font-medium">
            Only users with a valid @truman.edu email can access this application.
          </p>
          {errorDescription && (
            <p className="text-sm text-gray-600 mb-4 italic">
              Error: {decodeURIComponent(errorDescription)}
            </p>
          )}
          <p className="text-gray-700 mb-6">
            If you tried to sign in with a different account (like a personal Gmail), 
            please click "Try Again" to clear your session and sign in with your Truman email.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            {/* <button
              onClick={() => {
                // Force account selection immediately without clearing first
                loginWithRedirect({
                  authorizationParams: {
                    prompt: 'select_account', // Force account selection screen
                  },
                  appState: {
                    returnTo: window.location.origin,
                  },
                })
              }}
              className="btn-outline w-full"
            >
              Login with Different Account
            </button> */}
          </div>
        </div>
      </div>
    )
  }

  // Other errors
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
        <p className="text-gray-700 mb-4">{errorDescription || error}</p>
        <button
          onClick={handleTryAgain}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export default AuthError

