import { Link, useNavigate } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import { sampleListings, categories } from '../data/sampleListings.js'
import { useState } from 'react'

function HomePage() {
  const navigate = useNavigate()
  const [homeQuery, setHomeQuery] = useState('')

  const featured = sampleListings.slice(0, 4)

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
            <form onSubmit={submitSearch} className="mt-6 flex">
              <input
                value={homeQuery}
                onChange={(e) => setHomeQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full rounded-l-lg border-0 px-4 py-3 text-gray-900"
              />
              <button className="btn-outline bg-white rounded-l-none rounded-r-lg">Search</button>
            </form>
            <div className="mt-4 text-sm">
              Trending: <button className="underline" onClick={() => navigate('/listings?q=calculator')}>calculator</button>,{' '}
              <button className="underline" onClick={() => navigate('/listings?q=fridge')}>mini fridge</button>,{' '}
              <button className="underline" onClick={() => navigate('/listings?q=macbook')}>macbook</button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/15 rounded-2xl p-6 ring-1 ring-white/20 backdrop-blur">
              <div className="grid grid-cols-2 gap-4">
                {featured.map((l) => (
                  <div key={l.id} className="bg-white rounded-xl overflow-hidden">
                    <img src={l.imageUrl} alt={l.title} className="h-32 w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{l.title}</div>
                      <div className="text-xs text-gray-600">${l.price} • {l.category}</div>
                    </div>
                  </div>
                ))}
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
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage


