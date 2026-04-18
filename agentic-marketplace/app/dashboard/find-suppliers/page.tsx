'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/DashboardLayout'

export default function FindSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

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

      if (search) query = query.ilike('title', `%${search}%`)
      if (category) query = query.eq('product_category', category)
      if (country) query = query.eq('country', country)

      const { data } = await query
      if (data) setSuppliers(data)
    }

    const loadFilters = async () => {
      const { data: categoryData } = await supabase
        .from('supplier_listings')
        .select('product_category')

      const { data: countryData } = await supabase
        .from('supplier_listings')
        .select('country')

      if (categoryData) {
        setCategories([...new Set(categoryData.map(c => c.product_category))])
      }

      if (countryData) {
        setCountries([...new Set(countryData.map(c => c.country))])
      }
    }

    loadSuppliers()
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

      <h1 className="text-3xl font-bold mb-10">Find Suppliers</h1>

      {/* SAME FILTER UI (unchanged) */}

      <div className="grid grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3 hover:scale-[1.02] transition">

            <h2 className="text-xl font-semibold">{supplier.title}</h2>
            <p className="text-sm text-gray-700">{supplier.description}</p>

            <div className="text-sm">Supplier: {supplier.organizations?.name}</div>

            <div className="text-sm">
              Location: {supplier.organizations?.city
                ? `${supplier.organizations.city}, ${supplier.country}`
                : supplier.country}
            </div>

            <div className="text-sm">
              Price: ${supplier.price_min} - ${supplier.price_max}
            </div>

            <div className="text-sm">Min Order: {supplier.min_order_quant}</div>
            <div className="text-sm">Lead Time: {supplier.lead_time_days} days</div>

            <div className="mt-3 font-medium">
              ⭐ Trust: {supplier.organizations?.trust_score}
            </div>

            <button className="mt-4 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl">
              Invite to Deal
            </button>

          </div>
        ))}
      </div>

    </DashboardLayout>
  )
}