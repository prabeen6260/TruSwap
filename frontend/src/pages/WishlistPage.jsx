import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import { getWishlist, removeFromWishlist } from '../utils/wishlist.js'
import { fetchListings, fetchListingById } from '../services/api.js'

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadWishlistItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const wishlistIds = getWishlist()
      
      if (wishlistIds.length === 0) {
        setWishlistItems([])
        setIsLoading(false)
        return
      }

      // Fetch all listings and filter by wishlist IDs
      const allListings = await fetchListings()
      const items = allListings.filter(listing => wishlistIds.includes(listing.id))
      setWishlistItems(items)
    } catch (err) {
      console.error('Failed to load wishlist:', err)
      setError('Failed to load wishlist. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWishlistItems()
  }, [])

  const handleRemove = (listingId) => {
    removeFromWishlist(listingId)
    setWishlistItems(items => items.filter(item => item.id !== listingId))
  }

  if (isLoading) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all items from wishlist?')) {
                wishlistItems.forEach(item => removeFromWishlist(item.id))
                setWishlistItems([])
              }
            }}
            className="btn-outline text-sm"
          >
            Clear all
          </button>
        )}
      </div>

      {error ? (
        <div className="card p-8 text-center text-red-600">{error}</div>
      ) : wishlistItems.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding items you're interested in!</p>
          <Link to="/listings" className="btn-primary">Browse listings</Link>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((listing) => (
              <div key={listing.id} className="relative">
                <ListingCard listing={listing} />
                <button
                  onClick={() => handleRemove(listing.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default WishlistPage

