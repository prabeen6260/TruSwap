import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchGroupById, fetchListings } from '../services/api.js'
import { formatDateTime } from '../utils/dateUtils.js'
import ListingCard from '../components/ListingCard.jsx'

function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth0()
  const [group, setGroup] = useState(null)
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const [groupData, listingsData] = await Promise.all([
          fetchGroupById(id).catch(() => null),
          fetchListings().catch(() => [])
        ])

        if (!groupData) {
          setError('Group not found')
          return
        }

        setGroup(groupData)
        
        // Filter listings that belong to this group
        const groupListings = listingsData.filter(listing => listing.groupId === id)
        setListings(groupListings)
      } catch (err) {
        console.error('Failed to load group:', err)
        setError('Failed to load group. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Group not found.'}</p>
          <Link to="/groups" className="text-brand underline">Back to Groups</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-8">
      {/* Group Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 mb-4">{group.description}</p>
            )}
            <div className="text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Created by:</span>
                <span>{group.creatorName || group.creatorEmail || 'Unknown'}</span>
              </div>
              {group.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Created:</span>
                  <span>{formatDateTime(group.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <Link
              to={`/sell?groupId=${id}`}
              className="btn-primary"
            >
              Sell Item in Group
            </Link>
          )}
        </div>
      </div>

      {/* Listings in Group */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Items in this Group ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">No items yet</h3>
            <p className="text-gray-600 mb-6">Be the first to list an item in this group!</p>
            {isAuthenticated && (
              <Link
                to={`/sell?groupId=${id}`}
                className="btn-primary"
              >
                List an Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupDetailPage

