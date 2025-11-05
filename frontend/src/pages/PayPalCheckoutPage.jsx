import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { executePayPalPayment } from '../services/api.js'

function PayPalCheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth0()
  const paymentId = searchParams.get('paymentId')
  const payerId = searchParams.get('PayerID')
  const listingId = searchParams.get('listingId')
  const buyerUserId = searchParams.get('buyerUserId')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [hasExecuted, setHasExecuted] = useState(false)

  useEffect(() => {
    // If we have paymentId and payerId, execute the payment automatically
    // Only execute once - check if already executed
    if (paymentId && payerId && !hasExecuted && !isProcessing) {
      handleExecutePayment()
    }
  }, [paymentId, payerId])

  const handleExecutePayment = async () => {
    if (!paymentId || !payerId || isProcessing || hasExecuted) return
    
    setIsProcessing(true)
    setError(null)
    setHasExecuted(true) // Prevent duplicate execution
    
    try {
      // Use buyerUserId from URL, or fallback to user?.sub if available
      const userId = buyerUserId || user?.sub || ''
      console.log('Executing PayPal payment:', { paymentId, payerId, listingId, userId, buyerUserId })
      const response = await executePayPalPayment(paymentId, payerId, listingId || '', userId)
      
      if (response.status === 'success') {
        console.log('Payment executed successfully')
        // Set flag to refresh listings
        sessionStorage.setItem('fromPayment', 'true')
        navigate('/payment-success?payment_id=' + paymentId)
      } else {
        throw new Error(response.message || 'Payment failed')
      }
    } catch (err) {
      console.error('Error executing payment:', err)
      // Check if it's a "payment already done" error - that's okay
      if (err.message && err.message.includes('PAYMENT_ALREADY_DONE')) {
        // Payment was already executed, just redirect to success
        sessionStorage.setItem('fromPayment', 'true')
        navigate('/payment-success?payment_id=' + paymentId)
      } else {
        setError(err.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        setHasExecuted(false) // Allow retry on real errors
      }
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.351 1.05 3.3.485 4.71-.488 1.247-1.086 1.985-1.86 2.52 1.84.535 3.16 1.866 3.16 3.983 0 2.415-2.002 4.21-4.93 4.21h-3.93a.641.641 0 0 0-.633.74l1.107 7.17c.092.558.54.94 1.064.94zm-3.16-11.315h4.494c2.21 0 3.84-.557 4.578-1.59.733-1.03.653-2.187.434-2.93-.28-.953-1.02-1.412-2.01-1.412H6.814l-2.898 5.932zm5.8 7.265H6.814l1.106-7.17h4.494c2.21 0 3.84-.557 4.578-1.59.733-1.03.653-2.187.434-2.93-.28-.953-1.02-1.412-2.01-1.412h-3.93l-1.632 5.932z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Redirecting to PayPal...</h1>
          <p className="text-gray-600">You will be redirected back after payment approval.</p>
        </div>
      </div>
    </div>
  )
}

export default PayPalCheckoutPage
