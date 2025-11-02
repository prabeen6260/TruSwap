import { useParams, Link } from 'react-router-dom'
import { sampleListings } from '../data/sampleListings.js'

function ListingDetailPage() {
  const { id } = useParams()
  const listing = sampleListings.find((l) => l.id === id)

  if (!listing) {
    return (
      <div className="container-max py-12">
        <div className="card p-8 text-center">
          Listing not found. <Link to="/listings" className="text-brand underline">Browse listings</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-max py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-[420px] object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="text-gray-600 mt-1">{listing.category} • {listing.condition}</div>

          <div className="mt-4 text-3xl font-bold">${listing.price}</div>

          <div className="mt-6 card p-4">
            <div className="font-semibold">Seller</div>
            <div className="text-sm text-gray-700">{listing.seller.name}</div>
            <div className="text-sm text-gray-500">{listing.seller.campusEmail}</div>
            <button className="btn-primary mt-3 w-full">Contact seller</button>
            <button className="btn-outline mt-2 w-full">Add to watchlist</button>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-semibold mb-3">Safety Tips</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Meet in public, well-lit campus locations.</li>
          <li>Verify Truman email before exchanging items.</li>
          <li>Inspect items before paying. Use secure payment methods.</li>
        </ul>
      </div>
    </div>
  )
}

export default ListingDetailPage


