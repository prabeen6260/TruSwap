import { Link, useNavigate } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import { categories } from '../data/sampleListings.js'
import { useState, useEffect } from 'react'
import { fetchListings } from '../services/api.js'

function HomePage() {
  const navigate = useNavigate()
  const [homeQuery, setHomeQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadListings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchListings()
        setListings(data || [])
      } catch (err) {
        console.error('Failed to load listings:', err)
        const errorMessage = err.message || 'Failed to load listings. Please try again later.'
        setError(`${errorMessage}${err.status ? ` (Status: ${err.status})` : ''}`)
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }
    loadListings()
  }, [])

  const featured = listings.slice(0, 4)

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(`/listings?q=${encodeURIComponent(homeQuery)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-max py-16 lg:py-20 grid lg:grid-cols-2 items-center gap-8">
          <div>
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
              Buy and sell with verified Truman State students
            </h1>
            <p className="mt-4 text-white/90 text-lg">
              Textbooks, electronics, dorm essentials, and more. Safe and local to campus.
            </p>
            <form onSubmit={submitSearch} className="mt-6 flex gap-2">
              <input
                value={homeQuery}
                onChange={(e) => setHomeQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full rounded-r-lg rounded-l-lg border-0 px-4 py-3 text-gray-900"
              />
              <button className="btn-outline bg-white rounded-l-none rounded-r-lg">Search</button>
            </form>
          </div>
          <div className="hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"></div>
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=600&fit=crop&q=80"
                alt="Campus marketplace"
                className="w-full h-full object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="text-2xl font-bold mb-2">Join the Community</div>
                <div className="text-sm text-white/90">Find great deals from fellow students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-max py-10">
        <h2 className="text-xl font-semibold mb-4">Shop by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link key={c} to={`/listings?category=${encodeURIComponent(c)}`} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="font-semibold">{c}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-max py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured listings</h2>
          <Link to="/listings" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-600">Loading listings...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">No listings available yet</div>
        )}
      </section>
    </div>
  )
}

export default HomePage


