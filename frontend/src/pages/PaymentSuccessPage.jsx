import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { executePayPalPayment } from '../services/api.js'

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth0()
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id')
  const payerId = searchParams.get('PayerID')
  const listingId = searchParams.get('listingId')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    // If we have all required parameters, execute the payment
    if (paymentId && payerId && listingId && !isProcessing) {
      handleExecutePayment()
    } else if (paymentId && !payerId) {
      // Payment already executed, just show success
      sessionStorage.setItem('fromPayment', 'true')
      setTimeout(() => {
        navigate('/orders')
      }, 3000)
    }
  }, [paymentId, payerId, listingId])
  
  const handleExecutePayment = async () => {
    if (!paymentId || !payerId || !listingId || isProcessing) return
    
    setIsProcessing(true)
    setError(null)
    
    try {
      console.log('Executing PayPal payment:', { paymentId, payerId, listingId, userId: user?.sub })
      const response = await executePayPalPayment(paymentId, payerId, listingId, user?.sub || '')
      
      if (response.status === 'success') {
        console.log('Payment executed successfully')
        // Set flag to refresh listings
        sessionStorage.setItem('fromPayment', 'true')
        // Redirect to order history
        setTimeout(() => {
          navigate('/orders')
        }, 2000)
      } else {
        throw new Error(response.message || 'Payment execution failed')
      }
    } catch (err) {
      console.error('Error executing payment:', err)
      setError(err.message || 'Payment failed. Please contact support.')
      setIsProcessing(false)
    }
  }

  if (error) {
    return (
      <div className="container-max py-12">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4 text-red-600">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/listings')} className="btn-primary">
            Back to Listings
          </button>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="container-max py-12">
        <div className="max-w-md mx-auto card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we complete your payment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-12">
      <div className="max-w-md mx-auto card p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            The seller will be notified and you can contact them to arrange pickup.
          </p>
          <p className="text-sm text-blue-600 mb-4">
            Redirecting to your order history...
          </p>
        </div>
        <div className="space-y-3">
          <Link to="/orders" className="btn-primary w-full block">
            View Order History
          </Link>
          <Link to="/listings" className="btn-outline w-full block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage

