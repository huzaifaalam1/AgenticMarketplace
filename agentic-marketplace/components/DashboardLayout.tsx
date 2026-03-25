'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function DashboardLayout({
  children,
  profile,
  organization,
  wallet
}: any) {

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName =
    profile?.account_type === 'individual'
      ? profile?.full_name
      : organization?.name

  return (
    <div className="min-h-screen bg-yellow-50 relative">

      {/* HEADER */}
      <Header
        displayName={displayName}
        accountType={profile?.account_type}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        wallet={wallet}
      />

      {/* PAGE CONTENT */}
      <div className="p-8">
        {children}
      </div>

    </div>
  )
}