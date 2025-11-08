import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getWishlistCount } from '../utils/wishlist.js'
import { WISHLIST_UPDATED_EVENT } from '../utils/wishlistEvents.js'

function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [wishlistCount, setWishlistCount] = useState(0)
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0()

  useEffect(() => {
    // Update wishlist count
    const updateCount = () => setWishlistCount(getWishlistCount())
    updateCount()
    
    // Listen for wishlist updates (custom event)
    const handleUpdate = () => updateCount()
    window.addEventListener(WISHLIST_UPDATED_EVENT, handleUpdate)
    // Also listen for storage changes (when wishlist is updated in another tab)
    window.addEventListener('storage', updateCount)
    
    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleUpdate)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    navigate(`/listings?q=${encodeURIComponent(query)}`)
  }

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        prompt: 'select_account', // Force account selection screen
      },
      appState: {
        returnTo: window.location.pathname,
      },
    })
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container-max py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand text-white grid place-items-center font-bold">TS</div>
          <span className="text-xl font-bold tracking-tight">TruSwap</span>
        </Link>

        <form onSubmit={onSubmit} className="flex-1 hidden md:flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, devices, appliances..."
            className="w-full rounded-l-lg rounded-r-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button type="submit" className="btn-primary rounded-l-none rounded-r-lg">Search</button>
        </form>

        <nav className="ml-auto flex items-center gap-3">
          <NavLink to="/listings" className="btn-outline">Browse</NavLink>
          <NavLink to="/groups" className="btn-outline">Groups</NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" className="btn-outline relative">
              Profile
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <NavLink to="/sell" className="btn-primary">Sell an item</NavLink>
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2">
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <div className="hidden md:block text-sm">
                    <div className="font-medium text-gray-900">{user?.name || user?.email}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            !isLoading && (
              <button
                onClick={handleLogin}
                className="btn-primary"
              >
                Login
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar


