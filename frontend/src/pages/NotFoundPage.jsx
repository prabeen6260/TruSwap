import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="container-max py-16">
      <div className="card p-10 text-center">
        <div className="text-6xl font-bold text-brand">404</div>
        <div className="mt-3 text-lg font-semibold">Page not found</div>
        <p className="text-gray-600 mt-1">The page youre looking for doesnt exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Go home</Link>
      </div>
    </div>
  )
}

export default NotFoundPage


