'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accountDropdown, setAccountDropdown] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profileData) {
        router.push('/onboarding')
        return
      }

      if (!profileData.profile_completed) {
        router.push(
          profileData.account_type === 'individual'
            ? '/setup-profile'
            : '/setup-organization'
        )
        return
      }

      setProfile(profileData)

      if (profileData.account_type === 'organization_member') {
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .single()

        if (membership) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', membership.organization_id)
            .single()

          setOrganization(orgData)
        }
      }
    }

    loadData()
  }, [router])

  const displayName =
    profile?.account_type === 'individual'
      ? profile?.full_name
      : organization?.name

  const trust =
    profile?.account_type === 'individual'
      ? profile?.trust_score
      : organization?.trust_score

  const deals =
    profile?.account_type === 'individual'
      ? profile?.deals_completed
      : organization?.deals_completed

  const disputes =
    profile?.account_type === 'individual'
      ? profile?.disputes_count
      : organization?.disputes_count

  return (
    <div className="min-h-screen bg-yellow-50 relative">

      {/* TOP NAV */}
      <div className="flex justify-between items-center px-8 py-4 bg-amber-100 shadow-md">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl"
          >
            ☰
          </button>

          <span className="text-xl font-semibold text-gray-800">
            {displayName}
          </span>
        </div>

        <div className="flex items-center gap-8 relative">

          <button
            onClick={() => setAccountDropdown(!accountDropdown)}
            className="font-medium text-gray-700"
          >
            Account Settings
          </button>

          {accountDropdown && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg p-4 w-48 flex flex-col gap-2">
              <button
                onClick={() =>
                  router.push(
                    profile.account_type === 'individual'
                      ? '/setup-profile'
                      : '/setup-organization'
                  )
                }
                className="text-left hover:text-amber-600"
              >
                Edit Profile
              </button>
              <button className="text-left hover:text-amber-600">
                Reset Password
              </button>
              <button className="text-left text-red-500 hover:text-red-600">
                Delete Account
              </button>
            </div>
          )}

          <button className="font-medium text-gray-700">
            Analytics
          </button>

        </div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-amber-50 shadow-xl p-6 z-50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        <h2 className="text-lg font-semibold mb-6 text-gray-800">
            Marketplace
        </h2>

        <div className="flex flex-col gap-4">
            <button className="text-left hover:text-amber-600">
                Find Buyers
            </button>
            <button className="text-left hover:text-amber-600">
                Find Suppliers
            </button>
            <button className="text-left hover:text-amber-600">
                Active Deals
            </button>
        </div>
      </div>

      {/* MAIN METRICS */}
      <div className="flex justify-center gap-12 mt-20">

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span className="text-lg font-medium text-gray-700">
            Trust Score
          </span>
          <span className="text-3xl font-bold text-gray-800 mt-2">
            ⭐ {trust}
          </span>
        </div>

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span className="text-lg font-medium text-gray-700">
            Deals Completed
          </span>
          <span className="text-3xl font-bold text-gray-800 mt-2">
            {deals}
          </span>
        </div>

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span className="text-lg font-medium text-gray-700">
            Disputes
          </span>
          <span className="text-3xl font-bold text-gray-800 mt-2">
            {disputes}
          </span>
        </div>

      </div>

      {/* FLOATING SUPPORT */}
      <div className="absolute bottom-10 right-10">
        <div className="bg-amber-400 hover:bg-amber-500 transition w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer">
          <span className="text-lg font-bold text-gray-800">24/7</span>
          <span className="text-sm text-gray-800">Support</span>
        </div>
      </div>

    </div>
  )
}