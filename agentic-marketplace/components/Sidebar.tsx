'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar({ sidebarOpen, setSidebarOpen, wallet, onAddFunds }: any) {
  const router = useRouter()
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState('')

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

        {/* WALLET CARD */}
        {wallet && (
        <div className="bg-white rounded-2xl p-4 shadow-md mb-6">

            <p className="text-sm text-gray-500">
            Wallet
            </p>

            <p className="text-2xl font-semibold text-gray-800 mt-1">
            ${wallet.available_balance?.toFixed(2) || '0.00'}
            </p>

            <p className="text-xs text-gray-500">
            Available Balance
            </p>

            <button
                onClick={() => {
                    const amount = Number(prompt("Enter amount"))
                        if (amount > 0) onAddFunds(amount)
                    }}
                className="mt-3 w-full bg-amber-400 hover:bg-amber-500 text-gray-900 py-2 rounded-lg text-sm font-medium"
            >
            Add Funds
            </button>

        </div>
        )}
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