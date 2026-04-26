'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'
import FileUpload from '../../components/FileUpload'

export default function MakeContract() {
    const router = useRouter()
    const { dealId } = useParams()
    const pathname = usePathname()

    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [contractContent, setContractContent] = useState('')
    const [analysisResults, setAnalysisResults] = useState<any>(null)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const [supplierTerms, setSupplierTerms] = useState('')
    const [buyerName, setBuyerName] = useState('Buyer')
    const [supplierName, setSupplierName] = useState('Supplier')

    const [contractSource, setContractSource] =
        useState<'upload' | 'generate' | null>(null)

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
        async function loadDeal() {
            if (!dealId) return

            const { data } = await supabase
                .from('deals')
                .select(`
                    *,
                    buyer_org:buyer_org_id ( name ),
                    supplier_org:supplier_org_id ( name ),
                    buyer_user:buyer_user_id ( full_name ),
                    supplier_user:supplier_user_id ( full_name )
                `)
                .eq('id', dealId)
                .single()

            const buyer =
                data?.buyer_org?.name ||
                data?.buyer_user?.full_name ||
                'Buyer'

            const supplier =
                data?.supplier_org?.name ||
                data?.supplier_user?.full_name ||
                'Supplier'

            setBuyerName(buyer)
            setSupplierName(supplier)
        }

        loadDeal()
    }, [dealId])

    const handleFileSelect = async (file: File) => {
        setUploadedFile(file)
        setContractSource('upload')
        setAnalysisResults(null)

        if (file.type === 'application/pdf') {
            setContractContent('PDF uploaded')
        } else {
            const text = await file.text()
            setContractContent(text)
        }
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        setUploadedFile(null)
        setContractSource('generate')
        setAnalysisResults(null)
        setContractContent('') // 🔥 important

        try {
            const res = await fetch('/api/ai/generate-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyer: buyerName,
                    supplier: supplierName,
                    terms: supplierTerms,
                    context: 'Active deal'
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            setContractContent(data.contract)

        } catch (err) {
            console.error(err)
            alert('Failed to generate contract')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAnalyse = async () => {
        if (contractSource !== 'upload' || !uploadedFile) return

        setIsAnalyzing(true)

        try {
            const formData = new FormData()
            formData.append('file', uploadedFile)

            const res = await fetch('/api/ai/analyze-contract', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            setAnalysisResults(data)

        } catch (err) {
            console.error(err)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const resetAll = () => {
        setUploadedFile(null)
        setContractContent('')
        setAnalysisResults(null)
        setContractSource(null)
    }

    return (
        <DashboardLayout>
        <div className="p-10 max-w-3xl mx-auto">

            <ProgressBar stage={currentStage} />

            <h1 className="text-2xl font-bold mb-6">Create Contract</h1>

            <div className="bg-white p-6 rounded shadow space-y-4">

                {contractSource === null && (
                    <>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full bg-amber-400 px-6 py-3 rounded-lg"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Contract'}
                        </button>

                        <div className="text-center text-gray-500">or</div>

                        <FileUpload onFileSelect={handleFileSelect} />
                    </>
                )}

                {/* 🔥 GENERATING STATE */}
                {isGenerating && (
                    <div className="border rounded h-80 flex items-center justify-center text-gray-500">
                        Generating contract...
                    </div>
                )}

                {/* 🔥 PREVIEW */}
                {!isGenerating && contractContent && (
                    <>
                        <div className="border rounded h-80 overflow-y-auto p-4">
                            {contractSource === 'upload' &&
                             uploadedFile?.type === 'application/pdf' ? (
                                <iframe
                                    src={URL.createObjectURL(uploadedFile)}
                                    className="w-full h-full border"
                                />
                            ) : (
                                <pre className="whitespace-pre-wrap text-sm">
                                    {contractContent}
                                </pre>
                            )}
                        </div>

                        <div className="flex gap-4">

                            {contractSource === 'upload' && (
                                <button
                                    onClick={handleAnalyse}
                                    disabled={isAnalyzing}
                                    className="bg-purple-500 text-white px-4 py-2 rounded"
                                >
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
                                </button>
                            )}

                            <button
                                onClick={resetAll}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Reset
                            </button>
                        </div>

                        {analysisResults && (
                            <div className="mt-6 border-t pt-6 space-y-4">
                                <h3 className="font-semibold text-lg">Risk Analysis</h3>

                                <p className="text-gray-700">
                                    {analysisResults.summary}
                                </p>

                                <div className="space-y-3">
                                    {analysisResults.risks?.map((risk: any, i: number) => (
                                        <div key={i} className="p-3 border rounded bg-gray-50">
                                            <div className="font-semibold">
                                                {risk.category} ({risk.riskLevel})
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {risk.clause}
                                            </div>
                                            <div className="text-sm mt-2">
                                                {risk.reason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <button
                onClick={() =>
                    router.push(`/dashboard/active-deals/${dealId}/view-contract`)
                }
                className="mt-6 bg-amber-400 px-6 py-2 rounded"
                disabled={!contractContent}
            >
                Proceed
            </button>

        </div>
        </DashboardLayout>
    )
}