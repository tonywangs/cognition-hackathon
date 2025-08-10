import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Request validation schema
const RequestSchema = z.object({
  claimType: z.enum([
    'unpaid-debts',
    'breach-contract', 
    'property-damage',
    'security-deposit',
    'unpaid-wages'
  ]),
  plaintiffName: z.string().optional(),
  defendantName: z.string().optional(),
  claimAmount: z.string().optional(),
  claimReason: z.string().optional(), // User's existing reason
  calculationExplanation: z.string().optional(), // User's existing calculation
  incidentDate: z.string().optional(),
  incidentStartDate: z.string().optional(),
  incidentEndDate: z.string().optional(),
})

// Response validation schema
const OpenAIResponseSchema = z.object({
  claimReason: z.string().min(10).max(1000),
  calculationExplanation: z.string().min(10).max(1000),
})

type RequestData = z.infer<typeof RequestSchema>

const CLAIM_TYPE_DESCRIPTIONS = {
  'unpaid-debts': {
    title: 'Unpaid Debts or Loans',
    context: 'money lending, personal loans, roommate obligations, shared expenses',
    examples: 'loan agreements, IOUs, shared rent/utilities, personal debts'
  },
  'breach-contract': {
    title: 'Breach of Contract',
    context: 'contractor work, service agreements, written contracts, verbal agreements',
    examples: 'unfinished construction, poor quality work, services not provided, contract violations'
  },
  'property-damage': {
    title: 'Property Damage',
    context: 'vehicle accidents, rental property damage, personal property damage',
    examples: 'car accidents, damaged belongings, property repairs, replacement costs'
  },
  'security-deposit': {
    title: 'Security Deposit Disputes',
    context: 'rental deposits, tenant rights, landlord obligations, property conditions',
    examples: 'unreturned deposits, excessive deductions, normal wear and tear disputes'
  },
  'unpaid-wages': {
    title: 'Unpaid Wages',
    context: 'final paychecks, overtime pay, commissions, earned compensation',
    examples: 'unpaid hours, missing overtime, unpaid commissions, final paycheck disputes'
  }
} as const

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const data = RequestSchema.parse(body)
    
    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    const claimInfo = CLAIM_TYPE_DESCRIPTIONS[data.claimType]
    const plaintiff = data.plaintiffName || '[Plaintiff Name]'
    const defendant = data.defendantName || '[Defendant Name]'
    const amount = data.claimAmount || '[Amount]'
    
    // Build date context if available
    let dateContext = ''
    if (data.incidentDate) {
      dateContext = `\n- Incident Date: ${data.incidentDate}`
    } else if (data.incidentStartDate && data.incidentEndDate) {
      dateContext = `\n- Period: From ${data.incidentStartDate} to ${data.incidentEndDate}`
    }

    // Check if user has already provided reasons to enhance
    const hasUserReason = data.claimReason && data.claimReason.trim().length > 0
    const hasUserCalculation = data.calculationExplanation && data.calculationExplanation.trim().length > 0

    const systemPrompt = `You are a legal assistant helping to draft small claims court documents for California. ${hasUserReason || hasUserCalculation ? 'IMPORTANT: The user has already provided their reasons. Your job is to ENHANCE and FORMALIZE their existing explanation into proper legal language while preserving their specific facts and circumstances.' : 'Generate appropriate legal language for the SC-100 form.'}

Your responses must be:
- Professional and formal legal language
- Specific to California small claims court requirements  
- Clear, factual, and concise
- Appropriate for the specific claim type
- Under 500 characters per field to fit PDF form constraints
- Based on actual monetary damages only (no court costs or fees)
${hasUserReason ? '- MUST incorporate and enhance the user\'s existing reason, not replace it' : ''}
${hasUserCalculation ? '- MUST use the user\'s calculation details and make them more formal' : ''}

You MUST respond with valid JSON containing exactly these two fields:
{
  "claimReason": "Clear legal explanation incorporating user's facts",
  "calculationExplanation": "Formal breakdown of damages based on user's information"
}`

    let userPrompt = `Generate legal text for a ${claimInfo.title} case:

Details:
- Claim Type: ${claimInfo.title} 
- Context: ${claimInfo.context}
- Plaintiff: ${plaintiff}
- Defendant: ${defendant}
- Amount Claimed: $${amount}${dateContext}`

    if (hasUserReason) {
      userPrompt += `\n\nUSER'S EXISTING REASON (enhance this into formal legal language):
"${data.claimReason}"

Take the user's reason above and:
1. Keep ALL their specific facts, dates, and circumstances
2. Transform it into professional legal terminology
3. Add relevant legal concepts for ${claimInfo.title} claims
4. Make it sound formal and court-appropriate
5. DO NOT change the core facts or add new circumstances`
    } else {
      userPrompt += `\n\nProvide a clear legal explanation of why ${defendant} owes ${plaintiff} money based on this ${claimInfo.title} claim.`
    }

    if (hasUserCalculation) {
      userPrompt += `\n\nUSER'S EXISTING CALCULATION (formalize this):
"${data.calculationExplanation}"

Take the user's calculation above and:
1. Keep their exact amounts and items
2. Format it professionally with clear itemization
3. Add proper legal terminology for damages
4. Ensure it totals to $${amount}
5. DO NOT add new items or change amounts`
    } else {
      userPrompt += `\n\nProvide a detailed breakdown showing how the $${amount} was calculated (itemize if appropriate).`
    }

    userPrompt += `\n\nRemember: Only include actual damages in calculations, not court costs or service fees.`

    console.log('Generating legal text for claim type:', data.claimType)

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
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate OpenAI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', response)
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Validate with Zod schema
    const validatedResponse = OpenAIResponseSchema.parse(parsedResponse)

    return NextResponse.json({
      success: true,
      claimReason: validatedResponse.claimReason,
      calculationExplanation: validatedResponse.calculationExplanation
    })

  } catch (error) {
    console.error('Legal text generation error:', error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Handle OpenAI errors
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', error.message)
      return NextResponse.json(
        { error: 'Failed to generate legal text. Please try again.' },
        { status: 500 }
      )
    }
    
    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}