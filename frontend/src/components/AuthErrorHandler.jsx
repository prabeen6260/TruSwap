import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function AuthErrorHandler({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Don't do anything if we're already on the auth-error page
    if (location.pathname === '/auth-error') {
      return
    }

    // Check if there's an Auth0 error in the URL
    const params = new URLSearchParams(location.search)
    const error = params.get('error')
    
    // Only redirect if there's an error and we're not already on the error page
    if (error) {
      // Redirect to the error page, preserving query parameters
      navigate(`/auth-error${location.search}`, { replace: true })
    }
  }, [location.pathname, location.search, navigate])

  return children
}

export default AuthErrorHandler

