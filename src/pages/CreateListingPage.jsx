import { useState } from 'react'
import { categories } from '../data/sampleListings.js'

function CreateListingPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0],
    price: '',
    condition: 'Good',
    imageUrl: '',
  })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = (e) => {
    e.preventDefault()
    alert('For now, this is a demo. Backend integration pending.')
  }

  return (
    <div className="container-max py-8">
      <h1 className="text-2xl font-bold mb-6">Sell an item</h1>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input name="imageUrl" value={form.imageUrl} onChange={onChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://..." />
            </div>
          </div>
          <button className="btn-primary">Create listing</button>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-3">Preview</h2>
          {!form.imageUrl ? (
            <div className="aspect-[4/3] bg-gray-100 rounded-lg grid place-items-center text-gray-500">Image preview</div>
          ) : (
            <img src={form.imageUrl} alt="Preview" className="rounded-lg aspect-[4/3] object-cover w-full" />
          )}
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


