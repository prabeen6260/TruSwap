import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchGroups, fetchMyGroups } from '../services/api.js'
import { formatDateTime } from '../utils/dateUtils.js'

function GroupsPage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [allGroups, setAllGroups] = useState([])
  const [myGroups, setMyGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const loadGroups = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load all groups (public)
        const groupsData = await fetchGroups().catch(() => [])
        setAllGroups(groupsData || [])
        
        // Load user's groups if authenticated
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: {
                audience: 'https://api.truSwap.com',
              }
            })
            const myGroupsData = await fetchMyGroups(token).catch(() => [])
            setMyGroups(myGroupsData || [])
          } catch (err) {
            console.error('Could not load my groups:', err)
            // Continue without my groups
          }
        }
      } catch (err) {
        console.error('Failed to load groups:', err)
        setError('Failed to load groups. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadGroups()
  }, [isAuthenticated, getAccessTokenSilently])

  if (isLoading) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
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

  const displayGroups = activeTab === 'my' ? myGroups : allGroups

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        {isAuthenticated && (
          <Link to="/groups/create" className="btn-primary">
            Create New Group
          </Link>
        )}
      </div>

      {/* Tabs */}
      {isAuthenticated && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All Groups ({allGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'my'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Groups ({myGroups.length})
            </button>
          </nav>
        </div>
      )}

      {/* Groups List */}
      {displayGroups.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">
            {activeTab === 'my' ? 'You haven\'t created any groups yet' : 'No groups found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {activeTab === 'my' 
              ? 'Create a group to start selling items together!'
              : 'Be the first to create a group!'}
          </p>
          {isAuthenticated && (
            <Link to="/groups/create" className="btn-primary">
              Create Your First Group
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGroups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{group.description || 'No description'}</p>
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
              <div className="mt-4">
                <span className="btn-outline text-sm w-full block text-center">
                  View Group →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupsPage

