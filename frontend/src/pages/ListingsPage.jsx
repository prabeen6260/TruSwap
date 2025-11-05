import { useMemo, useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import { categories } from '../data/sampleListings.js'
import { fetchListings } from '../services/api.js'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function ListingsPage() {
  const query = useQuery()
  const q = query.get('q')?.toLowerCase() || ''
  const cat = query.get('category') || 'All'
  const [sort, setSort] = useState('relevance')
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
    
    // Refresh once if coming from payment success
    const fromPayment = sessionStorage.getItem('fromPayment') === 'true'
    if (fromPayment) {
      sessionStorage.removeItem('fromPayment')
      // Refresh once after a short delay to get updated listings (sold items removed)
      setTimeout(() => {
        fetchListings()
          .then(data => {
            if (data) {
              setListings(data || [])
            }
          })
          .catch(err => console.error('Error refreshing listings:', err))
      }, 2000)
    }
  }, [])

  const filtered = useMemo(() => {
    let items = [...listings]
    if (q) {
      items = items.filter((i) =>
        [i.title, i.description, i.category].some((s) => s?.toLowerCase().includes(q))
      )
    }
    if (cat !== 'All') {
      items = items.filter((i) => i.category === cat)
    }
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') items.sort((a, b) => b.price - a.price)
    if (sort === 'newest') items.sort((a, b) => {
      const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0
      const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0
      return dateB - dateA
    })
    if (sort === 'oldest') items.sort((a, b) => {
      const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0
      const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0
      return dateA - dateB
    })
    // Sort: show available items first, then sold items
    items.sort((a, b) => {
      if (a.isSold === b.isSold) return 0
      return a.isSold ? 1 : -1
    })
    return items
  }, [listings, q, cat, sort])

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          {(q || cat !== 'All') && (
            <div className="text-sm text-gray-600 mt-1">Results for {q ? `"${q}"` : ''} {cat !== 'All' ? `in ${cat}` : ''}</div>
          )}
        </div>
        <Link to="/sell" className="btn-primary">Sell an item</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="card p-4">
            <div className="font-semibold mb-2">Category</div>
            <div className="space-y-2 text-sm">
              <Link to={`/listings`} className={`block ${cat==='All'?'text-brand font-semibold':''}`}>All</Link>
              {categories.map((c) => (
                <Link key={c} to={`/listings?category=${encodeURIComponent(c)}`} className={`block ${cat===c?'text-brand font-semibold':''}`}>{c}</Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${filtered.length} items`}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {isLoading ? (
            <div className="card p-8 text-center text-gray-600">Loading listings...</div>
          ) : error ? (
            <div className="card p-8 text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="card p-8 text-center text-gray-600">No results. Try another search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ListingsPage


