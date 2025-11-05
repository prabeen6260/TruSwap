import { Link } from 'react-router-dom'

function PaymentCancelPage() {
  return (
    <div className="container-max py-12">
      <div className="max-w-md mx-auto card p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-4">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>
        <div className="space-y-3">
          <Link to="/listings" className="btn-primary w-full block">
            Continue Shopping
          </Link>
          <Link to="/" className="btn-outline w-full block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancelPage

