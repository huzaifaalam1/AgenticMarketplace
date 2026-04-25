'use client'

import { useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'

export default function ProcessPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { dealId } = useParams()
    const pathname = usePathname()

    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    const handleAnalyze = () => {
        setLoading(true)

        setTimeout(() => {
        setLoading(false)
            router.push(`/dashboard/active-deals/${dealId}/ai-summary`)
        }, 2000)
    }

    return (
        <DashboardLayout>
            <div className="p-10 max-w-3xl mx-auto">

                <ProgressBar stage={currentStage} />

                <h1 className="text-2xl font-bold mb-6">Processing Contract</h1>

                <button
                onClick={handleAnalyze}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                >
                {loading ? 'Analyzing...' : 'Analyze Contract'}
                </button>

            </div>
        </DashboardLayout>
    )
}