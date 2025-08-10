import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RequestData {
  claimType: string
  plaintiffName?: string
  defendantName?: string
  claimAmount?: string
}

const CLAIM_TYPE_DESCRIPTIONS = {
  'unpaid-debts': {
    title: 'Unpaid Debts or Loans',
    context: 'money lending, personal loans, roommate obligations, shared expenses'
  },
  'breach-contract': {
    title: 'Breach of Contract',
    context: 'contractor work, service agreements, written contracts, verbal agreements'
  },
  'property-damage': {
    title: 'Property Damage',
    context: 'vehicle accidents, rental property damage, personal property damage'
  },
  'security-deposit': {
    title: 'Security Deposit Disputes',
    context: 'rental deposits, tenant rights, landlord obligations, property conditions'
  },
  'unpaid-wages': {
    title: 'Unpaid Wages',
    context: 'final paychecks, overtime pay, commissions, earned compensation'
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: RequestData = await request.json()
    
    if (!data.claimType) {
      return NextResponse.json(
        { error: 'Claim type is required' },
        { status: 400 }
      )
    }

    const claimInfo = CLAIM_TYPE_DESCRIPTIONS[data.claimType as keyof typeof CLAIM_TYPE_DESCRIPTIONS]
    
    if (!claimInfo) {
      return NextResponse.json(
        { error: 'Invalid claim type' },
        { status: 400 }
      )
    }

    const plaintiff = data.plaintiffName || '[Plaintiff Name]'
    const defendant = data.defendantName || '[Defendant Name]'
    const amount = data.claimAmount || '[Amount]'

    const systemPrompt = `You are a legal assistant helping to draft small claims court documents. Generate appropriate legal language for California small claims court forms (SC-100). 

Your responses should be:
- Professional and formal legal language
- Specific to California small claims court requirements
- Clear and factual
- Appropriate for the specific claim type
- Under 500 characters per field to fit PDF form constraints

Focus on the two main questions:
1. "Why does the defendant owe you money?" - This should explain the legal basis for the claim
2. "How did you calculate the money owed?" - This should provide a clear breakdown of the calculation

Do not include court costs, filing fees, or service fees in calculations - only the actual damages/amount owed.`

    const userPrompt = `Generate legal text for a ${claimInfo.title} case with these details:
- Claim Type: ${claimInfo.title} 
- Context: ${claimInfo.context}
- Plaintiff: ${plaintiff}
- Defendant: ${defendant}
- Amount: $${amount}

Please provide:
1. claimReason: Why the defendant owes the plaintiff money (explain the legal basis)
2. calculationExplanation: How the amount was calculated (clear breakdown)

Format as JSON with "claimReason" and "calculationExplanation" fields.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent legal language
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    try {
      const parsedResponse = JSON.parse(response)
      
      if (!parsedResponse.claimReason || !parsedResponse.calculationExplanation) {
        throw new Error('Invalid response format from OpenAI')
      }

      return NextResponse.json({
        claimReason: parsedResponse.claimReason,
        calculationExplanation: parsedResponse.calculationExplanation
      })
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response)
      throw new Error('Invalid JSON response from OpenAI')
    }

  } catch (error) {
    console.error('Legal text generation error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate legal text' },
      { status: 500 }
    )
  }
}