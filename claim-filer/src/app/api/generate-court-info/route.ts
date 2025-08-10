import { NextRequest, NextResponse } from 'next/server'

interface RequestData {
  streetAddress: string
  city: string
  state: string
  zip: string
}

export async function POST(request: NextRequest) {
  try {
    const { streetAddress, city, state, zip }: RequestData = await request.json()

    if (!streetAddress || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'Missing required address information' },
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
            content: `You are a California court jurisdiction expert. Based on an address, determine the correct Superior Court county and provide the main courthouse address for small claims filings.

Always respond with a JSON object in this exact format:
{
  "courtName": "County Name",
  "courtAddress": "Full courthouse address"
}

Rules:
- For courtName, provide only the county name (e.g., "Los Angeles", "San Francisco", "Orange")
- For courtAddress, provide the main courthouse address for small claims court in that county
- Use real, accurate courthouse addresses
- If the location is unclear, use the most likely court based on the ZIP code`
          },
          {
            role: 'user',
            content: `Determine the correct California Superior Court for this address:
Street: ${streetAddress}
City: ${city}  
State: ${state}
ZIP: ${zip}

Provide the county name and main courthouse address for small claims filings.`
          }
        ],
        temperature: 0.1,
        max_tokens: 200
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

    let courtInfo
    try {
      courtInfo = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Invalid response format from OpenAI')
    }

    if (!courtInfo.courtName || !courtInfo.courtAddress) {
      throw new Error('Incomplete court information from OpenAI')
    }

    return NextResponse.json(courtInfo, { status: 200 })

  } catch (error) {
    console.error('Court info generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate court information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}