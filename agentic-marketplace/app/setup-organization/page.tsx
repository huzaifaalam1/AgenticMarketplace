'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

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

    // 2️⃣ Mark profile completed
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      await supabase
        .from('profiles')
        .update({ profile_completed: true })
        .eq('id', session.user.id)
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

        <input
          type="text"
          placeholder="Industry"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />

        <textarea
          placeholder="Business Description"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Country"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          type="text"
          placeholder="City"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          type="text"
          placeholder="Website (optional)"
          className="w-full p-3 rounded-xl border border-gray-300 mb-6 focus:ring-2 focus:ring-amber-400"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
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