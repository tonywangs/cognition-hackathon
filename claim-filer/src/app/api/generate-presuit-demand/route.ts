import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

// Request validation schema
const RequestSchema = z.object({
  claimType: z.string(),
  claimReason: z.string(),
  defendantName: z.string().optional(),
  claimAmount: z.string().optional(),
})

// Response validation schema
const OpenAIResponseSchema = z.object({
  whyNotAsked: z.string().min(10).max(500),
})

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

    const defendant = data.defendantName || 'the defendant'
    const amount = data.claimAmount || 'the amount owed'

    const systemPrompt = `You are a legal assistant helping with California small claims court filings. Generate a legally valid explanation for why a plaintiff did not ask for payment before filing suit.

The explanation must be:
- Legally acceptable under California small claims court rules
- Professional and formal
- Specific to the claim circumstances
- Under 300 characters to fit form constraints
- One of these valid legal reasons:
  1. Defendant cannot be located/contacted
  2. Demand would be futile (defendant already refused)
  3. Emergency circumstances requiring immediate court action
  4. Defendant is avoiding service or contact
  5. Written demand was sent but ignored
  6. Property damage/injury requiring immediate legal documentation

You MUST respond with valid JSON containing exactly this field:
{
  "whyNotAsked": "Clear legal explanation for not making pre-suit demand"
}`

    const userPrompt = `Generate a legally acceptable explanation for why the plaintiff did not ask ${defendant} for payment before filing this ${data.claimType} claim.

Claim details:
- Type: ${data.claimType}
- Reason: ${data.claimReason}
- Amount: $${amount}

Provide a brief, legally valid explanation that would be acceptable to the court for proceeding without a pre-suit demand. Focus on practical reasons like inability to contact, previous refusal, or urgency.`

    console.log('Generating pre-suit demand explanation for claim type:', data.claimType)

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
      max_tokens: 300,
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
      whyNotAsked: validatedResponse.whyNotAsked
    })

  } catch (error) {
    console.error('Pre-suit demand generation error:', error)
    
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
        { error: 'Failed to generate explanation. Please try again.' },
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