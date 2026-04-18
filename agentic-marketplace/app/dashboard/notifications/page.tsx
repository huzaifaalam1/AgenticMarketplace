'use client'

import DashboardLayout from '@/components/DashboardLayout'

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      message: 'John Doe requested to buy 100 units of your product'
    },
    {
      id: 2,
      message: 'Your trust score increased to 3.8!'
    },
    {
      id: 3,
      message: 'The dispute with Supplier X has been resolved in your favor'
    },
    {
      id: 4,
      message: 'New features have been added to the marketplace'
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>

        <div className="flex flex-col gap-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="p-4 rounded-2xl border border-amber-200 bg-amber-100 shadow-sm"
            >
              <p className="text-gray-700">{notification.message}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
