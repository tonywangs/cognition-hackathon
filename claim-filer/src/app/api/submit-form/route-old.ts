import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  position: string
  documentType: string
  agreementType: string
  effectiveDate: string
  expirationDate: string
  confidentialInfo: string
  additionalTerms: string
  signature: string
  agreeToTerms: boolean
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'documentType', 'effectiveDate', 'signature']
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      )
    }

    if (!formData.agreeToTerms) {
      return NextResponse.json(
        { error: 'Agreement to terms is required' },
        { status: 400 }
      )
    }

    // Path to the template PDF
    const pdfPath = path.join(process.cwd(), 'pdf', 'small_claims.pdf')
    
    // Read the existing PDF
    const existingPdfBytes = await fs.readFile(pdfPath)
    
    // Load the PDF document (ignoring encryption if present)
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    
    // Note: This PDF doesn't have fillable form fields, so we'll overlay text instead
    console.log('Overlaying text on PDF...')
    
    // Get pages from the PDF
    const pages = pdfDoc.getPages()
    const secondPage = pages[1] // Page 2 has the main form fields
    
    // Embed a font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 10
    
    // Page 2 - Fill in Plaintiff information
    const plaintiffName = `${formData.firstName} ${formData.lastName}`
    
    // Plaintiff Name (approximately after "Name:" on page 2)
    secondPage.drawText(plaintiffName, {
      x: 100,
      y: 650,
      size: fontSize,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    })
    
    // Plaintiff Phone
    if (formData.phone) {
      secondPage.drawText(formData.phone, {
        x: 420,
        y: 650,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }
    
    // Plaintiff Street Address (using company as address for now)
    if (formData.company) {
      secondPage.drawText(formData.company, {
        x: 100,
        y: 625,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }
    
    // Plaintiff Email
    if (formData.email) {
      secondPage.drawText(formData.email, {
        x: 100,
        y: 575,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }
    
    // Create a claim description from the form data
    const claimDescription = `Agreement Type: ${formData.documentType || 'Not specified'}
Effective Date: ${formData.effectiveDate || 'Not specified'}
${formData.confidentialInfo ? `Details: ${formData.confidentialInfo.substring(0, 100)}` : ''}
${formData.additionalTerms ? `Terms: ${formData.additionalTerms.substring(0, 100)}` : ''}`
    
    // Add claim description (section 3a on page 2) 
    const lines = claimDescription.split('\n').filter(line => line.trim())
    let yPosition = 200
    for (const line of lines) {
      secondPage.drawText(line.substring(0, 80), { // Limit line length
        x: 50,
        y: yPosition,
        size: 9,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      yPosition -= 15
    }
    
    // Add signature on page 4 (if provided)
    if (formData.signature && pages[3]) {
      const fourthPage = pages[3]
      
      // Signature
      fourthPage.drawText(formData.signature, {
        x: 100,
        y: 400,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
      
      // Add current date next to signature
      const currentDate = new Date().toLocaleDateString()
      fourthPage.drawText(currentDate, {
        x: 100,
        y: 420,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save()
    
    // Convert to base64 for JSON response
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
    // Return success with PDF data
    const response = {
      success: true,
      message: 'PDF generated successfully',
      data: {
        submissionId: `sub_${Date.now()}`,
        documentType: formData.documentType,
        submittedAt: new Date().toISOString(),
        participantName: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        pdfBase64: pdfBase64
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}