'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'

interface Risk {
    category: string
    riskLevel: string
    clause: string
    explanation: string
}

export default function AISummaryPage() {
    const router = useRouter()
    const { dealId } = useParams()
    const pathname = usePathname()

    // 🔥 Stage from URL
    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    // 🔹 Mock data (same structure as your original)
    const risks: Risk[] = [
        {
        category: 'Payment Terms',
        riskLevel: 'High',
        clause: 'Payment due 90 days after delivery',
        explanation:
            'Extended payment terms increase cash flow risk and may affect working capital.'
        },
        {
        category: 'Liability',
        riskLevel: 'Medium',
        clause: 'Limited liability to contract value',
        explanation:
            'Standard limitation clause, but consider if adequate for potential damages.'
        },
        {
        category: 'Termination',
        riskLevel: 'Low',
        clause: '30-day termination notice period',
        explanation:
            'Reasonable termination clause providing adequate notice period.'
        }
    ]

    const summary =
        'This contract presents moderate overall risk. The primary concern is extended payment terms. Liability and termination clauses are within acceptable industry standards.'

    return (
        <DashboardLayout>
        <div className="min-h-screen p-10 max-w-4xl mx-auto">

            {/* 🔥 Progress Bar */}
            <ProgressBar stage={currentStage} />

            <h1 className="text-3xl font-bold mb-8 text-center">
            AI Contract Summary
            </h1>

            {/* 🔹 Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
            <p className="text-gray-700">{summary}</p>
            </div>

            {/* 🔹 Risk Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Risk Overview</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-red-100 p-3 rounded">
                <div className="text-2xl font-bold text-red-600">
                    {risks.filter(r => r.riskLevel === 'High').length}
                </div>
                <div className="text-sm text-gray-600">High Risk</div>
                </div>

                <div className="bg-yellow-100 p-3 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                    {risks.filter(r => r.riskLevel === 'Medium').length}
                </div>
                <div className="text-sm text-gray-600">Medium Risk</div>
                </div>

                <div className="bg-green-100 p-3 rounded">
                <div className="text-2xl font-bold text-green-600">
                    {risks.filter(r => r.riskLevel === 'Low').length}
                </div>
                <div className="text-sm text-gray-600">Low Risk</div>
                </div>
            </div>
            </div>

            {/* 🔹 Risk Details */}
            <div className="space-y-4">
            {risks.map((risk, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{risk.category}</h3>

                    <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        risk.riskLevel === 'High'
                        ? 'bg-red-100 text-red-700'
                        : risk.riskLevel === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                    >
                    {risk.riskLevel}
                    </span>
                </div>

                <p className="mb-2">
                    <strong>Clause:</strong> {risk.clause}
                </p>

                <p>
                    <strong>Explanation:</strong> {risk.explanation}
                </p>
                </div>
            ))}
            </div>

            {/* 🔹 Continue Button */}
            <div className="mt-10 text-center">
            <button
                onClick={() =>
                router.push(`/dashboard/active-deals/${dealId}/disputes`)
                }
                className="bg-amber-400 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold"
            >
                Continue to Disputes
            </button>
            </div>
        </div>
        </DashboardLayout>
    )
}