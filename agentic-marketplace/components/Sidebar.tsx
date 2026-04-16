'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar({ sidebarOpen, setSidebarOpen, wallet, onAddFunds }: any) {
  const router = useRouter()
  const [amount, setAmount] = useState('')

  const handleDeposit = () => {
    const parsed = Number(amount)
    if (parsed > 0) {
      onAddFunds(parsed)
      setAmount('')
    }
  }

  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      <div className={`fixed top-0 left-0 h-full w-64 bg-amber-50 shadow-xl p-6 z-50
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-2xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6">Marketplace</h2>

        {wallet && (
          <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
            <p className="text-sm text-gray-500">Wallet</p>

            <p className="text-2xl font-semibold mt-1">
              ${wallet.available_balance?.toFixed(2) || '0.00'}
            </p>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-3 w-full border rounded-lg p-2 text-sm"
            />

            <button
              onClick={handleDeposit}
              className="mt-2 w-full bg-amber-400 hover:bg-amber-500 py-2 rounded-lg text-sm font-medium"
            >
              Add Funds
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button onClick={() => router.push('/dashboard')}>Home</button>
          <button onClick={() => router.push('/dashboard/find-buyers')}>Find Buyers</button>
          <button onClick={() => router.push('/dashboard/find-suppliers')}>Find Suppliers</button>
          <button>Active Deals</button>
          <button>Business Analytics</button>
        </div>
      </div>
    </>
  )
}