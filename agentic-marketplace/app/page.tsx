export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          Agentic Marketplace
        </h1>
        <p className="text-gray-600 mb-6">
          AI-powered escrow & trade risk infrastructure
        </p>

        <div className="space-x-4">
          <a
            href="/signup"
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Sign Up
          </a>

          <a
            href="/login"
            className="px-6 py-2 border border-black rounded-lg"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  )
}