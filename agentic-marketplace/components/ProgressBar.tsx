'use client'

export default function ProgressBar({ stage }: { stage: number }) {
    const steps = ['Make', 'View', 'Process', 'AI', 'Disputes']

    return (
        <div className="mb-8">
            <div className="flex justify-between">
                {steps.map((s, i) => (
                <div key={i} className="text-center flex-1">
                    <div className={`w-8 h-8 mx-auto rounded-full ${
                    stage > i ? 'bg-amber-400' : 'bg-gray-300'
                    }`} />
                    <div className="text-xs mt-2">{s}</div>
                </div>
                ))}
            </div>
        </div>
    )
}