import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Transform backend data to frontend format
const transformListingFromBackend = (item) => {
  // Prefer explicit listing identifiers and keep seller IDs separate
  const listingId = item.id ?? item.listingId ?? item.itemId ?? item._id ?? item.usserId ?? null
  const sellerId = item.userId ?? null

  return {
    id: listingId != null ? listingId.toString() : null,
    title: item.itemName || item.title,
    description: item.description,
    category: item.category,
    price: item.price,
    condition: item.condition,
    imageUrl: item.imageUrl,
    name: item.name,
    email: item.email,
    userId: sellerId,
    groupId: item.groupId || null,
    listingType: item.listingType || 'sell',
    datePosted: item.datePosted,
    isSold: item.isSold || false,
  }
}

// Transform frontend data to backend format
const transformListingToBackend = (item) => {
  return {
    itemName: item.title,
    description: item.description,
    category: item.category,
    price: item.price,
    condition: item.condition,
    imageUrl: item.imageUrl,
    name: item.name,
    email: item.email,
    groupId: item.groupId || null,
    listingType: item.listingType || 'sell',
  }
}

// Helper to extract error message from axios error
const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    const message = data?.message || data?.error || data?.errorMessage || `Server error (${status})`
    return {
      message,
      status,
      details: data,
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Is the backend running?',
      status: null,
      details: null,
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      details: null,
    }
  }
}

// Fetch all listings
export const fetchListings = async () => {
  try {
    console.log('Fetching listings from:', `${API_BASE_URL}/listings`)
    const response = await api.get('/listings')
    console.log('Listings response:', response.data)
    const data = response.data
    // Handle both array and single object responses
    if (Array.isArray(data)) {
      return data.map(transformListingFromBackend)
    }
    return [transformListingFromBackend(data)]
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching listings:', {
      message: errorInfo.message,
      status: errorInfo.status,
      details: errorInfo.details,
      fullError: error,
    })
    // Create a new error with more details
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch a single listing by ID
export const fetchListingById = async (id) => {
  try {
    console.log('Fetching listing by ID:', id)
    const response = await api.get(`/listings/${id}`)
    return transformListingFromBackend(response.data)
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching listing:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Create a new listing (token is optional for now)
export const createListing = async (listingData, token = null) => {
  try {
    const backendData = transformListingToBackend(listingData)
    console.log('Creating listing:', backendData)
    
    // Build headers - include token if provided
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.post('/createListing', backendData, {
      headers,
    })
    return response.data
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error creating listing:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Create PayPal mock payment session
export const createPayPalPayment = async (listingId, price, itemName, token, email = '', name = '', userId = '') => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.post('/payments/create-payment', {
      listingId: listingId,
      price: price,
      itemName: itemName,
      buyerEmail: email, // Pass email from frontend
      buyerName: name,   // Pass name from frontend
      buyerUserId: userId, // Pass Auth0 user ID
      successUrl: `${window.location.origin}/paypal-checkout`,
      cancelUrl: `${window.location.origin}/payment-cancel`,
    }, { headers })
    return response.data
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error creating PayPal payment:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Execute PayPal payment (after user approves on PayPal)
export const executePayPalPayment = async (paymentId, payerId, listingId, userId = '') => {
  try {
    const response = await api.post('/payments/execute', {
      paymentId: paymentId,
      payerId: payerId,
      listingId: listingId,
      buyerUserId: userId, // Pass Auth0 user ID
    })
    return response.data
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error executing PayPal payment:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch orders for authenticated user
export const fetchOrders = async (token) => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.get('/orders', { headers })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching orders:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch user's own listings
export const fetchMyListings = async (token) => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.get('/my-listings', { headers })
    const data = response.data
    if (Array.isArray(data)) {
      return data.map(transformListingFromBackend)
    }
    return []
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching my listings:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch sold items (orders where user is seller)
export const fetchSoldItems = async (token) => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.get('/orders/sold', { headers })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching sold items:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch all groups
export const fetchGroups = async () => {
  try {
    const response = await api.get('/groups')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching groups:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch a single group by ID
export const fetchGroupById = async (id) => {
  try {
    const response = await api.get(`/groups/${id}`)
    return response.data
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching group:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Fetch user's groups
export const fetchMyGroups = async (token) => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.get('/groups/my-groups', { headers })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error fetching my groups:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

// Create a new group
export const createGroup = async (groupData, token) => {
  try {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    const response = await api.post('/groups', groupData, { headers })
    return response.data
  } catch (error) {
    const errorInfo = getErrorMessage(error)
    console.error('Error creating group:', errorInfo)
    const enhancedError = new Error(errorInfo.message)
    enhancedError.status = errorInfo.status
    enhancedError.details = errorInfo.details
    throw enhancedError
  }
}

export default api
