import { NextRequest, NextResponse } from 'next/server'

// =========================
// 🧠 CLEAN OUTPUT (LIGHT + SAFE)
// =========================
function cleanGeneratedContract(text: string): string {
  const matches: number[] = []

  let idx = text.indexOf('SERVICE AGREEMENT')
  while (idx !== -1) {
    matches.push(idx)
    idx = text.indexOf('SERVICE AGREEMENT', idx + 1)
  }

  if (matches.length === 0) {
    return text.trim()
  }

  // 👇 key logic
  const targetIndex =
    matches.length >= 2
      ? matches[matches.length - 2] // second last
      : matches[0]

  let contract = text.slice(targetIndex)

  // optional cleanup for trailing junk
  const badMarkers = [
    '*Word Count',
    '*Constraint',
    '*Self-Correction',
    '*Final',
    '*Wait'
  ]

  for (const marker of badMarkers) {
    const cut = contract.indexOf(marker)
    if (cut !== -1) {
      contract = contract.slice(0, cut)
    }
  }

  return contract.trim()
}

export async function POST(req: NextRequest) {
  try {
    const { buyer, supplier, terms, context } = await req.json()

    const prompt = `
Write a professional SERVICE AGREEMENT.

Output ONLY the contract.

Begin EXACTLY with:
SERVICE AGREEMENT

Do not explain.
Do not plan.
Do not describe steps.
Do not include notes.

Requirements:
- Length: 600–800 words
- Formal legal tone
- Include sections:
  SCOPE OF WORK
  DELIVERY AND TIMELINE
  SUPPLIER TERMS
  OBLIGATIONS
  TERMINATION
  LIABILITY
  DISPUTE RESOLUTION
  CONFIDENTIALITY
  GOVERNING LAW
  SIGNATURES

Constraints:
- No payment terms
- No bullet points

Parties:
Buyer: ${buyer}
Supplier: ${supplier}

Supplier Terms:
${terms || 'Standard professional service terms'}

Context:
${context || 'Active deal'}

Your response must be a finished contract, not notes or drafts.
`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${process.env.GEMINI_CONTRACT1_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            topK: 1,
            topP: 1,
            maxOutputTokens: 4096,
            stopSequences: [
              '*Constraint',
              '*Word Count',
              '*Self-Correction',
              '*Refining',
              '*Wait'
            ]
          }
        })
      }
    )

    if (!res.ok) {
      console.error('❌ Gemini failed:', res.status)
      return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
    }

    const data = await res.json()

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('\n🧠 RAW CONTRACT:\n', text)

    // =========================
    // 🔥 CLEAN OUTPUT
    // =========================
    const cleanedContract = cleanGeneratedContract(text)

    console.log('\n🧼 CLEANED CONTRACT:\n', cleanedContract)

    return NextResponse.json({
      contract: cleanedContract
    })

  } catch (err) {
    console.error('💥 ERROR:', err)

    return NextResponse.json(
      { error: 'Contract generation failed' },
      { status: 500 }
    )
  }
}