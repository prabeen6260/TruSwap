function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="container-max py-8 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-md bg-brand text-white grid place-items-center font-bold">TS</div>
            <span className="text-lg font-bold">TruSwap</span>
          </div>
          <p className="text-gray-600">Campus-verified marketplace for Truman State students.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Marketplace</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="/listings">Browse listings</a></li>
            <li><a href="/sell">Sell an item</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Safety & Policies</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-gray-600">
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div className="container-max py-4 border-t border-gray-100 text-gray-500 text-xs">
        © {new Date().getFullYear()} TruSwap. Not affiliated with Truman State University.
      </div>
    </footer>
  )
}

export default Footer


