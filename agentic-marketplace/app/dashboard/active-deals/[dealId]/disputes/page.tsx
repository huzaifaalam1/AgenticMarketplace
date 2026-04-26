'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import DashboardLayout from '@/components/DashboardLayout'
import ProgressBar from '@/components/ProgressBar'

export default function DisputesPage() {
    const { dealId } = useParams()
    const pathname = usePathname()
    const router = useRouter()

    const step = pathname.split('/').pop() ?? ''

    const stageMap: Record<string, number> = {
        'make-contract': 1,
        'view-contract': 2,
        'process': 3,
        'ai-summary': 4,
        'disputes': 5
    }

    const currentStage = stageMap[step] ?? 1

    const [timeRemaining, setTimeRemaining] = useState<number>(24 * 60 * 60) // 24 hours in seconds
    const TIMER_STORAGE_KEY = `dispute-timer-${dealId}`
    const [showDisputeQuestion, setShowDisputeQuestion] = useState(true)
    const [showIssuesForm, setShowIssuesForm] = useState(false)
    const [showValidationResult, setShowValidationResult] = useState(false)
    const [issues, setIssues] = useState('')
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<any>(null)
    const [organization, setOrganization] = useState<any>(null)
    const [validationResult, setValidationResult] = useState<any>(null)

    useEffect(() => {
        const loadUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle()

            if (profileData) {
                setProfile(profileData)

                if (profileData.account_type === 'organization') {
                    const { data: membership } = await supabase
                        .from('organization_members')
                        .select('organization_id')
                        .eq('user_id', profileData.id)
                        .maybeSingle()

                    if (membership?.organization_id) {
                        const { data: org } = await supabase
                            .from('organizations')
                            .select('*')
                            .eq('id', membership.organization_id)
                            .single()

                        setOrganization(org)
                    }
                }
            }
        }

        loadUserData()
    }, [])

    useEffect(() => {
        // Check if timer end time is stored in localStorage
        const storedEndTime = localStorage.getItem(TIMER_STORAGE_KEY)
        const now = Date.now()

        if (storedEndTime) {
            const endTime = parseInt(storedEndTime, 10)
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
            setTimeRemaining(remaining)
        } else {
            // First time: set end time to 24 hours from now
            const endTime = now + (24 * 60 * 60 * 1000)
            localStorage.setItem(TIMER_STORAGE_KEY, endTime.toString())
            setTimeRemaining(24 * 60 * 60)
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    localStorage.removeItem(TIMER_STORAGE_KEY)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [TIMER_STORAGE_KEY])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleNoDispute = async () => {
        setLoading(true)
        
        try {
            // Update deal status to completed
            await supabase
                .from('deals')
                .update({ status: 'completed' })
                .eq('id', dealId)

            if (profile?.account_type === 'individual') {
                await supabase
                    .from('profiles')
                    .update({ deals_completed: (profile.deals_completed || 0) + 1 })
                    .eq('id', profile.id)
            } else if (organization) {
                await supabase
                    .from('organizations')
                    .update({ deals_completed: (organization.deals_completed || 0) + 1 })
                    .eq('id', organization.id)
            }
            
            router.push('/dashboard')
        } catch (error) {
            console.error('Error updating deals completed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleYesDispute = () => {
        setShowDisputeQuestion(false)
        setShowIssuesForm(true)
    }

    const handleIssuesSubmit = async () => {
        if (!issues.trim()) return

        setLoading(true)

        try {
            // Fetch contract data from Supabase
            const { data: contractData, error: contractError } = await supabase
                .from('contracts')
                .select('*')
                .eq('deal_id', dealId)
                .maybeSingle()

            if (contractError || !contractData) {
                console.error('Error fetching contract:', contractError)
                setLoading(false)
                return
            }

            // Fetch timeline events from Supabase
            const { data: eventsData, error: eventsError } = await supabase
                .from('deal_events')
                .select('*')
                .eq('deal_id', dealId)
                .in('type', ['text', 'image'])
                .order('created_at', { ascending: true })

            if (eventsError) {
                console.error('Error fetching events:', eventsError)
                setLoading(false)
                return
            }

            // Prepare contract object for AI
            const contract = {
                text: contractData.contract_text,
                summary: contractData.summary,
                risks: contractData.risks,
                file_url: contractData.file_url
            }

            // Prepare events for AI
            const events = eventsData?.map((event: any) => ({
                role: event.role,
                type: event.type,
                content: event.content,
                created_at: event.created_at
            })) || []

            // Call validation API
            const res = await fetch('/api/ai/validate-dispute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contract,
                    events,
                    dispute: issues
                })
            })

            const data = await res.json()
            console.log('VALIDATION RESPONSE:', data)

            if (data.error) {
                console.error('API ERROR:', data.error)
                setLoading(false)
                return
            }

            // Save the dispute issue to deal_events
            await supabase
                .from('deal_events')
                .insert({
                    deal_id: dealId,
                    role: profile?.account_type === 'individual' ? 'buyer' : 'supplier',
                    type: 'text',
                    content: issues
                })

            setValidationResult(data)
            setShowIssuesForm(false)
            setShowValidationResult(true)
            setLoading(false)
        } catch (error) {
            console.error('Error submitting dispute:', error)
            setLoading(false)
        }
    }

    const handleValidationComplete = async () => {
        setLoading(true)

        try {
            // Update deal status to completed
            await supabase
                .from('deals')
                .update({ status: 'completed' })
                .eq('id', dealId)

            // Increment disputes count
            if (profile?.account_type === 'individual') {
                await supabase
                    .from('profiles')
                    .update({ disputes_count: (profile.disputes_count || 0) + 1 })
                    .eq('id', profile.id)
            } else if (organization) {
                await supabase
                    .from('organizations')
                    .update({ disputes_count: (organization.disputes_count || 0) + 1 })
                    .eq('id', organization.id)
            }

            router.push('/dashboard')
        } catch (error) {
            console.error('Error updating disputes count:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout>
        <div className="p-10 max-w-3xl mx-auto">

            <ProgressBar stage={currentStage} />

            <h1 className="text-2xl font-bold mb-6">Dispute Resolution</h1>

            {/* Timer */}
            <div className="bg-amber-100 p-6 rounded-xl shadow mb-6">
                <h2 className="font-semibold mb-2">Time Remaining</h2>
                <p className="text-3xl font-bold text-amber-600">
                    {formatTime(timeRemaining)}
                </p>
            </div>

            {/* Dispute Question */}
            {showDisputeQuestion && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Do you have any disputes with this deal?</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={handleNoDispute}
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            No, No Disputes
                        </button>
                        <button
                            onClick={handleYesDispute}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            Yes, I Have Disputes
                        </button>
                    </div>
                </div>
            )}

            {/* Issues Form */}
            {showIssuesForm && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Please describe your issues</h2>
                    <textarea
                        value={issues}
                        onChange={(e) => setIssues(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg mb-4 h-40 resize-none"
                        placeholder="Describe the issues you have with this deal..."
                    />
                    <button
                        onClick={handleIssuesSubmit}
                        disabled={loading || !issues.trim()}
                        className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Validating Dispute...' : 'Submit Dispute'}
                    </button>
                </div>
            )}

            {/* Validation Result */}
            {showValidationResult && validationResult && (
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Dispute Validation Result</h2>
                    
                    <div className={`p-4 rounded-lg mb-4 ${validationResult.is_valid ? 'bg-green-100' : 'bg-red-100'}`}>
                        <h3 className="font-semibold mb-2">
                            Dispute is {validationResult.is_valid ? 'VALID' : 'INVALID'}
                        </h3>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Reasoning</h3>
                        <p className="text-gray-700">{validationResult.reasoning}</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Recommendation</h3>
                        <p className="text-gray-700">{validationResult.recommendation}</p>
                    </div>

                    <button
                        onClick={handleValidationComplete}
                        disabled={loading}
                        className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Continue to Dashboard'}
                    </button>
                </div>
            )}

        </div>
        </DashboardLayout>
    )
}