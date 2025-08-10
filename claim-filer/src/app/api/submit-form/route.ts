import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
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

    // Path to the cleaned PDF template
    const pdfPath = path.join(process.cwd(), 'pdf', 'cleaned_sc100.pdf')
    
    // Read the cleaned PDF
    const existingPdfBytes = await fs.readFile(pdfPath)
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    
    // Get the form from the PDF
    const form = pdfDoc.getForm()
    const fields = form.getFields()
    
    console.log(`📝 Found ${fields.length} form fields in PDF`)
    
    // Log field names to help with mapping (first 20 only)
    if (fields.length > 0) {
      console.log('📋 First 20 field names:')
      fields.slice(0, 20).forEach((field, index) => {
        console.log(`  ${index + 1}. ${field.getName()} (${field.constructor.name})`)
      })
    }

    // Map our form data to PDF field names
    // Based on the field names we saw, let's try to fill the relevant fields
    
    // Try to fill plaintiff name field
    try {
      // Look for fields that might contain name information
      const nameFields = fields.filter(field => 
        field.getName().toLowerCase().includes('name') ||
        field.getName().toLowerCase().includes('plaintiff')
      )
      
      if (nameFields.length > 0) {
        console.log(`📝 Found ${nameFields.length} potential name fields`)
        nameFields.forEach(field => {
          console.log(`  Trying to fill: ${field.getName()}`)
          try {
            if (field.constructor.name === 'PDFTextField') {
              ;(field as any).setText(`${formData.firstName} ${formData.lastName}`)
              console.log(`  ✅ Successfully filled ${field.getName()}`)
            }
          } catch (e) {
            console.log(`  ⚠️ Could not fill ${field.getName()}: ${e.message}`)
          }
        })
      }
    } catch (error) {
      console.log('⚠️ Error filling name fields:', error.message)
    }

    // Try to fill email field
    try {
      const emailFields = fields.filter(field => 
        field.getName().toLowerCase().includes('email')
      )
      
      emailFields.forEach(field => {
        try {
          if (field.constructor.name === 'PDFTextField') {
            ;(field as any).setText(formData.email)
            console.log(`✅ Filled email field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill email field ${field.getName()}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('⚠️ Error filling email fields:', error.message)
    }

    // Try to fill phone field
    try {
      const phoneFields = fields.filter(field => 
        field.getName().toLowerCase().includes('phone') ||
        field.getName().toLowerCase().includes('tel')
      )
      
      phoneFields.forEach(field => {
        try {
          if (field.constructor.name === 'PDFTextField') {
            ;(field as any).setText(formData.phone || '')
            console.log(`✅ Filled phone field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill phone field ${field.getName()}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('⚠️ Error filling phone fields:', error.message)
    }

    // Try to fill address/company field
    try {
      const addressFields = fields.filter(field => 
        field.getName().toLowerCase().includes('address') ||
        field.getName().toLowerCase().includes('street') ||
        field.getName().toLowerCase().includes('company')
      )
      
      addressFields.forEach(field => {
        try {
          if (field.constructor.name === 'PDFTextField') {
            ;(field as any).setText(formData.company)
            console.log(`✅ Filled address field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill address field ${field.getName()}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('⚠️ Error filling address fields:', error.message)
    }

    // Try to fill signature field
    try {
      const signatureFields = fields.filter(field => 
        field.getName().toLowerCase().includes('signature') ||
        field.getName().toLowerCase().includes('sign')
      )
      
      signatureFields.forEach(field => {
        try {
          if (field.constructor.name === 'PDFTextField') {
            ;(field as any).setText(formData.signature)
            console.log(`✅ Filled signature field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill signature field ${field.getName()}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('⚠️ Error filling signature fields:', error.message)
    }

    // Try to fill claim description fields
    try {
      const claimFields = fields.filter(field => 
        field.getName().toLowerCase().includes('claim') ||
        field.getName().toLowerCase().includes('description') ||
        field.getName().toLowerCase().includes('why') ||
        field.getName().toLowerCase().includes('owe')
      )
      
      claimFields.forEach(field => {
        try {
          if (field.constructor.name === 'PDFTextField') {
            const claimDescription = `${formData.documentType || 'Agreement'} dispute. ${formData.confidentialInfo || ''}`
            ;(field as any).setText(claimDescription.substring(0, 200)) // Limit length
            console.log(`✅ Filled claim field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill claim field ${field.getName()}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('⚠️ Error filling claim fields:', error.message)
    }

    // Try to fill date fields
    try {
      const dateFields = fields.filter(field => 
        field.getName().toLowerCase().includes('date')
      )
      
      if (dateFields.length > 0 && formData.effectiveDate) {
        // Fill the first date field with effective date
        const field = dateFields[0]
        try {
          if (field.constructor.name === 'PDFTextField') {
            ;(field as any).setText(formData.effectiveDate)
            console.log(`✅ Filled date field: ${field.getName()}`)
          }
        } catch (e) {
          console.log(`⚠️ Could not fill date field ${field.getName()}: ${e.message}`)
        }
      }
    } catch (error) {
      console.log('⚠️ Error filling date fields:', error.message)
    }

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save()
    
    // Convert to base64 for JSON response
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    
    // Return success with PDF data
    const response = {
      success: true,
      message: 'PDF form filled successfully',
      data: {
        submissionId: `sub_${Date.now()}`,
        documentType: formData.documentType,
        submittedAt: new Date().toISOString(),
        participantName: `${formData.firstName} ${formData.lastName}`,
        company: formData.company,
        pdfBase64: pdfBase64,
        fieldsFilled: 'Attempted to fill name, email, phone, address, signature, claim description, and date fields'
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