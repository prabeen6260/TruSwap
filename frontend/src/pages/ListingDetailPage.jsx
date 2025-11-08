import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchListingById, createPayPalPayment, fetchGroupById } from '../services/api.js'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/wishlist.js'
import { formatRelativeTime, formatDateTime, isRecent } from '../utils/dateUtils.js'

function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0()
  const [listing, setListing] = useState(null)
  const [group, setGroup] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inWishlist, setInWishlist] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadListing = async () => {
      try {
        setIsLoading(true)
        const data = await fetchListingById(id)
        setListing(data)
        // Check if item is in wishlist
        if (data?.id) {
          setInWishlist(isInWishlist(data.id))
        }
        
        // Load group information if listing belongs to a group
        if (data?.groupId) {
          try {
            const groupData = await fetchGroupById(data.groupId)
            setGroup(groupData)
          } catch (err) {
            console.error('Could not load group:', err)
            // Continue without group info
          }
        }
      } catch (err) {
        console.error('Failed to load listing:', err)
        setError('Failed to load listing. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) {
      loadListing()
    }
  }, [id])

  const handleWishlistToggle = () => {
    if (!listing?.id) return
    
    if (inWishlist) {
      removeFromWishlist(listing.id)
      setInWishlist(false)
    } else {
      addToWishlist(listing.id)
      setInWishlist(true)
    }
  }

  const handleBuyNow = async () => {
    if (!listing?.id || isProcessing) return
    
    if (!isAuthenticated) {
      alert(`Please log in to ${listing.listingType === 'rent' ? 'rent' : 'purchase'} items.`)
      return
    }
    
    // Check if item is already sold/rented
    if (listing.isSold) {
      alert(`This item has already been ${listing.listingType === 'rent' ? 'rented' : 'sold'}.`)
      return
    }
    
    setIsProcessing(true)
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://api.truSwap.com',
        }
      })
      console.log('Got token, creating payment...')
      console.log('User:', user)
      console.log('Listing ID:', listing.id, 'Type:', typeof listing.id)
      
      // Validate listing ID
      if (!listing.id || listing.id === '0' || listing.id === 0) {
        throw new Error('Invalid listing ID. Please refresh the page and try again.')
      }
      
      const response = await createPayPalPayment(
        listing.id,
        listing.price,
        listing.title,
        token,
        user?.email || '',
        user?.name || '',
        user?.sub || '' // Pass Auth0 user ID
      )
      
      // Redirect to PayPal approval page
      if (response.approvalUrl) {
        window.location.href = response.approvalUrl
      } else {
        throw new Error('No approval URL received')
      }
    } catch (err) {
      console.error('Error creating PayPal payment:', err)
      alert('Failed to start payment. Please try again.')
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Listing not found.'}</p>
          <Link to="/listings" className="text-brand underline">Browse listings</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-[420px] object-cover" />
        </div>
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                {listing.listingType === 'rent' && !listing.isSold && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                    RENT
                  </span>
                )}
                {listing.listingType === 'sell' && !listing.isSold && (
                  <span className="bg-brand/10 text-brand text-xs font-semibold px-2 py-1 rounded-full">
                    SELL
                  </span>
                )}
              </div>
              <div className="text-gray-600 mt-1">{listing.category} • {listing.condition}</div>
            </div>
            {isRecent(listing.datePosted) && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                New
              </span>
            )}
          </div>

          {listing.datePosted && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Posted {formatRelativeTime(listing.datePosted)}</span>
              <span className="text-gray-300">•</span>
              <span title={formatDateTime(listing.datePosted)}>{formatDateTime(listing.datePosted)}</span>
            </div>
          )}
          
          {group && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900">Part of Group</div>
                  <Link 
                    to={`/groups/${group.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {group.name} →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <span className="text-3xl font-bold">${listing.price}</span>
            {listing.listingType === 'rent' && !listing.isSold && (
              <span className="text-lg text-gray-600 ml-2">/rental</span>
            )}
          </div>

          {listing.isSold && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold text-center">
                This item has been {listing.listingType === 'rent' ? 'rented' : 'sold'}
              </p>
            </div>
          )}

          <div className="mt-6 card p-4">
            {!listing.isSold && (
              <button
                onClick={handleBuyNow}
                disabled={isProcessing}
                className="btn-primary w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing 
                  ? 'Processing...' 
                  : listing.listingType === 'rent' 
                    ? 'Rent Now' 
                    : 'Buy Now'}
              </button>
            )}
            <div className="font-semibold">Seller</div>
            <div className="text-sm text-gray-700">{listing.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{listing.email || 'N/A'}</div>
            {listing.email && (
              <a
                href={`mailto:${listing.email}?subject=Inquiry about ${encodeURIComponent(listing.title)}`}
                className="btn-outline mt-3 w-full text-center block"
              >
                Contact seller
              </a>
            )}
            <button
              onClick={handleWishlistToggle}
              className={`mt-2 w-full ${inWishlist ? 'btn-primary' : 'btn-outline'}`}
            >
              {inWishlist ? '✓ In wishlist' : 'Add to wishlist'}
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-semibold mb-3">Safety Tips</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Meet in public, well-lit campus locations.</li>
          <li>Verify Truman email before exchanging items.</li>
          <li>Inspect items before paying. Use secure payment methods.</li>
        </ul>
      </div>
    </div>
  )
}

export default ListingDetailPage


