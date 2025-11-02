import { useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard.jsx'
import { sampleListings, categories } from '../data/sampleListings.js'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function ListingsPage() {
  const query = useQuery()
  const q = query.get('q')?.toLowerCase() || ''
  const cat = query.get('category') || 'All'
  const [sort, setSort] = useState('relevance')

  const filtered = useMemo(() => {
    let items = [...sampleListings]
    if (q) {
      items = items.filter((i) =>
        [i.title, i.description, i.category].some((s) => s.toLowerCase().includes(q))
      )
    }
    if (cat !== 'All') {
      items = items.filter((i) => i.category === cat)
    }
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') items.sort((a, b) => b.price - a.price)
    return items
  }, [q, cat, sort])

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
            <div className="text-sm text-gray-600">{filtered.length} items</div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {filtered.length === 0 ? (
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


