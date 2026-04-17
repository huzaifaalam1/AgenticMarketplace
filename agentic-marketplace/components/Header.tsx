'use client'

import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Header({ displayName, accountType, onMenuClick }: any) {
  const router = useRouter()

  const [accountDropdown, setAccountDropdown] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 bg-amber-100 shadow-md">

      {/* LEFT: MENU */}
      <button
        onClick={onMenuClick}
        className="text-2xl"
      >
        ☰
      </button>

      {/* CENTER: APP NAME */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-semibold text-gray-800">
        Agentic Marketplace
      </div>

      {/* RIGHT: ACCOUNT */}
      <div className="relative">
        <button
          onClick={() => setAccountDropdown(!accountDropdown)}
          className="font-medium text-gray-700"
        >
          Account Settings
        </button>

        {accountDropdown && (
          <div
            ref={accountDropdownRef}
            className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg p-4 w-48 flex flex-col gap-2 z-50"
          >
            <button
              onClick={() =>
                router.push(
                  accountType === 'individual'
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

            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="text-left hover:text-amber-600"
            >
              Sign Out
            </button>

            <button className="text-left text-red-500 hover:text-red-600">
              Delete Account
            </button>
          </div>
        )}
      </div>

    </div>
  )
}