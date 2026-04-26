'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'

export default function ViewContract() {
    const router = useRouter()
    const { dealId } = useParams()
    const pathname = usePathname()
    const [contractText, setContractText] = useState('')
    const [loading, setLoading] = useState(true)

    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    useEffect(() => {
        const loadContract = async () => {
            if (!dealId) return

            setLoading(true)

            const { data, error } = await supabase
                .from('contracts')
                .select('contract_text')
                .eq('deal_id', dealId)
                .maybeSingle()

            if (error) {
                console.error('SUPABASE ERROR:', JSON.stringify(error, null, 2))
            } else if (data?.contract_text) {
                setContractText(data.contract_text)
                setLoading(false)
                return
            }

            const { data: contractEvent, error: contractEventError } =
                await supabase
                    .from('deal_events')
                    .select('content')
                    .eq('deal_id', dealId)
                    .in('type', ['CONTRACT_UPLOADED', 'contract'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

            if (contractEventError) {
                console.error(contractEventError)
                setContractText('')
                setLoading(false)
                return
            }

            setContractText(contractEvent?.content || '')
            setLoading(false)
        }

        loadContract()
    }, [dealId])

    return (
        <DashboardLayout>
        <div className="p-10 max-w-3xl mx-auto">

            <ProgressBar stage={currentStage} />

            <h1 className="text-2xl font-bold mb-6">Review Contract</h1>

            <div className="bg-white p-6 rounded shadow">
            {loading ? (
                <p className="text-gray-500">Loading contract...</p>
            ) : contractText ? (
                <pre className="whitespace-pre-wrap text-sm">
                    {contractText}
                </pre>
            ) : (
                <p className="text-gray-500">
                    No saved contract found for this deal yet.
                </p>
            )}
            </div>

            <button
            onClick={() => router.push(`/dashboard/active-deals/${dealId}/process`)}
            className="mt-6 bg-amber-400 px-6 py-2 rounded-lg"
            disabled={!contractText}
            >
            Proceed to Processing
            </button>

        </div>
        </DashboardLayout>
    )
}
