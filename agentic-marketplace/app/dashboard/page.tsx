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

      if (!session) return router.push('/login')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profileData) return router.push('/onboarding')

      if (!profileData.profile_completed) {
        return router.push(
          profileData.account_type === 'individual'
            ? '/setup-profile'
            : '/setup-organization'
        )
      }

      setProfile(profileData)

      const ownerId =
        profileData.account_type === 'organization'
          ? profileData.organization_id
          : profileData.id

      const ownerType = profileData.account_type

      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('owner_type', ownerType)
        .maybeSingle()

      setWallet(walletData)

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

  const trust = profile?.account_type === 'individual'
    ? profile?.trust_score
    : organization?.trust_score

  const deals = profile?.account_type === 'individual'
    ? profile?.deals_completed
    : organization?.deals_completed

  const disputes = profile?.account_type === 'individual'
    ? profile?.disputes_count
    : organization?.disputes_count

  const handleAddFunds = async (amount: number) => {
    if (!wallet || amount <= 0) return

    const newBalance = wallet.available_balance + amount

    await supabase
      .from('wallets')
      .update({ available_balance: newBalance })
      .eq('id', wallet.id)

    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'deposit',
        amount,
        direction: 'credit',
        description: 'Wallet deposit'
      })

    setWallet((prev: any) => ({
      ...prev,
      available_balance: newBalance
    }))
  }

  return (
    <DashboardLayout
      profile={profile}
      organization={organization}
      wallet={wallet}
      onAddFunds={handleAddFunds}
    >
      <div className="flex justify-center gap-12 mt-10">
        {[
          { label: 'Trust Score', value: `⭐ ${trust}` },
          { label: 'Deals Completed', value: deals },
          { label: 'Disputes', value: disputes }
        ].map((item, i) => (
          <div key={i} className="bg-amber-100 rounded-3xl shadow-md w-64 h-40 flex flex-col items-center justify-center">
            <span className="text-lg font-medium text-gray-700">
              {item.label}
            </span>
            <span className="text-3xl font-bold text-gray-800 mt-2">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}