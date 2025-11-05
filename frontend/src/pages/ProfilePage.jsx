import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { fetchOrders, fetchMyListings, fetchListings } from '../services/api.js'
import { formatDateTime } from '../utils/dateUtils.js'
import { getWishlist, removeFromWishlist } from '../utils/wishlist.js'
import ListingCard from '../components/ListingCard.jsx'

function ProfilePage() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
  const [activeTab, setActiveTab] = useState('wishlist')
  const [orders, setOrders] = useState([])
  const [myListings, setMyListings] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://api.truSwap.com',
          }
        })

        // Load all data in parallel
        const [ordersData, listingsData, allListingsData] = await Promise.all([
          fetchOrders(token).catch(() => []),
          fetchMyListings(token).catch(() => []),
          fetchListings().catch(() => [])
        ])

        setOrders(ordersData || [])
        setMyListings(listingsData || [])
        
        // Load wishlist items
        const wishlistIds = getWishlist()
        const wishlistData = allListingsData.filter(listing => wishlistIds.includes(listing.id))
        setWishlistItems(wishlistData || [])
      } catch (err) {
        console.error('Failed to load profile data:', err)
        setError('Failed to load profile data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, getAccessTokenSilently])

  if (!isAuthenticated) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Please log in to view your profile</h2>
          <Link to="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center text-red-600">
          {error}
        </div>
      </div>
    )
  }

  const handleRemoveFromWishlist = (listingId) => {
    removeFromWishlist(listingId)
    setWishlistItems(items => items.filter(item => item.id !== listingId))
  }

  return (
    <div className="container-max py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user?.name || user?.email}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'wishlist'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Wishlist ({wishlistItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Listings ({myListings.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Wishlist</h2>
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
            {wishlistItems.length === 0 ? (
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
                        onClick={() => handleRemoveFromWishlist(listing.id)}
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
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Orders You've Made</h2>
            {orders.length === 0 ? (
              <div className="card p-8 text-center text-gray-600">
                <p className="mb-4">You haven't made any purchases yet.</p>
                <Link to="/listings" className="btn-primary">Browse Listings</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="card p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <img
                          src={order.itemImageUrl}
                          alt={order.itemName}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold mb-2">{order.itemName}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Price:</span>
                            <span className="text-lg font-bold text-gray-900">${order.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Seller:</span>
                            <span>{order.sellerName} ({order.sellerEmail})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Purchase Date:</span>
                            <span>{order.purchaseDate ? formatDateTime(order.purchaseDate) : 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {order.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                        </div>
                        {order.sellerEmail && (
                          <a
                            href={`mailto:${order.sellerEmail}?subject=Regarding order for ${encodeURIComponent(order.itemName)}`}
                            className="btn-outline mt-4 inline-block"
                          >
                            Contact Seller
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Items You've Listed</h2>
              <Link to="/sell" className="btn-primary">Create New Listing</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="card p-8 text-center text-gray-600">
                <p className="mb-4">You haven't listed any items yet.</p>
                <Link to="/sell" className="btn-primary">Create Your First Listing</Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${listing.price}</span>
                        {listing.isSold ? (
                          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                            SOLD
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage

