import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs/promises'
import path from 'path'

interface FormData {
  // Court Information
  courtName: string
  courtAddress: string
  caseNumber: string
  caseName: string
  
  // Plaintiff Information
  plaintiffName: string
  plaintiffPhone: string
  plaintiffStreetAddress: string
  plaintiffCity: string
  plaintiffState: string
  plaintiffZip: string
  plaintiffMailingAddress: string
  plaintiffMailingCity: string
  plaintiffMailingState: string
  plaintiffMailingZip: string
  plaintiffEmail: string
  
  // Additional Plaintiff
  hasSecondPlaintiff: boolean
  secondPlaintiffName: string
  secondPlaintiffPhone: string
  secondPlaintiffStreetAddress: string
  secondPlaintiffCity: string
  secondPlaintiffState: string
  secondPlaintiffZip: string
  secondPlaintiffMailingAddress: string
  secondPlaintiffMailingCity: string
  secondPlaintiffMailingState: string
  secondPlaintiffMailingZip: string
  secondPlaintiffEmail: string
  
  // Additional Plaintiff Options
  moreThanTwoPlaintiffs: boolean
  fictitiousName: boolean
  paydayLender: boolean
  
  // Defendant Information
  defendantName: string
  defendantPhone: string
  defendantStreetAddress: string
  defendantCity: string
  defendantState: string
  defendantZip: string
  defendantMailingAddress: string
  defendantMailingCity: string
  defendantMailingState: string
  defendantMailingZip: string
  
  // Service Information
  servicePersonName: string
  servicePersonTitle: string
  servicePersonAddress: string
  servicePersonCity: string
  servicePersonState: string
  servicePersonZip: string
  
  // Additional Defendant Options
  moreThanOneDefendant: boolean
  activeMilitaryDuty: boolean
  militaryDefendantName: string
  needMoreSpace: boolean
  
  // Claim Information
  claimAmount: string
  claimReason: string
  incidentDate: string
  incidentStartDate: string
  incidentEndDate: string
  calculationExplanation: string
  
  // Pre-suit Demand
  askedForPayment: boolean
  whyNotAsked: string
  
  // Jurisdiction
  jurisdictionReason: string
  jurisdictionZip: string
  jurisdictionLocation1: string
  jurisdictionLocation2: string
  
  // Special Cases
  attorneyClientDispute: boolean
  arbitrationFiled: boolean
  suingPublicEntity: boolean
  publicEntityClaimDate: string
  
  // Filing Limits
  moreThan12Claims: boolean
  claimOver2500: boolean
  
  // Agreement
  understandsNoAppeal: boolean
  agreeToTerms: boolean
  
  // Signature Information
  signatureDate: string
  secondSignatureDate: string
}

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()

    // Validate required fields (basic ones for now)
    const requiredFields = ['plaintiffName', 'plaintiffStreetAddress', 'defendantName', 'claimAmount', 'claimReason']
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

    // Generate AI content for "why didn't ask defendant to pay" field
    const generateWhyNotAskedExplanation = (claimReason: string, calculationExplanation: string): string => {
      // Create a legal explanation based on the claim details
      const prompt = `
        <claim_context>
        <claim_reason>${claimReason}</claim_reason>
        <calculation_method>${calculationExplanation}</calculation_method>
        </claim_context>

        <legal_precedent>
        In California small claims court, plaintiffs are generally required to make a demand for payment 
        before filing suit. However, there are several legally recognized exceptions where such demand 
        is not required or would be futile, including:
        - When the defendant has already clearly refused payment or indicated they will not pay
        - When the relationship has completely broken down and communication is impossible
        - When the defendant has disappeared or cannot be contacted
        - When making a demand would be futile based on the defendant's prior conduct
        - When the claim involves property damage where the defendant was clearly at fault
        </legal_precedent>

        <instruction>
        Based on the claim details provided and legal precedent, generate a brief (2-3 sentence) explanation 
        for why the plaintiff did not ask the defendant to pay before filing this lawsuit. 
        The explanation should be professional, legally sound, and specific to the claim circumstances.
        Focus on why a pre-suit demand would have been inappropriate or futile in this specific case.
        </instruction>
      `

      // For now, we'll create a simple template-based response
      // In a real implementation, this would call an AI service
      if (claimReason.toLowerCase().includes('damage') || claimReason.toLowerCase().includes('property')) {
        return "The defendant's liability for the damages was clear and unambiguous, making a pre-suit demand unnecessary. Given the defendant's conduct and the nature of the claim, any attempt to request payment would have been futile."
      } else if (claimReason.toLowerCase().includes('service') || claimReason.toLowerCase().includes('work')) {
        return "The defendant had already demonstrated unwillingness to pay for services rendered through their conduct and communications. A formal demand would have been futile given their clear position on the matter."
      } else if (claimReason.toLowerCase().includes('breach') || claimReason.toLowerCase().includes('contract')) {
        return "The defendant materially breached the agreement and their subsequent conduct made it clear they would not honor their obligations. Making a demand for payment would have been an exercise in futility."
      } else {
        return "Based on the defendant's conduct and the circumstances of this dispute, it was clear that a pre-suit demand for payment would have been futile and would not have resulted in voluntary payment."
      }
    }

    // Auto-generate the "why not asked" explanation if the user said they didn't ask for payment
    const autoGeneratedWhyNotAsked = !formData.askedForPayment ? 
      generateWhyNotAskedExplanation(formData.claimReason, formData.calculationExplanation) : 
      formData.whyNotAsked

    // PRECISE FIELD MAPPING - Using exact field names instead of fuzzy matching
    console.log(`\n🎯 PRECISE FIELD MAPPING STRATEGY:`)
    
    // Create a map of exact field names to data
    const fieldMappings = new Map([
      // Court Information
      ['SC-100[0].Page1[0].CaptionRight[0].County[0].CourtInfo_ft[0]', formData.courtName],
      ['SC-100[0].Page1[0].CaptionRight[0].CN[0].CaseNumber_ft[0]', formData.caseNumber],
      ['SC-100[0].Page1[0].CaptionRight[0].CN[0].CaseName_ft[0]', formData.caseName],
      
      // Plaintiff Information - Page 2 Caption
      ['SC-100[0].Page2[0].PxCaption[0].Plaintiff[0]', formData.plaintiffName],
      ['SC-100[0].Page2[0].PxCaption[0].CaseNumber_ft[0]', formData.caseNumber],
      
      // Plaintiff Information - Primary Fields
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffName1[0]', formData.plaintiffName],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffPhone1[0]', formData.plaintiffPhone],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffAddress1[0]', formData.plaintiffStreetAddress],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffCity1[0]', formData.plaintiffCity],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffState1[0]', formData.plaintiffState],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffZip1[0]', formData.plaintiffZip],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingAddress1[0]', formData.plaintiffMailingAddress || formData.plaintiffStreetAddress],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingCity1[0]', formData.plaintiffMailingCity || formData.plaintiffCity],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingState1[0]', formData.plaintiffMailingState || formData.plaintiffState],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingZip1[0]', formData.plaintiffMailingZip || formData.plaintiffZip],
      ['SC-100[0].Page2[0].List1[0].Item1[0].EmailAdd1[0]', formData.plaintiffEmail],
      
      // Second Plaintiff (if exists)
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffName2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffName : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffPhone2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffPhone : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffAddress2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffStreetAddress : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffCity2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffCity : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffState2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffState : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffZip2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffZip : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingAddress2[0]', formData.hasSecondPlaintiff ? (formData.secondPlaintiffMailingAddress || formData.secondPlaintiffStreetAddress) : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingCity2[0]', formData.hasSecondPlaintiff ? (formData.secondPlaintiffMailingCity || formData.secondPlaintiffCity) : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingState2[0]', formData.hasSecondPlaintiff ? (formData.secondPlaintiffMailingState || formData.secondPlaintiffState) : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].PlaintiffMailingZip2[0]', formData.hasSecondPlaintiff ? (formData.secondPlaintiffMailingZip || formData.secondPlaintiffZip) : ''],
      ['SC-100[0].Page2[0].List1[0].Item1[0].EmailAdd2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffEmail : ''],
      
      // Defendant Information
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantName1[0]', formData.defendantName],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantPhone1[0]', formData.defendantPhone],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantAddress1[0]', formData.defendantStreetAddress],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantCity1[0]', formData.defendantCity],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantState1[0]', formData.defendantState],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantZip1[0]', formData.defendantZip],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantMailingAddress1[0]', formData.defendantMailingAddress || formData.defendantStreetAddress],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantMailingCity1[0]', formData.defendantMailingCity || formData.defendantCity],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantMailingState1[0]', formData.defendantMailingState || formData.defendantState],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantMailingZip1[0]', formData.defendantMailingZip || formData.defendantZip],
      
      // Service Person Information
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantName2[0]', formData.servicePersonName],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantJob1[0]', formData.servicePersonTitle],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantAddress2[0]', formData.servicePersonAddress],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantCity2[0]', formData.servicePersonCity],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantState2[0]', formData.servicePersonState],
      ['SC-100[0].Page2[0].List2[0].item2[0].DefendantZip2[0]', formData.servicePersonZip],
      
      // Military Defendant (if applicable)
      ['SC-100[0].Page2[0].List2[0].item2[0].FillField1[0]', formData.activeMilitaryDuty ? formData.militaryDefendantName : ''],
      
      // Claim Information
      ['SC-100[0].Page2[0].List3[0].PlaintiffClaimAmount1[0]', formData.claimAmount],
      ['SC-100[0].Page2[0].List3[0].Lia[0].FillField2[0]', formData.claimReason],
      
      // Page 3 Caption
      ['SC-100[0].Page3[0].PxCaption[0].Plaintiff[0]', formData.plaintiffName],
      ['SC-100[0].Page3[0].PxCaption[0].CaseNumber_ft[0]', formData.caseNumber],
      
      // Incident Dates
      ['SC-100[0].Page3[0].List3[0].Lib[0].Date1[0]', formData.incidentDate],
      ['SC-100[0].Page3[0].List3[0].Lib[0].Date2[0]', formData.incidentStartDate],
      ['SC-100[0].Page3[0].List3[0].Lib[0].Date3[0]', formData.incidentEndDate],
      
      // Calculation Explanation
      ['SC-100[0].Page3[0].List3[0].Lic[0].FillField1[0]', formData.calculationExplanation],
      
      // Pre-suit demand explanation (if didn't ask for payment)
      ['SC-100[0].Page3[0].List4[0].Item4[0].FillField2[0]', !formData.askedForPayment ? autoGeneratedWhyNotAsked : ''],
      
      // Jurisdiction zip code
      ['SC-100[0].Page3[0].List6[0].item6[0].ZipCode1[0]', formData.jurisdictionZip],
      
      // Additional jurisdiction location details
      ['SC-100[0].Page3[0].List5[0].Lie[0].FillField55[0]', formData.jurisdictionLocation1],
      ['SC-100[0].Page3[0].List5[0].Lie[0].FillField56[0]', formData.jurisdictionLocation2],
      
      // Public entity claim date (if applicable)
      ['SC-100[0].Page3[0].List8[0].item8[0].Date4[0]', formData.suingPublicEntity ? formData.publicEntityClaimDate : ''],
      
      // Page 4 Caption
      ['SC-100[0].Page4[0].PxCaption[0].Plaintiff[0]', formData.plaintiffName],
      ['SC-100[0].Page4[0].PxCaption[0].CaseNumber_ft[0]', formData.caseNumber],
      
      // Signature Fields
      ['SC-100[0].Page4[0].Sign[0].Date1[0]', formData.signatureDate],
      ['SC-100[0].Page4[0].Sign[0].PlaintiffName1[0]', formData.plaintiffName],
      ['SC-100[0].Page4[0].Sign[0].Date2[0]', formData.hasSecondPlaintiff ? formData.secondSignatureDate : ''],
      ['SC-100[0].Page4[0].Sign[0].PlaintiffName2[0]', formData.hasSecondPlaintiff ? formData.secondPlaintiffName : ''],
    ])
    
    let fieldsFilledCount = 0
    let fieldsAttemptedCount = 0
    
    // Fill fields using exact mapping
    for (const [exactFieldName, value] of fieldMappings) {
      if (value && value.toString().trim() !== '') {
        fieldsAttemptedCount++
        const field = fields.find(f => f.getName() === exactFieldName)
        if (field && field.constructor.name === 'PDFTextField') {
          try {
            ;(field as any).setText(value.toString())
            console.log(`  ✅ ${exactFieldName.split('.').pop()}: "${value}"`)
            fieldsFilledCount++
          } catch (e) {
            console.log(`  ❌ ${exactFieldName.split('.').pop()}: FAILED - ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        } else if (!field) {
          console.log(`  ⚠️ ${exactFieldName}: Field not found in PDF`)
        }
      }
    }
    
    // Handle checkbox mappings separately
    const checkboxMappings = new Map([
      // Plaintiff checkboxes (Page 2)
      ['SC-100[0].Page2[0].List1[0].Item1[0].Checkbox1[0]', formData.moreThanTwoPlaintiffs],
      ['SC-100[0].Page2[0].List1[0].Item1[0].Checkbox2[0]', formData.fictitiousName],
      ['SC-100[0].Page2[0].List1[0].Item1[0].Checkbox3[0]', formData.paydayLender],
      
      // Defendant checkboxes (Page 2)
      ['SC-100[0].Page2[0].List2[0].item2[0].Checkbox4[0]', formData.moreThanOneDefendant],
      ['SC-100[0].Page2[0].List2[0].item2[0].Checkbox5[0]', formData.activeMilitaryDuty],
      
      // Claim checkboxes (Page 3)
      ['SC-100[0].Page3[0].List3[0].Checkbox[0].Checkbox1[0]', formData.needMoreSpace],
      
      // Pre-suit demand checkboxes (Yes/No radio buttons)
      ['SC-100[0].Page3[0].List4[0].Item4[0].Checkbox50[0]', formData.askedForPayment === true],
      ['SC-100[0].Page3[0].List4[0].Item4[0].Checkbox50[1]', formData.askedForPayment === false],
      
      // Jurisdiction reason checkboxes (Page 3) - based on jurisdictionReason selection
      ['SC-100[0].Page3[0].List5[0].Lia[0].Checkbox4[0]', formData.jurisdictionReason === 'defendant-lives'],
      ['SC-100[0].Page3[0].List5[0].Lib[0].Checkbox5[0]', formData.jurisdictionReason === 'property-damaged'],
      ['SC-100[0].Page3[0].List5[0].Lic[0].Checkbox6[0]', formData.jurisdictionReason === 'plaintiff-injured'],
      ['SC-100[0].Page3[0].List5[0].Lid[0].Checkbox7[0]', formData.jurisdictionReason === 'contract-location'],
      ['SC-100[0].Page3[0].List5[0].Lie[0].Checkbox8[0]', formData.jurisdictionReason === 'other'],
      
      // Attorney-client dispute checkbox (Page 3)
      ['SC-100[0].Page3[0].List7[0].item7[0].Checkbox60[0]', formData.attorneyClientDispute === true],
      ['SC-100[0].Page3[0].List7[0].item7[0].Checkbox60[1]', formData.attorneyClientDispute === false],
      ['SC-100[0].Page3[0].List7[0].item7[0].Checkbox11[0]', formData.arbitrationFiled],
      
      // Public entity checkbox (Page 3)
      ['SC-100[0].Page3[0].List8[0].item8[0].Checkbox61[0]', formData.suingPublicEntity === true],
      ['SC-100[0].Page3[0].List8[0].item8[0].Checkbox61[1]', formData.suingPublicEntity === false],
      ['SC-100[0].Page3[0].List8[0].item8[0].Checkbox14[0]', formData.suingPublicEntity],
      
      // Filing limits checkboxes (Page 4) 
      ['SC-100[0].Page4[0].List9[0].Item9[0].Checkbox62[0]', formData.moreThan12Claims === true],
      ['SC-100[0].Page4[0].List9[0].Item9[0].Checkbox62[1]', formData.moreThan12Claims === false],
      ['SC-100[0].Page4[0].List10[0].Checkbox63[0]', formData.claimOver2500 === true],
      ['SC-100[0].Page4[0].List10[0].Checkbox63[1]', formData.claimOver2500 === false],
    ])
    
    // Fill checkboxes
    for (const [exactFieldName, shouldCheck] of checkboxMappings) {
      if (shouldCheck !== undefined) {
        fieldsAttemptedCount++
        const field = fields.find(f => f.getName() === exactFieldName)
        if (field && field.constructor.name === 'PDFCheckBox') {
          try {
            if (shouldCheck) {
              ;(field as any).check()
              console.log(`  ✅ ${exactFieldName.split('.').pop()}: CHECKED`)
            } else {
              ;(field as any).uncheck()
              console.log(`  ◯ ${exactFieldName.split('.').pop()}: UNCHECKED`)
            }
            fieldsFilledCount++
          } catch (e) {
            console.log(`  ❌ ${exactFieldName.split('.').pop()}: CHECKBOX FAILED - ${e.message}`)
          }
        } else if (!field) {
          console.log(`  ⚠️ ${exactFieldName}: Checkbox field not found in PDF`)
        }
      }
    }
    
    console.log(`\n📊 SUMMARY: Successfully filled ${fieldsFilledCount}/${fieldsAttemptedCount} fields`)

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
        documentType: 'SC-100 Small Claims',
        submittedAt: new Date().toISOString(),
        participantName: formData.plaintiffName,
        claimAmount: formData.claimAmount,
        pdfBase64: pdfBase64,
        fieldsFilled: `Precisely filled ${fieldsFilledCount}/${fieldsAttemptedCount} fields using exact field name mapping`
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