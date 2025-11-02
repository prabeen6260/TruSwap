import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    navigate(`/listings?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container-max py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand text-white grid place-items-center font-bold">TS</div>
          <span className="text-xl font-bold tracking-tight">TruSwap</span>
        </Link>

        <form onSubmit={onSubmit} className="flex-1 hidden md:flex">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, devices, appliances..."
            className="w-full rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button type="submit" className="btn-primary rounded-l-none rounded-r-lg">Search</button>
        </form>

        <nav className="ml-auto flex items-center gap-3">
          <NavLink to="/listings" className="btn-outline">Browse</NavLink>
          <NavLink to="/sell" className="btn-primary">Sell an item</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar


