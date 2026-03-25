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
    <div className="w-full flex justify-between items-center px-8 py-4 bg-amber-100 shadow-md">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-xl"
        >
          ☰
        </button>

        <span className="text-xl font-semibold text-gray-800">
          {displayName}
        </span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-8 relative">

        <button
          onClick={() => setAccountDropdown(!accountDropdown)}
          className="font-medium text-gray-700"
        >
          Account Settings
        </button>

        {accountDropdown && (
          <div
            ref={accountDropdownRef}
            className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg p-4 w-48 flex flex-col gap-2"
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