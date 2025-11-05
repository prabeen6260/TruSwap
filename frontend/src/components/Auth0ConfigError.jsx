function Auth0ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 max-w-md">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-center mb-4">Auth0 Not Configured</h2>
        <p className="text-gray-700 mb-4">
          Auth0 credentials are missing. Please check your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Required environment variables:</p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><code>VITE_AUTH0_DOMAIN</code> - Your Auth0 domain</li>
            <li><code>VITE_AUTH0_CLIENT_ID</code> - Your Auth0 client ID</li>
            <li><code>VITE_AUTH0_REDIRECT_URI</code> - Optional (defaults to current origin)</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-yellow-900 mb-2">After updating .env:</p>
          <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
            <li>Save the <code>.env</code> file</li>
            <li>Stop your dev server (Ctrl+C)</li>
            <li>Restart it: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Auth0ConfigError

