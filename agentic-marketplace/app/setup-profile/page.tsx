'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SetupProfile() {
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<'individual' | 'organization' | null>(null)

  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyRole, setCompanyRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [marketplaceRole, setMarketplaceRole] = useState<'buyer' | 'supplier' | 'both'>('buyer')

  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        router.push('/onboarding')
        return
      }

      if (profile.profile_completed) {
        router.push('/dashboard')
        return
      }

      setAccountType(profile.account_type)
      setFullName(profile.full_name || '')
      setOrganizationName(profile.organization_name || '')
      setMarketplaceRole(profile.marketplace_role || 'buyer')
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!accountType) return

    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setLoading(false)
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name:
          accountType === 'individual' ? fullName : organizationName,
        full_name:
          accountType === 'individual' ? fullName : null,
        organization_name:
          accountType === 'organization' ? organizationName : null,
        job_title: accountType === 'individual' ? jobTitle : null,
        company_role: accountType === 'organization' ? companyRole : null,
        industry,
        marketplace_role: marketplaceRole,
        business_description: businessDescription,
        country,
        city,
        phone,
        website,
        profile_completed: true,
      })
      .eq('id', session.user.id)

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-6">
      <div className="bg-amber-50 p-10 rounded-3xl shadow-xl w-full max-w-xl">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Complete Your Profile
        </h1>

        {/* Identity */}
        {accountType === 'individual' && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Job Title"
              className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </>
        )}

        {accountType === 'organization' && (
          <>
            <input
              type="text"
              placeholder="Organization Name"
              className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Your Role in Company"
              className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
              value={companyRole}
              onChange={(e) => setCompanyRole(e.target.value)}
            />
          </>
        )}

        {/* Business Info */}
        <input
          type="text"
          placeholder="Industry"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
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

        <textarea
          placeholder="Business Description"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
        />

        {/* Location */}
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

        {/* Contact */}
        <input
          type="text"
          placeholder="Phone"
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:ring-2 focus:ring-amber-400"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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