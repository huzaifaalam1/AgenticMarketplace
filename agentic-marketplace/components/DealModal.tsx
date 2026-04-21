'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DealModal({ open, onClose, supplier }: any) {
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)

    if (!open) return null

    const handleSend = async () => {
        if (!accepted) return alert("You must accept terms")

        setLoading(true)

        // TODO: replace with real recipient logic later
        const recipientId = supplier.organizations?.id || null

        const { data: { session } } = await supabase.auth.getSession()

        await supabase.from('notifications').insert({
            user_id: recipientId,
            sender_id: session?.user.id,
            related_listing_id: supplier.id,
            message: `${session?.user.email} invited you to a deal for "${supplier.title}"`,
            type: 'deal_invite',
            status: 'pending'
        })

        setLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
                <h2 className="text-lg font-semibold mb-4">Confirm Deal</h2>
                <p className="text-sm text-gray-600 mb-3">
                    You are inviting this supplier to a deal:
                </p>

                <div className="text-sm mb-4">
                    <b>{supplier.title}</b><br/>
                    ${supplier.price_min} - ${supplier.price_max}
                </div>

                <a href="/terms.pdf" target="_blank" className="text-amber-600 underline text-sm">
                    View Terms & Conditions
                </a>

                <div className="flex items-center gap-2 mt-3">
                    <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)}/>
                    <span className="text-sm">I accept the terms</span>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-3 py-1 text-gray-600">
                        Cancel
                    </button>

                    <button onClick={handleSend} className="bg-amber-400 px-4 py-2 rounded-xl">
                        {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                </div>
            </div>
        </div>
    )
}