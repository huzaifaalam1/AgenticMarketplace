'use client'

import DashboardLayout from '@/components/DashboardLayout'
import Messages from '@/components/Messages'
import { useSearchParams } from 'next/navigation'

export default function Dashboard() {
  const searchParams = useSearchParams()
  const initialChatId = searchParams.get('chat')

  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-6 h-full min-h-0">

        {/* LEFT AREA - MESSAGES */}
        <div className="col-span-3 h-full min-h-0">
          <Messages initialChatId={initialChatId} />
        </div>

      </div>
    </DashboardLayout>
  )
}