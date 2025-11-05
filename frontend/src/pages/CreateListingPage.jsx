import { useState } from 'react'
import { categories } from '../data/sampleListings.js'
// --- New Imports ---
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react' // To get the token for your backend
import { storage } from '../data/firebase' // Import your initialized Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid' // For creating unique image filenames
import { createListing } from '../services/api.js'

function CreateListingPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    price: '',
    condition: 'Good',
    name: '',
    email: '',
    // We remove imageUrl from here, as it will be generated on submit
  })
  
  // --- New State Variables ---
  // Stores the actual file object (e.g., "my-photo.jpg")
  const [imageFile, setImageFile] = useState(null) 
  // Stores a temporary local URL for the preview (e.g., "blob:http://...")
  const [imagePreviewUrl, setImagePreviewUrl] = useState('') 
  // Stores the uploading status for the button
  const [isUploading, setIsUploading] = useState(false)
  // Stores any error messages
  const [error, setError] = useState(null)

  // --- Hooks for API calls and navigation ---
  const { getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()

  // This function remains the same for text inputs
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // --- New Handler: For the file input ---
  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      // Create a local URL for the file to show a preview
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  // --- Updated Submit Function ---
  const onSubmit = async (e) => {
    e.preventDefault()

    // 1. Validation: Check if a file was selected
    if (!imageFile) {
      setError('Please select an image for your listing.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // 2. Create a unique file path in Firebase Storage
      // e.g., "images/a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8_my-lamp.jpg"
      const imageRef = ref(storage, `images/${uuidv4()}_${imageFile.name}`)

      // 3. Upload the file to Firebase
      const snapshot = await uploadBytes(imageRef, imageFile)

      // 4. Get the public download URL from Firebase
      const downloadURL = await getDownloadURL(snapshot.ref)

      // 5. Prepare the final listing data for your Spring Boot backend
      const listingData = {
        ...form,
        price: parseFloat(form.price), // Ensure price is a number
        imageUrl: downloadURL, // Add the new URL from Firebase
      }

      // 6. Get the Auth0 token (required for authentication)
      let token = null
      try {
        token = await getAccessTokenSilently()
      } catch (err) {
        console.error('Could not get Auth0 token:', err)
        setError('Authentication required. Please log in and try again.')
        setIsUploading(false)
        return
      }

      // 7. Send the complete data to your Spring Boot/MongoDB backend
      await createListing(listingData, token)

      // 8. Success!
      setIsUploading(false)
      alert('Listing created successfully!')
      // Redirect to the homepage or the new listing's page
      navigate('/') 
    
    } catch (err) {
      console.error('Error creating listing:', err)
      setError('Failed to create listing. Please try again.')
      setIsUploading(false)
    }
  }

  return (
    <div className="container-max py-8">
      <h1 className="text-2xl font-bold mb-6">Sell an item</h1>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          {/* ... (Title, Description, Category, Condition, Price inputs) ... */}
          {/* All your other fields remain the same */}
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input name="title" value={form.title} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Your Name</label>
              <input name="name" type="text" value={form.name} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" value={form.category} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select name="condition" value={form.condition} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {['New', 'Like New', 'Very Good', 'Good', 'Fair'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (USD)</label>
              <input name="price" type="number" min="0" step="1" value={form.price} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
            </div>

            {/* --- REPLACED IMAGE URL INPUT --- */}
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                name="image"
                onChange={onFileChange}
                accept="image/png, image/jpeg, image/webp" // Only allow images
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          </div>
          
          {/* Show an error message if one exists */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* --- UPDATED BUTTON --- */}
          <button 
            type="submit" 
            className="btn-primary disabled:opacity-50" 
            disabled={isUploading}
          >
            {isUploading ? 'Creating listing...' : 'Create listing'}
          </button>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Preview</h2>
          
          {/* --- UPDATED PREVIEW --- */}
          {/* It now uses the local imagePreviewUrl */}
          {!imagePreviewUrl ? (
            <div className="aspect-[4/3] bg-gray-100 rounded-lg grid place-items-center text-gray-500">Image preview</div>
          ) : (
            <img src={imagePreviewUrl} alt="Preview" className="rounded-lg aspect-[4/3] object-cover w-full" />
          )}

          {/* This part remains the same */}
          <div className="mt-4">
            <div className="text-lg font-semibold">{form.title || 'Item title'}</div>
            <div className="text-sm text-gray-600">{form.category} • {form.condition}</div>
            <div className="text-2xl font-bold mt-2">{form.price ? `$${form.price}` : '$0'}</div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateListingPage