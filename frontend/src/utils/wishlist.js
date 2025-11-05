// Wishlist utility functions using localStorage

import { dispatchWishlistUpdate } from './wishlistEvents.js'

const WISHLIST_KEY = 'truSwap_wishlist'

export const getWishlist = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading wishlist:', error)
    return []
  }
}

export const addToWishlist = (listingId) => {
  try {
    const wishlist = getWishlist()
    if (!wishlist.includes(listingId)) {
      wishlist.push(listingId)
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
      dispatchWishlistUpdate()
      return true
    }
    return false
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return false
  }
}

export const removeFromWishlist = (listingId) => {
  try {
    const wishlist = getWishlist()
    const updated = wishlist.filter(id => id !== listingId)
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
    dispatchWishlistUpdate()
    return true
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return false
  }
}

export const isInWishlist = (listingId) => {
  const wishlist = getWishlist()
  return wishlist.includes(listingId)
}

export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_KEY)
    dispatchWishlistUpdate()
    return true
  } catch (error) {
    console.error('Error clearing wishlist:', error)
    return false
  }
}

export const getWishlistCount = () => {
  return getWishlist().length
}

