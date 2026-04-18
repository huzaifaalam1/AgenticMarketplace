'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/DashboardLayout'

export default function FindBuyers() {
  const [buyers, setBuyers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadBuyers = async () => {
      let query = supabase
        .from('buyer_requests')
        .select(`
          id,
          title,
          product_category,
          description,
          budget_min,
          budget_max,
          quantity,
          country,
          organizations (
            name,
            trust_score,
            deals_completed,
            city
          )
        `)

      if (search) query = query.ilike('title', `%${search}%`)
      if (category) query = query.eq('product_category', category)
      if (country) query = query.eq('country', country)

      const { data } = await query
      if (data) setBuyers(data)
    }

    const loadFilters = async () => {
      const { data: categoryData } = await supabase
        .from('buyer_requests')
        .select('product_category')

      const { data: countryData } = await supabase
        .from('buyer_requests')
        .select('country')

      if (categoryData) {
        setCategories([...new Set(categoryData.map(c => c.product_category))])
      }

      if (countryData) {
        setCountries([...new Set(countryData.map(c => c.country))])
      }
    }

    loadBuyers()
    loadFilters()
  }, [search, category, country])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-10">Find Buyers</h1>

      <div className="flex gap-4 mb-8 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64"
        />

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded-lg"
          >
            ⚙ Filters
          </button>

          {showFilters && (
            <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-lg p-4 w-64 z-50">
              <div className="mb-3">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-2 py-1"
                >
                  <option value="">All</option>
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-2 py-1"
                >
                  <option value="">All</option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3 hover:scale-[1.02] transition">

            <h2 className="text-xl font-semibold">{buyer.title}</h2>
            <p className="text-sm text-gray-700">{buyer.description}</p>

            <div className="text-sm">Buyer: {buyer.organizations?.name}</div>

            <div className="text-sm">
              Location: {buyer.organizations?.city
                ? `${buyer.organizations.city}, ${buyer.country}`
                : buyer.country}
            </div>

            <div className="text-sm">
              Budget: ${buyer.budget_min} - ${buyer.budget_max}
            </div>

            <div className="text-sm">Quantity: {buyer.quantity}</div>

            <div className="mt-3 font-medium">
              ⭐ Trust: {buyer.organizations?.trust_score}
            </div>

            <button className="mt-4 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl">
              Offer Supply
            </button>

          </div>
        ))}
      </div>

    </DashboardLayout>
  )
}