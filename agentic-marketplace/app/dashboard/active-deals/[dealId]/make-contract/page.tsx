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

    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    // =========================
    // FETCH DEAL FROM DB
    // =========================
    useEffect(() => {
        async function loadDeal() {
            if (!dealId) return

            const { data, error } = await supabase
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

            if (error) {
                console.error('Deal fetch error:', error)
                return
            }

            let buyer = data?.buyer_org?.name || data?.buyer_user?.full_name || 'Buyer'
            let supplier = data?.supplier_org?.name || data?.supplier_user?.full_name || 'Supplier'

            setBuyerName(buyer)
            setSupplierName(supplier)
        }

        loadDeal()
    }, [dealId])

    // =========================
    // FILE UPLOAD
    // =========================
    const handleFileSelect = async (file: File) => {
        setUploadedFile(file)

        if (file.type === 'application/pdf') {
            setContractContent('PDF uploaded — preview below')
        } else {
            const text = await file.text()
            setContractContent(text)
        }
    }

    // =========================
    // GENERATE CONTRACT
    // =========================
    const handleGenerate = async () => {
        setIsGenerating(true)
        setUploadedFile(null)

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

            if (!res.ok) {
                throw new Error(data.error)
            }

            setContractContent(data.contract)

        } catch (err) {
            console.error(err)
            alert('Failed to generate contract')
        } finally {
            setIsGenerating(false)
        }
    }

    // =========================
    // ANALYZE (ONLY UPLOAD)
    // =========================
    const handleAnalyse = async () => {
        if (!uploadedFile) {
            alert('Only uploaded contracts can be analyzed')
            return
        }

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

    return (
        <DashboardLayout>
        <div className="p-10 max-w-3xl mx-auto">

            <ProgressBar stage={currentStage} />

            <h1 className="text-2xl font-bold mb-6">Create Contract</h1>

            <div className="bg-white p-6 rounded shadow space-y-4">

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-amber-400 px-6 py-3 rounded-lg"
                >
                    {isGenerating ? 'Generating...' : 'Generate Contract'}
                </button>

                {!contractContent && (
                    <>
                        <div className="text-center text-gray-500">or</div>
                        <FileUpload onFileSelect={handleFileSelect} />
                    </>
                )}

                {contractContent && (
                    <>
                        <div className="border rounded h-80 overflow-y-auto p-4">
                            <pre className="whitespace-pre-wrap text-sm">
                                {contractContent}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            {uploadedFile && (
                                <button
                                    onClick={handleAnalyse}
                                    className="bg-purple-500 text-white px-4 py-2 rounded"
                                >
                                    Analyze Contract
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setContractContent('')
                                    setUploadedFile(null)
                                    setAnalysisResults(null)
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Reset
                            </button>
                        </div>

                        {analysisResults && (
                            <div className="mt-6 border-t pt-6">
                                <h3 className="font-semibold mb-4">Risk Analysis</h3>
                                <p>{analysisResults.summary}</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <button
                onClick={() => router.push(`/dashboard/active-deals/${dealId}/view-contract`)}
                className="mt-6 bg-amber-400 px-6 py-2 rounded"
                disabled={!contractContent}
            >
                Proceed
            </button>

        </div>
        </DashboardLayout>
    )
}