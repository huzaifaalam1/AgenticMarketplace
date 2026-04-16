'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function DashboardLayout({
  children,
  profile,
  organization,
  wallet,
  onAddFunds
}: any) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName =
    profile?.account_type === 'individual'
      ? profile?.full_name
      : organization?.name

  return (
    <div className="min-h-screen bg-yellow-50">

      <Header
        displayName={displayName}
        accountType={profile?.account_type}
        onMenuClick={() => setSidebarOpen(prev => !prev)}
      />

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        wallet={wallet}
        onAddFunds={onAddFunds}
      />

      <div className="p-8">{children}</div>
    </div>
  )
}