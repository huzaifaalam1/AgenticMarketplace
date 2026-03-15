'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import CountryCityDropdown from '@/components/CountryCityDropdown'
import IndustriesDropdown from '@/components/IndustriesDropdown'
import WebsiteInput from '@/components/WebsiteInput'
import BioTextarea from '@/components/BioTextarea'

export default function SetupOrganization() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')
  const [marketplaceRole, setMarketplaceRole] = useState<'buyer' | 'supplier' | 'both'>('buyer')

  useEffect(() => {
    const loadOrganization = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // 1️⃣ Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      setOrgId(membership.organization_id)

      // 2️⃣ Load organization data
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single()

      if (!org) return

      setName(org.name || '')
      setIndustry(org.industry || '')
      setBusinessDescription(org.business_description || '')
      setCountry(org.country || '')
      setCity(org.city || '')
      setWebsite(org.website || '')
      setMarketplaceRole(org.marketplace_role || 'buyer')
    }

    loadOrganization()
  }, [router])

  const handleSave = async () => {
    if (!orgId) return

    if (!industry || !businessDescription || !country) {
      alert('Please complete required fields')
      return
    }

    setLoading(true)

    // 1️⃣ Update organization table
    const { error: orgError } = await supabase
      .from('organizations')
      .update({
        name,
        industry,
        marketplace_role: marketplaceRole,
        business_description: businessDescription,
        country,
        city,
        website,
      })
      .eq('id', orgId)

    if (orgError) {
      setLoading(false)
      alert(orgError.message)
      return
    }

    // 2️⃣ Mark profile completed and set organization_id
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      await supabase
        .from('profiles')
        .update({
          profile_completed: true,
          organization_id: orgId
        })
        .eq('id', session.user.id)
    }

    // 3️⃣ Create wallet if organization doesn't have one
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('owner_id', orgId)
      .maybeSingle()

    // wallet creation with error handling
    if (!existingWallet) {
      const { error: walletError } = await supabase
        .from('wallets')
        .insert({
          owner_type: 'organization',
          owner_id: orgId,
          available_balance: 0,
          escrow_balance: 0,
          currency: 'USD'
        })

      if (walletError) {
        setLoading(false)
        alert(walletError.message)
        return
      }
    }

    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-6">
      <div className="bg-amber-50 p-10 rounded-3xl shadow-xl w-full max-w-xl">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Complete Organization Profile
        </h1>

        <input
          type="text"
          placeholder="Organization Name"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <IndustriesDropdown
          selectedIndustry={industry}
          onIndustryChange={setIndustry}
          className="mb-4"
        />

        <select
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={marketplaceRole}
          onChange={(e) =>
            setMarketplaceRole(e.target.value as any)
          }
        >
          <option value="buyer">Buyer</option>
          <option value="supplier">Supplier</option>
          <option value="both">Both</option>
        </select>

        <BioTextarea
          value={businessDescription}
          onChange={setBusinessDescription}
          maxWords={150}
          maxCharacters={1000}
          className="mb-4"
        />

        <CountryCityDropdown
          selectedCountry={country}
          selectedCity={city}
          onCountryChange={setCountry}
          onCityChange={setCity}
        />

        <WebsiteInput
          value={website}
          onChange={setWebsite}
          className="mb-6"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-400 text-gray-900 font-medium hover:bg-amber-500 transition"
        >
          {loading ? 'Saving...' : 'Finish Setup'}
        </button>

      </div>
    </div>
  )
}