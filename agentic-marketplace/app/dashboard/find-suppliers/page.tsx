'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function FindSuppliers() {

  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  useEffect(() => {
    const loadSuppliers = async () => {

      let query = supabase
        .from('supplier_listings')
        .select(`
          id,
          title,
          product_category,
          description,
          price_min,
          price_max,
          min_order_quant,
          lead_time_days,
          country,
          organizations (
            name,
            trust_score,
            deals_completed,
            city
          )
        `)

        const loadFilters = async () => {
        const { data: categoryData } = await supabase
            .from('supplier_listings')
            .select('product_category')

        const { data: countryData } = await supabase
            .from('supplier_listings')
            .select('country')

        if (categoryData) {
            const uniqueCategories = [...new Set(categoryData.map(c => c.product_category))]
            setCategories(uniqueCategories)
        }

        if (countryData) {
            const uniqueCountries = [...new Set(countryData.map(c => c.country))]
            setCountries(uniqueCountries)
        }
        }
        loadFilters()

        if (search) {
        query = query.ilike('title', `%${search}%`)
        }
        if (category) {
        query = query.eq('product_category', category)
        }

        if (country) {
        query = query.eq('country', country)
        }

        const { data, error } = await query
        console.log("SUPPLIERS:", data)
        console.log("ERROR:", error)

      if (data) {
        setSuppliers(data)
      }
    }

    loadSuppliers()
  }, [search, category, country])

  return (

    <div className="min-h-screen bg-yellow-50 p-10">

        <button
        onClick={() => router.push('/dashboard')}
        className="mb-6 px-4 py-2 bg-amber-300 hover:bg-amber-400 rounded-lg"
        >
        ← Back to Dashboard
        </button>
      <h1 className="text-3xl font-bold mb-10">
        Find Suppliers
      </h1>

        <div className="flex gap-4 mb-8">

        <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-64"
        />

        <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded-lg px-4 py-2"
        >

        <option value="">All Categories</option>

        {categories.map((cat) => (
            <option key={cat} value={cat}>
            {cat}
            </option>
        ))}

        </select>

        <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="border rounded-lg px-4 py-2"
        >

        <option value="">All Countries</option>

        {countries.map((c) => (
            <option key={c} value={c}>
            {c}
            </option>
        ))}

        </select>

        </div>
      <div className="grid grid-cols-3 gap-6">

        {suppliers.map((supplier) => (

          <div
            key={supplier.id}
            className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3"
          >

            <h2 className="text-xl font-semibold">
              {supplier.title}
            </h2>

            <p className="text-sm text-gray-700">
              {supplier.description}
            </p>

            <div className="text-sm mt-2">
              Supplier: {supplier.organizations?.name}
            </div>

            <div className="text-sm">
              Location: {supplier.organizations?.city}, {supplier.country}
            </div>

            <div className="text-sm">
              Price: ${supplier.price_min} - ${supplier.price_max}
            </div>

            <div className="text-sm">
              Min Order: {supplier.min_order_quantity}
            </div>

            <div className="text-sm">
              Lead Time: {supplier.lead_time_days} days
            </div>

            <div className="mt-3 font-medium">
              ⭐ Trust: {supplier.organizations?.trust_score}
            </div>

            <div className="text-sm">
              Deals: {supplier.organizations?.deals_completed}
            </div>

            <button
              className="mt-4 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl"
            >
              Invite to Deal
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}