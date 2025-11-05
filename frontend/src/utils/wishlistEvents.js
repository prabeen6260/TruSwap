// Custom event system for wishlist updates
// This allows components to listen for wishlist changes

export const WISHLIST_UPDATED_EVENT = 'wishlistUpdated'

export const dispatchWishlistUpdate = () => {
  window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT))
}

