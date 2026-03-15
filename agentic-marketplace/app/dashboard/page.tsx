'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'

export default function Dashboard() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [accountDropdown, setAccountDropdown] = useState(false)
  const [wallet, setWallet] = useState<any>(null)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const accountDropdownRef = useRef<HTMLDivElement>(null)

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
        .maybeSingle()

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

      // ✅ WALLET (clean version)
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
        .maybeSingle()

      setWallet(walletData)

      // ✅ ORG
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

  const handleAddFunds = async () => {
    if (!wallet || !depositAmount) return

    const amount = Number(depositAmount)

    if (amount <= 0) {
      alert('Enter a valid amount')
      return
    }

    const newBalance = wallet.available_balance + amount

    // Update wallet balance
    await supabase
      .from('wallets')
      .update({
        available_balance: newBalance
      })
      .eq('id', wallet.id)

    // Create ledger record
    await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'deposit',
        amount: amount,
        direction: 'credit',
        description: 'Wallet deposit'
      })

    setWallet({
      ...wallet,
      available_balance: newBalance
    })

    setShowAddFunds(false)
    setDepositAmount('')
  }
  return (
    <DashboardLayout
      profile={profile}
      organization={organization}
      wallet={wallet}
    >

      <div className="flex justify-center gap-12 mt-10">

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

    </DashboardLayout>
  )
}