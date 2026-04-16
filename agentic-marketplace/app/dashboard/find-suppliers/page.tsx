'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function FindSuppliers() {

  const router = useRouter()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const filterRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target as Node)
            ) {
                setShowFilters(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <DashboardLayout profile={profile} organization={organization} wallet={wallet}>
        <h1 className="text-3xl font-bold mb-10">
          Find Suppliers
        </h1>

        <div className="flex gap-4 mb-8 items-center">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-64"
          />

          {/* FILTER BUTTON */}
          <div className="relative" ref={filterRef}>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded-lg"
            >
              ⚙ Filters
            </button>

            {showFilters && (
              <div className="absolute top-12 left-0 bg-white rounded-2xl shadow-lg p-4 w-64 z-50">

                {/* CATEGORY */}
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

                {/* COUNTRY */}
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

          {suppliers.map((supplier) => (

            <div
              key={supplier.id}
              className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3
                          transition transform hover:scale-[1.02]"
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
                Location: {
                  supplier.organizations?.city
                    ? `${supplier.organizations.city}, ${supplier.country}`
                    : supplier.country
                }
              </div>

              <div className="text-sm">
                Price: ${supplier.price_min} - ${supplier.price_max}
              </div>

              <div className="text-sm">
                Min Order: {supplier.min_order_quant}
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
    </DashboardLayout>
  )
}