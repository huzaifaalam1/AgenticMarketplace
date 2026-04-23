'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import DashboardLayout from '@/components/DashboardLayout'
import FileUpload from './components/FileUpload'
import RiskCard from './components/RiskCard'
import RiskSummary from './components/RiskSummary'
import ContractSummary from './components/ContractSummary'

interface Risk {
  category: string
  riskLevel: string
  clause: string
  explanation: string
}

export default function ActiveDealsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')

  const handleAnalyze = async () => {
    return
  }

  const downloadJSON = () => {
    const data = { summary, risks }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract_risks.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('Contract Executive Summary', 10, 20)

    doc.setFontSize(12)
    doc.text(summary || 'No summary available', 10, 30, {
      maxWidth: 180
    })

    let yOffset = 50

    doc.setFontSize(16)
    doc.text('Risk Details', 10, yOffset)
    yOffset += 10

    risks.forEach((risk, i) => {
      doc.setFontSize(12)
      doc.text(`${i + 1}. ${risk.category} — ${risk.riskLevel}`, 10, yOffset)
      yOffset += 6

      doc.setFontSize(10)
      doc.text(`Explanation: ${risk.explanation}`, 10, yOffset, {
        maxWidth: 180
      })
      yOffset += 12
    })

    doc.save('contract_risks.pdf')
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Contract Risk Scanner</h1>

        <FileUpload onFileSelect={setFile} />

        {file && (
          <button
            onClick={handleAnalyze}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 transform transition duration-200 font-semibold"
          >
            Analyze Contract
          </button>
        )}

        <div className="mt-4 flex gap-4">
          <button onClick={downloadJSON} className="bg-gray-800 text-white px-4 py-2 rounded-lg">
            Download JSON
          </button>
          <button onClick={downloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Download PDF
          </button>
        </div>

        {loading && (
          <p className="mt-6 animate-pulse text-gray-600">
            AI is analyzing your contract for risk exposure...
          </p>
        )}

        {(summary || risks.length > 0) && (
          <div className="mt-10 space-y-6">
            <div className="flex gap-4 mb-4">
              {['All', 'High', 'Medium', 'Low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level as any)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === level ? 'bg-black text-white' : 'bg-gray-200 text-black'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {summary && <ContractSummary summary={summary} />}

            <RiskSummary risks={risks} />

            {risks
              .filter((r) => filter === 'All' || r.riskLevel === filter)
              .map((risk, index) => (
                <RiskCard key={index} risk={risk} />
              ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}
