import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { fetchOrders } from '../services/api.js'
import { formatDate, formatDateTime } from '../utils/dateUtils.js'

function OrderHistoryPage() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const token = await getAccessTokenSilently()
        const data = await fetchOrders(token)
        setOrders(data || [])
      } catch (err) {
        console.error('Failed to load orders:', err)
        setError('Failed to load orders. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, getAccessTokenSilently])

  if (!isAuthenticated) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Please log in to view your orders</h2>
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
          <p className="mt-4 text-gray-600">Loading orders...</p>
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

  return (
    <div className="container-max py-8">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

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
                        {order.status.toUpperCase()}
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
  )
}

export default OrderHistoryPage

