import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AuthError from './components/AuthError.jsx'
import AuthErrorHandler from './components/AuthErrorHandler.jsx'
import HomePage from './pages/HomePage.jsx'
import ListingsPage from './pages/ListingsPage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import CreateListingPage from './pages/CreateListingPage.jsx'
import WishlistPage from './pages/WishlistPage.jsx'
import OrderHistoryPage from './pages/OrderHistoryPage.jsx'
import PayPalCheckoutPage from './pages/PayPalCheckoutPage.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import PaymentCancelPage from './pages/PaymentCancelPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <AuthErrorHandler>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/paypal-checkout" element={<PayPalCheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancel" element={<PaymentCancelPage />} />
            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            <Route path="/auth-error" element={<AuthError />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthErrorHandler>
  )
}

export default App
