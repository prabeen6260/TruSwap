import { Link, useNavigate } from 'react-router-dom'
import { formatRelativeTime, isRecent } from '../utils/dateUtils.js'

function ListingCard({ listing }) {
  const navigate = useNavigate()
  // Handle datePosted - could be null for old listings
  const datePosted = listing.datePosted || null
  const relativeTime = datePosted ? formatRelativeTime(datePosted) : 'Recently posted'
  const recent = datePosted ? isRecent(datePosted) : false

  return (
    <Link to={`/listing/${listing.id}`} className={`card overflow-hidden group hover:shadow-lg transition-shadow ${listing.isSold ? 'opacity-75' : ''}`}>
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
        <img 
          src={listing.imageUrl} 
          alt={listing.title} 
          className={`w-full h-full object-cover transition-transform duration-300 ${listing.isSold ? '' : 'group-hover:scale-105'}`} 
        />
        {listing.isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="bg-red-600 text-white font-bold text-xl px-6 py-3 rounded-lg shadow-lg">
              SOLD
            </div>
          </div>
        )}
        {recent && !listing.isSold && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
            New
          </div>
        )}
        {!listing.isSold && (
          <div className={`absolute ${recent ? 'top-10' : 'top-2'} left-2 ${
            listing.listingType === 'rent' 
              ? 'bg-blue-500' 
              : 'bg-brand'
          } text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10`}>
            {listing.listingType === 'rent' ? 'RENT' : 'SELL'}
          </div>
        )}
        {!listing.isSold && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
            {relativeTime}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold line-clamp-1 text-gray-900 flex-1">{listing.title}</h3>
          {listing.groupId && (
            <span
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate(`/groups/${listing.groupId}`)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap cursor-pointer hover:underline"
              title="View group"
            >
              👥 Group
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{listing.description}</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-500">{relativeTime}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className={`text-lg font-bold ${listing.isSold ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              ${listing.price}
            </span>
            {listing.listingType === 'rent' && !listing.isSold && (
              <span className="text-xs text-gray-500 ml-1">/rental</span>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{listing.category}</span>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard


