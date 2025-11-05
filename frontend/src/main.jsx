import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'
import { auth0Config, isAuth0Configured } from './auth/auth0-config.js'
import Auth0ConfigError from './components/Auth0ConfigError.jsx'

// Only initialize Auth0 if configuration is valid
const AppWithAuth = () => {
  if (!isAuth0Configured) {
    return <Auth0ConfigError />
  }

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      useRefreshTokens={auth0Config.useRefreshTokens}
      cacheLocation={auth0Config.cacheLocation}
    >
      <App />
    </Auth0Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  </StrictMode>,
)
