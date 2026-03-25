'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function Dashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)

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

      // WALLET
      let ownerId = profileData.id
      let ownerType = 'individual'

      if (profileData.account_type === 'organization') {
        ownerId = profileData.organization_id
        ownerType = 'organization'
      }

      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('owner_type', ownerType)
        .single()

      setWallet(walletData)

      // ORG
      if (profileData.account_type === 'organization') {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.organization_id)
          .single()

        setOrganization(orgData)
      }
    }

    loadData()
  }, [router])

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
    <DashboardLayout
      profile={profile}
      organization={organization}
      wallet={wallet}
    >

      {/* DASHBOARD CONTENT ONLY */}
      <div className="flex justify-center gap-12 mt-10">

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span>Trust Score</span>
          <span className="text-3xl font-bold mt-2">
            ⭐ {trust}
          </span>
        </div>

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span>Deals Completed</span>
          <span className="text-3xl font-bold mt-2">
            {deals}
          </span>
        </div>

        <div className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
          <span>Disputes</span>
          <span className="text-3xl font-bold mt-2">
            {disputes}
          </span>
        </div>

      </div>

    </DashboardLayout>
  )
}