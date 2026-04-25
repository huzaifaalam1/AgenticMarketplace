'use client'

import { useState } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'
import FileUpload from '../../components/FileUpload'

export default function ViewContract() {
    const router = useRouter()
    const { dealId } = useParams()
    const pathname = usePathname()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [contractContent, setContractContent] = useState<string>('')
    const [contractSource, setContractSource] = useState<'upload' | 'generate' | null>(null)
    const [analysisResults, setAnalysisResults] = useState<any>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    const handleFileSelect = (file: File) => {
        setUploadedFile(file)
        setContractSource('upload')
        // For now, show a mock contract content
        const mockContract = `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString()}.

1. SERVICES
The Service Provider agrees to provide the following services:
- Software development and maintenance
- Technical support and consultation
- Project management and delivery

2. COMPENSATION
The Client agrees to pay the Service Provider:
- Fixed fee: $10,000
- Payment schedule: 50% upfront, 50% upon completion
- Payment method: Bank transfer

3. TIMELINE
Project commencement: ${new Date().toLocaleDateString()}
Estimated completion: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}

4. TERMS AND CONDITIONS
- All work delivered becomes client property upon full payment
- Confidentiality clause applies for 5 years
- Dispute resolution through arbitration

This Agreement constitutes the entire understanding between the parties.
        `.trim()
        setContractContent(mockContract)
    }

    const handleDownload = () => {
        if (uploadedFile) {
            const url = URL.createObjectURL(uploadedFile)
            const a = document.createElement('a')
            a.href = url
            a.download = uploadedFile.name
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    const handleGenerate = () => {
        setContractSource('generate')
        setUploadedFile(null)
        // Generate a sample contract
        const generatedContract = `
SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement ("Agreement") is made and entered into on ${new Date().toLocaleDateString()}.

PARTIES
- Client: [Client Name]
- Developer: [Developer Name]

1. PROJECT SCOPE
The Developer agrees to develop a custom software application with the following features:
- User authentication system
- Database management
- API integration
- Responsive web interface
- Admin dashboard

2. DELIVERABLES
- Source code repository access
- Deployable application
- Technical documentation
- User manual
- Testing reports

3. COMPENSATION
Total project value: $25,000
Payment milestones:
- 30% upon contract signing ($7,500)
- 40% upon beta delivery ($10,000)
- 30% upon final delivery ($7,500)

4. TIMELINE
Development start: ${new Date().toLocaleDateString()}
Beta delivery: ${new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Final delivery: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}

5. WARRANTIES AND SUPPORT
- 6-month warranty period from final delivery
- Bug fixes and minor modifications included
- 24/7 critical issue support
- Monthly maintenance updates

6. INTELLECTUAL PROPERTY
All code, designs, and intellectual property become client property upon final payment.

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all project information for 5 years.

This Agreement is governed by the laws of [Jurisdiction].
        `.trim()
        setContractContent(generatedContract)
    }

    const handleAnalyse = async () => {
        if (!uploadedFile) return

        setIsAnalyzing(true)
        try {
            const formData = new FormData()
            formData.append('file', uploadedFile)

            const response = await fetch('/api/analyze-contract', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Analysis failed')
            }

            const results = await response.json()
            setAnalysisResults(results)
        } catch (error) {
            console.error('Analysis error:', error)
            const errorData = await (error as any).response?.json()
            const errorMessage = errorData?.details || 'Contract analysis failed. Please try again.'
            alert(errorMessage)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <DashboardLayout>
        <div className="p-10 max-w-3xl mx-auto">

            <ProgressBar stage={currentStage} />

            <h1 className="text-2xl font-bold mb-6">Upload Contract</h1>

            <div className="bg-white p-6 rounded shadow">
                {!contractContent ? (
                    <div className="space-y-4">
                        <FileUpload onFileSelect={handleFileSelect} />
                        
                        <div className="text-center">
                            <span className="text-gray-500">or</span>
                        </div>
                        
                        <button
                            onClick={handleGenerate}
                            className="w-full bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            Generate Contract
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {uploadedFile && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-medium">
                                    ✅ File uploaded: {uploadedFile.name}
                                </p>
                                <p className="text-green-600 text-sm">
                                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        )}

                        {contractSource === 'generate' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-800 font-medium">
                                    📝 Contract generated successfully
                                </p>
                            </div>
                        )}

                        <div className="border border-gray-200 rounded-lg">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-700">Contract Preview</h3>
                            </div>
                            <div className="h-96 overflow-y-auto p-4">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                    {contractContent}
                                </pre>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {uploadedFile && (
                                <button
                                    onClick={handleDownload}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Download Contract
                                </button>
                            )}
                            
                            <button
                                onClick={handleAnalyse}
                                disabled={isAnalyzing || !uploadedFile}
                                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyse Contract'}
                            </button>

                            <button
                                onClick={() => {
                                    setUploadedFile(null)
                                    setContractContent('')
                                    setContractSource(null)
                                    setAnalysisResults(null)
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Start Over
                            </button>
                        </div>

                        {analysisResults && (
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Risk Analysis Results</h3>
                                
                                {analysisResults.summary && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-blue-800">{analysisResults.summary}</p>
                                    </div>
                                )}

                                {analysisResults.risks && analysisResults.risks.length > 0 ? (
                                    <div className="space-y-3">
                                        {analysisResults.risks.map((risk: any, index: number) => (
                                            <div 
                                                key={index} 
                                                className={`border rounded-lg p-4 ${
                                                    risk.riskLevel === 'High' ? 'border-red-200 bg-red-50' :
                                                    risk.riskLevel === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                                                    'border-green-200 bg-green-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-medium ${
                                                        risk.riskLevel === 'High' ? 'text-red-800' :
                                                        risk.riskLevel === 'Medium' ? 'text-yellow-800' :
                                                        'text-green-800'
                                                    }`}>
                                                        {risk.category}
                                                    </span>
                                                    <span className={`text-sm px-2 py-1 rounded ${
                                                        risk.riskLevel === 'High' ? 'bg-red-200 text-red-800' :
                                                        risk.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                        'bg-green-200 text-green-800'
                                                    }`}>
                                                        {risk.riskLevel} Risk
                                                    </span>
                                                </div>
                                                
                                                {risk.clause && (
                                                    <div className="mb-2">
                                                        <p className="text-sm text-gray-600 mb-1">Clause:</p>
                                                        <p className="text-sm italic bg-white p-2 rounded border">
                                                            {risk.clause}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Risk Explanation:</p>
                                                    <p className="text-sm text-gray-700">{risk.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800">No significant risks detected in this contract.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => router.push(`/dashboard/active-deals/${dealId}/view-contract`)}
                className="mt-6 bg-amber-400 hover:bg-amber-500 px-6 py-2 rounded-lg transition-colors"
                disabled={!contractContent}
            >
                Proceed to Processing
            </button>

        </div>
        </DashboardLayout>
    )
}