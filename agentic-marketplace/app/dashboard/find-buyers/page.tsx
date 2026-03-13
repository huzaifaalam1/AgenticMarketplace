'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function FindBuyers() {
    const router = useRouter()
  const [buyers, setBuyers] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [category, setCategory] = useState("")
    const [country, setCountry] = useState("")

    const [categories, setCategories] = useState<string[]>([])
    const [countries, setCountries] = useState<string[]>([])

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

    console.log("BUYERS:", data)

    if (data) {
        setBuyers(data)
    }
    }

    loadBuyers()

    const loadFilters = async () => {

    const { data: categoryData } = await supabase
        .from('buyer_requests')
        .select('product_category')

    const { data: countryData } = await supabase
        .from('buyer_requests')
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
        Find Buyers
      </h1>

      <div className="flex gap-4 mb-8">

        <input
            type="text"
            placeholder="Search requests..."
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
            <option key={cat} value={cat}>{cat}</option>
            ))}
        </select>

        <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border rounded-lg px-4 py-2"
        >
            <option value="">All Countries</option>
            {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
            ))}
        </select>

        </div>
      <div className="grid grid-cols-3 gap-6">

        {buyers.map((buyer) => (

        <div
            key={buyer.id}
            className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3"
        >

            <h2 className="text-xl font-semibold">
            {buyer.title}
            </h2>

            <p className="text-sm text-gray-700">
            {buyer.description}
            </p>

            <div className="text-sm">
            Buyer: {buyer.organizations?.name}
            </div>

            <div className="text-sm">
            Location: {buyer.organizations?.city}, {buyer.country}
            </div>

            <div className="text-sm">
            Budget: ${buyer.budget_min} - ${buyer.budget_max}
            </div>

            <div className="text-sm">
            Quantity: {buyer.quantity}
            </div>

            <div className="mt-3 font-medium">
            ⭐ Trust: {buyer.organizations?.trust_score}
            </div>

            <button className="mt-4 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl">
            Offer Supply
            </button>

        </div>

        ))}

        </div>

    </div>
  )
}