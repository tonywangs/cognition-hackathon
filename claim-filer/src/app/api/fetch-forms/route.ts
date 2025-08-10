import { NextRequest, NextResponse } from 'next/server'

// California Small Claims Court Forms Database
const CALIFORNIA_SMALL_CLAIMS_FORMS = {
  'SC-100': {
    name: "Plaintiff's Claim and ORDER to Go to Small Claims Court",
    description: "Form to file a small claims lawsuit",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc100.pdf",
    category: "filing"
  },
  'SC-101': {
    name: "Defendant's Claim and ORDER to Go to Small Claims Court (Small Claims)",
    description: "Form for defendant to file a counterclaim",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc101.pdf",
    category: "filing"
  },
  'SC-103': {
    name: "Request to Set Aside Default Judgment",
    description: "Request to set aside a default judgment",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc103.pdf",
    category: "post-judgment"
  },
  'SC-104': {
    name: "Request to Correct or Vacate Judgment",
    description: "Request to correct or vacate a judgment",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc104.pdf",
    category: "post-judgment"
  },
  'SC-105': {
    name: "Request to Enter Default Judgment",
    description: "Request to enter a default judgment",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc105.pdf",
    category: "judgment"
  },
  'SC-107': {
    name: "Request to Enter Judgment",
    description: "Request to enter judgment after trial",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc107.pdf",
    category: "judgment"
  },
  'SC-108': {
    name: "Request to Enter Judgment on Stipulated Agreement",
    description: "Request to enter judgment based on agreement",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc108.pdf",
    category: "judgment"
  },
  'SC-109': {
    name: "Request to Enter Judgment on Settlement Agreement",
    description: "Request to enter judgment based on settlement",
    url: "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc109.pdf",
    category: "judgment"
  }
}

// Helper function to fetch PDF from California Courts
async function fetchPDFFromCourts(formUrl: string): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  try {
    console.log(`📥 Fetching PDF from: ${formUrl}`)
    
    const response = await fetch(formUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClaimFiler/1.0)',
        'Accept': 'application/pdf'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log(`✅ Successfully fetched PDF (${buffer.length} bytes)`)
    return { success: true, data: buffer }
    
  } catch (error) {
    console.error(`❌ Error fetching PDF: ${error}`)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// GET endpoint to list available forms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const formId = searchParams.get('formId')

    // If specific form ID requested, return just that form info
    if (formId) {
      const form = CALIFORNIA_SMALL_CLAIMS_FORMS[formId as keyof typeof CALIFORNIA_SMALL_CLAIMS_FORMS]
      if (!form) {
        return NextResponse.json(
          { error: `Form ${formId} not found` },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        data: {
          formId,
          ...form
        }
      })
    }

    // Filter by category if specified
    let forms = Object.entries(CALIFORNIA_SMALL_CLAIMS_FORMS)
    if (category) {
      forms = forms.filter(([_, form]) => form.category === category)
    }

    // Return list of forms
    const formsList = forms.map(([formId, form]) => ({
      formId,
      ...form
    }))

    return NextResponse.json({
      success: true,
      data: {
        forms: formsList,
        total: formsList.length,
        categories: ['filing', 'judgment', 'post-judgment']
      }
    })

  } catch (error) {
    console.error('Error in GET /api/fetch-forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms list' },
      { status: 500 }
    )
  }
}

// POST endpoint to fetch and return a specific PDF
export async function POST(request: NextRequest) {
  try {
    const { formId, download = false } = await request.json()

    if (!formId) {
      return NextResponse.json(
        { error: 'formId is required' },
        { status: 400 }
      )
    }

    const form = CALIFORNIA_SMALL_CLAIMS_FORMS[formId as keyof typeof CALIFORNIA_SMALL_CLAIMS_FORMS]
    if (!form) {
      return NextResponse.json(
        { error: `Form ${formId} not found` },
        { status: 404 }
      )
    }

    console.log(`🎯 Fetching form: ${formId} - ${form.name}`)

    // Fetch the PDF from California Courts
    const result = await fetchPDFFromCourts(form.url)
    
    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${result.error}` },
        { status: 500 }
      )
    }

    // If download is requested, return the PDF directly
    if (download && result.data) {
      return new NextResponse(result.data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${formId}.pdf"`,
          'Content-Length': result.data.length.toString()
        }
      })
    }

    // Return PDF as base64 for JSON response
    const pdfBase64 = result.data!.toString('base64')
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${formId}`,
      data: {
        formId,
        formName: form.name,
        formDescription: form.description,
        category: form.category,
        sourceUrl: form.url,
        pdfBase64,
        fileSize: result.data!.length,
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error in POST /api/fetch-forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 