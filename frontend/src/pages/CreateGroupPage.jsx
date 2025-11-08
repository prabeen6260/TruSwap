import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { createGroup } from '../services/api.js'

function CreateGroupPage() {
  const navigate = useNavigate()
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [form, setForm] = useState({
    name: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setError('Please log in to create a group.')
      return
    }

    if (!form.name.trim()) {
      setError('Group name is required.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://api.truSwap.com',
        }
      })

      await createGroup(form, token)
      
      alert('Group created successfully!')
      navigate('/groups')
    } catch (err) {
      console.error('Error creating group:', err)
      setError('Failed to create group. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Please log in to create a group</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create a new group.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
        
        <form onSubmit={onSubmit} className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name *</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., Computer Science Club"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Describe what this group is about..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroupPage

