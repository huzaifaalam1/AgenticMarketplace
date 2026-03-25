'use client'

import { useRouter } from 'next/navigation'

export default function Sidebar({ sidebarOpen, setSidebarOpen, wallet }: any) {
  const router = useRouter()

  return (
    <>
      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-amber-50 shadow-xl p-6 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >

        {/* CLOSE BUTTON */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6 text-gray-800">
          Marketplace
        </h2>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => router.push('/dashboard')}
            className="text-left hover:text-amber-600 font-medium"
          >
            Home
          </button>

          <button
            onClick={() => router.push('/dashboard/find-buyers')}
            className="text-left hover:text-amber-600"
          >
            Find Buyers
          </button>

          <button
            onClick={() => router.push('/dashboard/find-suppliers')}
            className="text-left hover:text-amber-600"
          >
            Find Suppliers
          </button>

          <button className="text-left hover:text-amber-600">
            Active Deals
          </button>

          <button className="text-left hover:text-amber-600">
            Analytics
          </button>
        </div>
      </div>
    </>
  )
}