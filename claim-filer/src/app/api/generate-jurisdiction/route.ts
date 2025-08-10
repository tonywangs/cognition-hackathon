import { NextRequest, NextResponse } from 'next/server'

interface RequestData {
  claimType: string
  claimReason: string
  claimAmount: string
  plaintiffCity: string
  plaintiffState: string
  plaintiffZip: string
  defendantCity: string
  defendantState: string
  defendantZip: string
  defendantName: string
}

export async function POST(request: NextRequest) {
  try {
    const { 
      claimType, 
      claimReason, 
      claimAmount,
      plaintiffCity,
      plaintiffState, 
      plaintiffZip,
      defendantCity,
      defendantState,
      defendantZip,
      defendantName
    }: RequestData = await request.json()

    if (!claimType || !claimReason) {
      return NextResponse.json(
        { error: 'Missing required claim information' },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a California small claims court jurisdiction expert. Based on claim details and party locations, determine the appropriate jurisdiction reason and relevant zip code.

Always respond with a JSON object in this exact format:
{
  "jurisdictionReason": "one of the valid options",
  "jurisdictionZip": "relevant zip code"
}

Valid jurisdiction reason options:
- "defendant-lives": Defendant lives or does business
- "property-damaged": Plaintiff's property was damaged  
- "plaintiff-injured": Plaintiff was injured
- "contract-location": Contract was made, signed, performed, or broken
- "buyer-contract": Buyer/lessee signed contract or lives (personal/family goods)
- "retail-installment": Buyer signed retail installment contract
- "vehicle-finance": Vehicle finance sale location
- "other": Other

Rules for determining jurisdiction:
1. Default to where defendant lives/does business if no specific incident location
2. For property damage claims, use where the property was damaged
3. For contract disputes, use where contract was made, signed, or performed
4. For injury claims, use where plaintiff was injured
5. Consider the claim type and description to determine the most appropriate reason

For zip code:
- Use the zip code of the location that matches the jurisdiction reason
- If defendant location is chosen, use defendant's zip
- If plaintiff location is chosen, use plaintiff's zip  
- If incident location mentioned in claim description, try to determine that zip`
          },
          {
            role: 'user',
            content: `Determine jurisdiction for this California small claims case:

Claim Type: ${claimType}
Claim Description: ${claimReason}
Claim Amount: $${claimAmount}

Plaintiff Location: ${plaintiffCity}, ${plaintiffState} ${plaintiffZip}
Defendant: ${defendantName}
Defendant Location: ${defendantCity}, ${defendantState} ${defendantZip}

Based on this information, determine:
1. The most appropriate jurisdiction reason from the valid options
2. The relevant zip code for that jurisdiction reason`
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiResult = await openaiResponse.json()
    const content = openaiResult.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    let jurisdictionInfo
    try {
      jurisdictionInfo = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid response format from OpenAI')
    }

    if (!jurisdictionInfo.jurisdictionReason || !jurisdictionInfo.jurisdictionZip) {
      throw new Error('Incomplete jurisdiction information from OpenAI')
    }

    return NextResponse.json(jurisdictionInfo, { status: 200 })

  } catch (error) {
    console.error('Jurisdiction generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate jurisdiction information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}