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

        const { data: { session } } = await supabase.auth.getSession()

        let recipientId = null

        // 🟡 CASE 1: ORGANIZATION
        if (supplier.organization_id) {
            console.log('Looking up org members for org_id:', supplier.organization_id)
            
            const { data: member, error } = await supabase
                .from('organization_members')
                .select('user_id')
                .eq('organization_id', supplier.organization_id)
                .limit(1)
                .maybeSingle()

            console.log('Org member result:', member, 'Error:', error)

            if (member) {
                recipientId = member.user_id
                console.log('Using org member user_id:', recipientId)
            } else {
                console.log('No org member found, falling back to org owner')
                // Fallback: use org owner if no members found
                const { data: org, error: orgError } = await supabase
                    .from('organizations')
                    .select('owner_id')
                    .eq('id', supplier.organization_id)
                    .single()

                console.log('Org owner result:', org, 'Error:', orgError)

                if (org?.owner_id) {
                    recipientId = org.owner_id
                    console.log('Using org owner user_id:', recipientId)
                } else {
                    console.error('ORG LOOKUP FAILED - member error:', error, 'org error:', orgError)
                    alert('Could not find organization user - no members or owner found')
                    setLoading(false)
                    return
                }
            }
        }

        // 🟢 CASE 2: INDIVIDUAL
        else if (supplier.user_id) {
            recipientId = supplier.user_id
        }

        // 🔴 FAIL SAFE
        if (!recipientId) {
            alert('No valid recipient found')
            setLoading(false)
            return
        }

        let senderName = 'Someone'

        // 🔹 Try org first
        const { data: membership } = await supabase
            .from('organization_members')
            .select(`
                organization_id,
                organizations (
                    name
                )
            `)
            .eq('user_id', session?.user.id)
            .limit(1)
            .single()

        let orgName: string | undefined
        if (membership?.organizations) {
            if (Array.isArray(membership.organizations)) {
                orgName = membership.organizations[0]?.name
            } else {
                orgName = (membership.organizations as any)?.name
            }
        }

        if (orgName) {
            senderName = orgName
        } else {
            // 🔹 fallback → individual
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', session?.user.id)
                .maybeSingle()

            senderName = profile?.full_name || 'A user'
        }

        const message = `${senderName} invited you to a deal for "${supplier.title}"`

        const { error } = await supabase.from('notifications').insert({
            user_id: recipientId,
            sender_id: session?.user.id,
            related_listing_id: supplier.id,
            organization_id: membership?.organization_id || null,
            message: message,
            type: 'deal_invite',
            status: 'pending',
            read: false
        })

        
        if (error) {
            console.error('NOTIFICATION ERROR:', error)
            alert(error.message)
        }

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

                <div className="text-sm mb-3">
                    <b className="text-amber-700">Terms & Conditions</b>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 h-32 overflow-y-auto text-xs text-gray-700">
                    <p className="mb-2"><strong>1. Agreement Overview</strong><br/>
                    By accepting this deal invite, you agree to enter into a business transaction with the inviting party. This agreement is binding upon acceptance.</p>
                    
                    <p className="mb-2"><strong>2. Payment Terms</strong><br/>
                    Payment terms will be mutually agreed upon between both parties before the commencement of any work or delivery of goods. All payments shall be made in accordance with the agreed schedule.</p>
                    
                    <p className="mb-2"><strong>3. Delivery & Performance</strong><br/>
                    The supplier agrees to deliver goods or services as specified in the listing. The buyer agrees to provide necessary information and cooperate as needed for successful completion.</p>
                    
                    <p className="mb-2"><strong>4. Confidentiality</strong><br/>
                    Both parties agree to keep all business information, pricing, and deal details confidential and not disclose them to third parties without written consent.</p>
                    
                    <p className="mb-2"><strong>5. Dispute Resolution</strong><br/>
                    Any disputes arising from this agreement shall be resolved through good faith negotiations. If unresolved, disputes may be escalated to the platform's dispute resolution system.</p>
                    
                    <p><strong>6. Termination</strong><br/>
                    Either party may terminate this agreement with written notice if the other party materially breaches any terms. Termination does not relieve parties of obligations incurred prior to termination.</p>
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)}/>
                    <span className="text-sm">I have read and agree to the terms & conditions</span>
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