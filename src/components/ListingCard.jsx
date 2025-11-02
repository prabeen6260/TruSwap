import { Link } from 'react-router-dom'

function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="card overflow-hidden group">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{listing.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold">${listing.price}</span>
          <span className="text-xs text-gray-500">{listing.category}</span>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard


