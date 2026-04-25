'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function ActiveDeals() {
  const [deals, setDeals] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [country, setCountry] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Placeholder deals data
    const placeholderDeals = [
      {
        id: '1',
        title: 'Organic Wheat Supply Deal',
        product_category: 'Agriculture',
        description: 'High-quality organic wheat for bakery supply chain',
        buyer: 'Global Bakery Corp',
        supplier: 'Green Fields Farm',
        country: 'USA',
        city: 'Iowa',
        value: '$50,000',
        status: 'Active',
        trust_score: 4.8,
        created_date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Electronics Component Partnership',
        product_category: 'Electronics',
        description: 'Semiconductor components for smartphone manufacturing',
        buyer: 'TechMobile Inc',
        supplier: 'ChipWorks Ltd',
        country: 'China',
        city: 'Shenzhen',
        value: '$250,000',
        status: 'Active',
        trust_score: 4.5,
        created_date: '2024-01-20'
      },
      {
        id: '3',
        title: 'Textile Raw Materials',
        product_category: 'Textiles',
        description: 'Premium cotton fabric for fashion brand',
        buyer: 'Style Fashion House',
        supplier: 'Cotton Mills Co',
        country: 'India',
        city: 'Mumbai',
        value: '$75,000',
        status: 'Active',
        trust_score: 4.6,
        created_date: '2024-01-22'
      },
      {
        id: '4',
        title: 'Medical Equipment Supply',
        product_category: 'Healthcare',
        description: 'Diagnostic equipment for hospitals',
        buyer: 'City Health Network',
        supplier: 'MedTech Solutions',
        country: 'Germany',
        city: 'Berlin',
        value: '$180,000',
        status: 'Active',
        trust_score: 4.9,
        created_date: '2024-01-25'
      },
      {
        id: '5',
        title: 'Chemical Raw Materials',
        product_category: 'Chemicals',
        description: 'Industrial chemicals for manufacturing',
        buyer: 'Industrial Works Ltd',
        supplier: 'ChemSupply Inc',
        country: 'USA',
        city: 'Texas',
        value: '$120,000',
        status: 'Active',
        trust_score: 4.3,
        created_date: '2024-01-28'
      },
      {
        id: '6',
        title: 'Automotive Parts Deal',
        product_category: 'Automotive',
        description: 'Engine components for car assembly',
        buyer: 'AutoAssembly Corp',
        supplier: 'PartsMaster Ltd',
        country: 'Japan',
        city: 'Tokyo',
        value: '$300,000',
        status: 'Active',
        trust_score: 4.7,
        created_date: '2024-02-01'
      }
    ]

    setDeals(placeholderDeals)

    // Extract categories and countries from placeholder data
    const cats = [...new Set(placeholderDeals.map(d => d.product_category))]
    const ctrys = [...new Set(placeholderDeals.map(d => d.country))]
    setCategories(cats)
    setCountries(ctrys)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase()) ||
                         deal.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || deal.product_category === category
    const matchesCountry = !country || deal.country === country
    return matchesSearch && matchesCategory && matchesCountry
  })

  const handleViewDetails = (dealId: string) => {
    router.push('/dashboard/active-deals/risk-scanner')
  }

  return (
    <DashboardLayout>

      <h1 className="text-3xl font-bold mb-10">Active Deals</h1>

      <div className="flex gap-4 mb-8 items-center">
        <input
          type="text"
          placeholder="Search deals..."
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
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-amber-100 rounded-3xl shadow-md p-6 flex flex-col gap-3 hover:scale-[1.02] transition">

            <h2 className="text-xl font-semibold">{deal.title}</h2>
            <p className="text-sm text-gray-700">{deal.description}</p>

            <div className="text-sm">Buyer: {deal.buyer}</div>
            <div className="text-sm">Supplier: {deal.supplier}</div>

            <div className="text-sm">
              Location: {deal.city ? `${deal.city}, ${deal.country}` : deal.country}
            </div>

            <div className="text-sm">Value: {deal.value}</div>
            <div className="text-sm">Status: <span className="text-green-600 font-medium">{deal.status}</span></div>
            <div className="text-sm">Started: {deal.created_date}</div>

            <div className="mt-3 font-medium">
              ⭐ Trust: {deal.trust_score}
            </div>

            <button
              onClick={() => handleViewDetails(deal.id)}
              className="mt-4 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

    </DashboardLayout>
  )
}
