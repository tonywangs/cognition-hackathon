"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Send, CheckCircle, Search, MapPin, Wand2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  claimType: string
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

export default function PDFFormGenerator() {
  const [isLoadingBusinessInfo, setIsLoadingBusinessInfo] = useState(false)
  const [isLoadingPlaintiffAddress, setIsLoadingPlaintiffAddress] = useState(false)
  const [isLoadingDefendantAddress, setIsLoadingDefendantAddress] = useState(false)
  const [isLoadingCourtInfo, setIsLoadingCourtInfo] = useState(false)
  const [isLoadingJurisdiction, setIsLoadingJurisdiction] = useState(false)
  const [isLoadingLegalText, setIsLoadingLegalText] = useState(false)
  const [isLoadingPresuitDemand, setIsLoadingPresuitDemand] = useState(false)
  const [isLoadingSecondPlaintiffAddress, setIsLoadingSecondPlaintiffAddress] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    // Court Information
    courtName: "",
    courtAddress: "",
    caseNumber: "",
    caseName: "",
    
    // Plaintiff Information
    plaintiffName: "",
    plaintiffPhone: "",
    plaintiffStreetAddress: "",
    plaintiffCity: "",
    plaintiffState: "CA",
    plaintiffZip: "",
    plaintiffMailingAddress: "",
    plaintiffMailingCity: "",
    plaintiffMailingState: "",
    plaintiffMailingZip: "",
    plaintiffEmail: "",
    
    // Additional Plaintiff
    hasSecondPlaintiff: false,
    secondPlaintiffName: "",
    secondPlaintiffPhone: "",
    secondPlaintiffStreetAddress: "",
    secondPlaintiffCity: "",
    secondPlaintiffState: "",
    secondPlaintiffZip: "",
    secondPlaintiffMailingAddress: "",
    secondPlaintiffMailingCity: "",
    secondPlaintiffMailingState: "",
    secondPlaintiffMailingZip: "",
    secondPlaintiffEmail: "",
    
    // Additional Plaintiff Options
    moreThanTwoPlaintiffs: false,
    fictitiousName: false,
    paydayLender: false,
    
    // Defendant Information
    defendantName: "",
    defendantPhone: "",
    defendantStreetAddress: "",
    defendantCity: "",
    defendantState: "",
    defendantZip: "",
    defendantMailingAddress: "",
    defendantMailingCity: "",
    defendantMailingState: "",
    defendantMailingZip: "",
    
    // Service Information
    servicePersonName: "",
    servicePersonTitle: "",
    servicePersonAddress: "",
    servicePersonCity: "",
    servicePersonState: "",
    servicePersonZip: "",
    
    // Additional Defendant Options
    moreThanOneDefendant: false,
    activeMilitaryDuty: false,
    militaryDefendantName: "",
    needMoreSpace: false,
    
    // Claim Information
    claimType: "",
    claimAmount: "",
    claimReason: "",
    incidentDate: "",
    incidentStartDate: "",
    incidentEndDate: "",
    calculationExplanation: "",
    
    // Pre-suit Demand
    askedForPayment: false,
    whyNotAsked: "",
    
    // Jurisdiction
    jurisdictionReason: "",
    jurisdictionZip: "",
    jurisdictionLocation1: "",
    jurisdictionLocation2: "",
    
    // Special Cases
    attorneyClientDispute: false,
    arbitrationFiled: false,
    suingPublicEntity: false,
    publicEntityClaimDate: "",
    
    // Filing Limits
    moreThan12Claims: false,
    claimOver2500: false,
    
    // Agreement
    understandsNoAppeal: false,
    agreeToTerms: false,
    
    // Signature Information  
    signatureDate: "",
    secondSignatureDate: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [pdfData, setPdfData] = useState<string | null>(null)

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFetchBusinessInfo = async () => {
    if (!formData.defendantName.trim()) {
      toast({
        title: "Enter Business Name",
        description: "Please enter a business name to fetch information.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingBusinessInfo(true)

    try {
      const response = await fetch('/api/fetch-business-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.defendantName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch business information')
      }

      const { businessInfo } = result

      setFormData((prev) => ({
        ...prev,
        defendantName: businessInfo.name || prev.defendantName,
        defendantStreetAddress: businessInfo.address || prev.defendantStreetAddress,
        defendantCity: businessInfo.city || prev.defendantCity,
        defendantState: businessInfo.state || prev.defendantState,
        defendantZip: businessInfo.zip || prev.defendantZip,
        defendantPhone: businessInfo.phone || prev.defendantPhone,
      }))

      toast({
        title: "Business Info Fetched",
        description: "Business information has been automatically filled in.",
      })
    } catch (error) {
      console.error("Business lookup error:", error)
      toast({
        title: "Lookup Failed",
        description: error instanceof Error ? error.message : "Could not find business information. Please enter manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBusinessInfo(false)
    }
  }

  const handleAutocompleteAddress = async (addressField: string) => {
    const address = formData[addressField as keyof FormData] as string
    
    if (!address.trim()) {
      toast({
        title: "Enter Address",
        description: "Please enter a street address to auto-complete.",
        variant: "destructive",
      })
      return
    }

    // Set the appropriate loading state based on which field is being autocompleted
    if (addressField === 'plaintiffStreetAddress') {
      setIsLoadingPlaintiffAddress(true)
    } else if (addressField === 'defendantStreetAddress') {
      setIsLoadingDefendantAddress(true)
    } else if (addressField === 'secondPlaintiffStreetAddress') {
      setIsLoadingSecondPlaintiffAddress(true)
    }

    try {
      const response = await fetch('/api/autocomplete-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to autocomplete address')
      }

      const { addressInfo } = result

      // Determine which fields to update based on the input field
      if (addressField === 'plaintiffStreetAddress') {
        setFormData((prev) => ({
          ...prev,
          plaintiffStreetAddress: addressInfo.street || prev.plaintiffStreetAddress,
          plaintiffCity: addressInfo.city || prev.plaintiffCity,
          plaintiffState: addressInfo.state || prev.plaintiffState,
          plaintiffZip: addressInfo.zip || prev.plaintiffZip,
        }))
      } else if (addressField === 'defendantStreetAddress') {
        setFormData((prev) => ({
          ...prev,
          defendantStreetAddress: addressInfo.street || prev.defendantStreetAddress,
          defendantCity: addressInfo.city || prev.defendantCity,
          defendantState: addressInfo.state || prev.defendantState,
          defendantZip: addressInfo.zip || prev.defendantZip,
        }))
      } else if (addressField === 'secondPlaintiffStreetAddress') {
        setFormData((prev) => ({
          ...prev,
          secondPlaintiffStreetAddress: addressInfo.street || prev.secondPlaintiffStreetAddress,
          secondPlaintiffCity: addressInfo.city || prev.secondPlaintiffCity,
          secondPlaintiffState: addressInfo.state || prev.secondPlaintiffState,
          secondPlaintiffZip: addressInfo.zip || prev.secondPlaintiffZip,
        }))
      }

      toast({
        title: "Address Completed",
        description: "Address information has been automatically filled in.",
      })
    } catch (error) {
      console.error("Address autocomplete error:", error)
      toast({
        title: "Autocomplete Failed",
        description: error instanceof Error ? error.message : "Could not complete address. Please enter manually.",
        variant: "destructive",
      })
    } finally {
      // Clear the appropriate loading state
      if (addressField === 'plaintiffStreetAddress') {
        setIsLoadingPlaintiffAddress(false)
      } else if (addressField === 'defendantStreetAddress') {
        setIsLoadingDefendantAddress(false)
      } else if (addressField === 'secondPlaintiffStreetAddress') {
        setIsLoadingSecondPlaintiffAddress(false)
      }
    }
  }

  const handleGenerateLegalText = async () => {
    if (!formData.claimType) {
      toast({
        title: "Select Claim Type First",
        description: "Please select a claim type before generating legal text.",
        variant: "destructive",
      })
      return
    }

    if (!formData.claimAmount) {
      toast({
        title: "Enter Claim Amount First",
        description: "Please enter the amount you are claiming before generating legal text.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingLegalText(true)

    try {
      const response = await fetch('/api/generate-legal-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimType: formData.claimType,
          plaintiffName: formData.plaintiffName,
          defendantName: formData.defendantName,
          claimAmount: formData.claimAmount,
          claimReason: formData.claimReason, // Pass existing reason to enhance
          calculationExplanation: formData.calculationExplanation, // Pass existing calculation to enhance
          incidentDate: formData.incidentDate,
          incidentStartDate: formData.incidentStartDate,
          incidentEndDate: formData.incidentEndDate,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate legal text')
      }

      // Update the form with generated text
      setFormData((prev) => ({
        ...prev,
        claimReason: result.claimReason,
        calculationExplanation: result.calculationExplanation,
      }))

      toast({
        title: "Legal Text Generated",
        description: "The claim description and calculation explanation have been populated.",
      })
    } catch (error) {
      console.error("Legal text generation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate legal text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLegalText(false)
    }
  }

  const handleGenerateCourtInfo = async () => {
    if (!formData.plaintiffStreetAddress || !formData.plaintiffCity || !formData.plaintiffState || !formData.plaintiffZip) {
      toast({
        title: "Complete Plaintiff Address First",
        description: "Please enter your complete address before generating court information.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingCourtInfo(true)

    try {
      const response = await fetch('/api/generate-court-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetAddress: formData.plaintiffStreetAddress,
          city: formData.plaintiffCity,
          state: formData.plaintiffState,
          zip: formData.plaintiffZip,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate court information')
      }

      // Update the form with generated court info
      setFormData((prev) => ({
        ...prev,
        courtName: result.courtName || prev.courtName,
        courtAddress: result.courtAddress || prev.courtAddress,
      }))

      toast({
        title: "Court Information Generated",
        description: "The court name and address have been automatically filled based on your location.",
      })
    } catch (error) {
      console.error("Court info generation error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate court information. Please enter manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCourtInfo(false)
    }
  }

  const handleGeneratePresuitDemand = async () => {
    if (!formData.claimType || !formData.claimReason) {
      toast({
        title: "Missing Information",
        description: "Please complete claim type and reason before generating explanation.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingPresuitDemand(true)

    try {
      const response = await fetch('/api/generate-presuit-demand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimType: formData.claimType,
          claimReason: formData.claimReason,
          defendantName: formData.defendantName,
          claimAmount: formData.claimAmount,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate explanation')
      }

      // Update the form with generated explanation
      setFormData((prev) => ({
        ...prev,
        whyNotAsked: result.whyNotAsked,
      }))

      toast({
        title: "Legal Explanation Generated",
        description: "A legally valid explanation has been provided for not making a pre-suit demand.",
      })
    } catch (error) {
      console.error("Pre-suit demand generation error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate explanation. Please enter manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPresuitDemand(false)
    }
  }

  const handleGenerateJurisdiction = async () => {
    // Check if required fields are filled
    const requiredFields = ['claimType', 'claimReason', 'claimAmount', 'plaintiffCity', 'plaintiffState', 'plaintiffZip', 'defendantName', 'defendantCity', 'defendantState', 'defendantZip']
    const missingField = requiredFields.find(field => !formData[field as keyof FormData])
    
    if (missingField) {
      toast({
        title: "Missing Required Information",
        description: "Please complete claim details and both plaintiff and defendant addresses first.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingJurisdiction(true)

    try {
      const response = await fetch('/api/generate-jurisdiction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimType: formData.claimType,
          claimReason: formData.claimReason,
          claimAmount: formData.claimAmount,
          plaintiffCity: formData.plaintiffCity,
          plaintiffState: formData.plaintiffState,
          plaintiffZip: formData.plaintiffZip,
          defendantCity: formData.defendantCity,
          defendantState: formData.defendantState,
          defendantZip: formData.defendantZip,
          defendantName: formData.defendantName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate jurisdiction information')
      }

      // Update the form with generated jurisdiction info
      setFormData((prev) => ({
        ...prev,
        jurisdictionReason: result.jurisdictionReason || prev.jurisdictionReason,
        jurisdictionZip: result.jurisdictionZip || prev.jurisdictionZip,
      }))

      toast({
        title: "Jurisdiction Generated",
        description: "The jurisdiction reason and zip code have been automatically filled based on your claim details.",
      })
    } catch (error) {
      console.error("Jurisdiction generation error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate jurisdiction information. Please enter manually.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingJurisdiction(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = [
      { field: 'courtName', name: 'Court Name' },
      { field: 'courtAddress', name: 'Court Address' },
      { field: 'plaintiffName', name: 'Plaintiff Name' },
      { field: 'plaintiffStreetAddress', name: 'Plaintiff Street Address' },
      { field: 'plaintiffCity', name: 'Plaintiff City' },
      { field: 'plaintiffState', name: 'Plaintiff State' },
      { field: 'plaintiffZip', name: 'Plaintiff Zip Code' },
      { field: 'defendantName', name: 'Defendant Name' },
      { field: 'defendantStreetAddress', name: 'Defendant Street Address' },
      { field: 'defendantCity', name: 'Defendant City' },
      { field: 'defendantState', name: 'Defendant State' },
      { field: 'defendantZip', name: 'Defendant Zip Code' },
      { field: 'claimType', name: 'Claim Type' },
      { field: 'claimAmount', name: 'Claim Amount' },
      { field: 'claimReason', name: 'Reason for Claim' },
      { field: 'calculationExplanation', name: 'Calculation Explanation' },
      { field: 'jurisdictionReason', name: 'Jurisdiction Reason' },
      { field: 'signatureDate', name: 'Signature Date' },
    ]

    const missingField = requiredFields.find(({ field }) => !formData[field as keyof FormData])
    if (missingField) {
      toast({
        title: "Missing Required Information",
        description: `Please fill in the ${missingField.name} field.`,
        variant: "destructive",
      })
      return
    }

    // Validate radio button for pre-suit demand
    if (formData.askedForPayment === null || formData.askedForPayment === undefined) {
      toast({
        title: "Missing Required Information",
        description: "Please indicate whether you asked the defendant for payment before filing.",
        variant: "destructive",
      })
      return
    }

    // Validate conditional required fields
    if (formData.askedForPayment === false && !formData.whyNotAsked) {
      toast({
        title: "Missing Required Information",
        description: "Please explain why you did not ask for payment first.",
        variant: "destructive",
      })
      return
    }

    if (formData.suingPublicEntity && !formData.publicEntityClaimDate) {
      toast({
        title: "Missing Required Information",
        description: "Please provide the date you filed your claim with the public entity.",
        variant: "destructive",
      })
      return
    }

    if (formData.activeMilitaryDuty && !formData.militaryDefendantName) {
      toast({
        title: "Missing Required Information", 
        description: "Please provide the name of the defendant on military duty.",
        variant: "destructive",
      })
      return
    }

    // Validate claim amount
    const claimAmountNum = parseFloat(formData.claimAmount)
    if (isNaN(claimAmountNum) || claimAmountNum <= 0) {
      toast({
        title: "Invalid Claim Amount",
        description: "Please enter a valid claim amount greater than $0.",
        variant: "destructive",
      })
      return
    }

    if (claimAmountNum > 12500) {
      toast({
        title: "Claim Amount Too High",
        description: "Small claims court maximum is $12,500 for individuals or $6,250 for businesses.",
        variant: "destructive",
      })
      return
    }

    // Validate required checkboxes
    if (!formData.understandsNoAppeal) {
      toast({
        title: "Declaration Required",
        description: "You must acknowledge that you have no right to appeal in small claims court.",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Declaration Required",
        description: "You must declare under penalty of perjury that the information is true and correct.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form')
      }

      console.log("Form submission successful:", result)

      // Store the PDF data
      if (result.data?.pdfBase64) {
        setPdfData(result.data.pdfBase64)
      }

      setIsSubmitted(true)
      toast({
        title: "PDF Generated Successfully!",
        description: "Your document has been created and is ready for download.",
      })
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = () => {
    if (!pdfData) {
      toast({
        title: "Error",
        description: "No PDF data available to download.",
        variant: "destructive",
      })
      return
    }

    // Convert base64 to blob
    const byteCharacters = atob(pdfData)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `small_claims_${formData.plaintiffName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: "Your PDF document is being downloaded.",
    })
  }

  const handleReset = () => {
    setFormData({
      // Court Information
      courtName: "",
      courtAddress: "",
      caseNumber: "",
      caseName: "",
      
      // Plaintiff Information
      plaintiffName: "",
      plaintiffPhone: "",
      plaintiffStreetAddress: "",
      plaintiffCity: "",
      plaintiffState: "CA",
      plaintiffZip: "",
      plaintiffMailingAddress: "",
      plaintiffMailingCity: "",
      plaintiffMailingState: "",
      plaintiffMailingZip: "",
      plaintiffEmail: "",
      
      // Additional Plaintiff
      hasSecondPlaintiff: false,
      secondPlaintiffName: "",
      secondPlaintiffPhone: "",
      secondPlaintiffStreetAddress: "",
      secondPlaintiffCity: "",
      secondPlaintiffState: "",
      secondPlaintiffZip: "",
      secondPlaintiffMailingAddress: "",
      secondPlaintiffMailingCity: "",
      secondPlaintiffMailingState: "",
      secondPlaintiffMailingZip: "",
      secondPlaintiffEmail: "",
      
      // Additional Plaintiff Options
      moreThanTwoPlaintiffs: false,
      fictitiousName: false,
      paydayLender: false,
      
      // Defendant Information
      defendantName: "",
      defendantPhone: "",
      defendantStreetAddress: "",
      defendantCity: "",
      defendantState: "",
      defendantZip: "",
      defendantMailingAddress: "",
      defendantMailingCity: "",
      defendantMailingState: "",
      defendantMailingZip: "",
      
      // Service Information
      servicePersonName: "",
      servicePersonTitle: "",
      servicePersonAddress: "",
      servicePersonCity: "",
      servicePersonState: "",
      servicePersonZip: "",
      
      // Additional Defendant Options
      moreThanOneDefendant: false,
      activeMilitaryDuty: false,
      militaryDefendantName: "",
      needMoreSpace: false,
      
      // Claim Information
      claimType: "",
      claimAmount: "",
      claimReason: "",
      incidentDate: "",
      incidentStartDate: "",
      incidentEndDate: "",
      calculationExplanation: "",
      
      // Pre-suit Demand
      askedForPayment: false,
      whyNotAsked: "",
      
      // Jurisdiction
      jurisdictionReason: "",
      jurisdictionZip: "",
      jurisdictionLocation1: "",
      jurisdictionLocation2: "",
      
      // Special Cases
      attorneyClientDispute: false,
      arbitrationFiled: false,
      suingPublicEntity: false,
      publicEntityClaimDate: "",
      
      // Filing Limits
      moreThan12Claims: false,
      claimOver2500: false,
      
      // Agreement
      understandsNoAppeal: false,
      agreeToTerms: false,
      
      // Signature Information
      signatureDate: "",
      secondSignatureDate: "",
    })
    setIsSubmitted(false)
    setPdfData(null)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Small Claims Form Generated Successfully!</CardTitle>
              <CardDescription>Your SC-100 Plaintiff's Claim form has been created with your provided information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Form Details:</p>
                <p className="font-medium">SC-100 Plaintiff's Claim and ORDER to Go to Small Claims Court</p>
                <p className="text-sm text-gray-500">
                  Plaintiff: {formData.plaintiffName}
                </p>
                <p className="text-sm text-gray-500">
                  Claim Amount: ${formData.claimAmount}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleDownload} className="bg-amber-600 hover:bg-amber-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Small Claims Court Form Generator</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">File Your Small Claims Suit</h2>
          <p className="text-gray-600">
            Complete the SC-100 Plaintiff's Claim form to file your small claims court case in California
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plaintiff Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Plaintiff Information</CardTitle>
                <CardDescription>Your information (person filing the claim)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plaintiffName">Full Name *</Label>
                  <Input
                    id="plaintiffName"
                    value={formData.plaintiffName}
                    onChange={(e) => handleInputChange("plaintiffName", e.target.value)}
                    required
                    placeholder="Your full legal name"
                  />
                </div>
                <div>
                  <Label htmlFor="plaintiffPhone">Phone Number</Label>
                  <Input
                    id="plaintiffPhone"
                    type="tel"
                    value={formData.plaintiffPhone}
                    onChange={(e) => handleInputChange("plaintiffPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="plaintiffStreetAddress">Street Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="plaintiffStreetAddress"
                      value={formData.plaintiffStreetAddress}
                      onChange={(e) => handleInputChange("plaintiffStreetAddress", e.target.value)}
                      required
                      placeholder="123 Main Street"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutocompleteAddress('plaintiffStreetAddress')}
                      disabled={isLoadingPlaintiffAddress}
                      className="px-3"
                    >
                      {isLoadingPlaintiffAddress ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click the location button to auto-complete city, state, and zip
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="plaintiffCity">City *</Label>
                    <Input
                      id="plaintiffCity"
                      value={formData.plaintiffCity}
                      onChange={(e) => handleInputChange("plaintiffCity", e.target.value)}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plaintiffState">State *</Label>
                    <Input
                      id="plaintiffState"
                      value={formData.plaintiffState}
                      onChange={(e) => handleInputChange("plaintiffState", e.target.value)}
                      required
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plaintiffZip">Zip *</Label>
                    <Input
                      id="plaintiffZip"
                      value={formData.plaintiffZip}
                      onChange={(e) => handleInputChange("plaintiffZip", e.target.value)}
                      required
                      placeholder="90210"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="plaintiffEmail">Email Address</Label>
                  <Input
                    id="plaintiffEmail"
                    type="email"
                    value={formData.plaintiffEmail}
                    onChange={(e) => handleInputChange("plaintiffEmail", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSecondPlaintiff"
                      checked={formData.hasSecondPlaintiff}
                      onCheckedChange={(checked) => handleInputChange("hasSecondPlaintiff", checked as boolean)}
                    />
                    <Label htmlFor="hasSecondPlaintiff" className="text-sm">
                      Add second plaintiff
                    </Label>
                  </div>
                </div>
                
                {/* Second Plaintiff Fields - Show when hasSecondPlaintiff is true */}
                {formData.hasSecondPlaintiff && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Second Plaintiff Information</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="secondPlaintiffName">Full Name *</Label>
                        <Input
                          id="secondPlaintiffName"
                          value={formData.secondPlaintiffName}
                          onChange={(e) => handleInputChange("secondPlaintiffName", e.target.value)}
                          required={formData.hasSecondPlaintiff}
                          placeholder="Second plaintiff's full legal name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondPlaintiffPhone">Phone Number</Label>
                        <Input
                          id="secondPlaintiffPhone"
                          type="tel"
                          value={formData.secondPlaintiffPhone}
                          onChange={(e) => handleInputChange("secondPlaintiffPhone", e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondPlaintiffStreetAddress">Street Address *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondPlaintiffStreetAddress"
                            value={formData.secondPlaintiffStreetAddress}
                            onChange={(e) => handleInputChange("secondPlaintiffStreetAddress", e.target.value)}
                            required={formData.hasSecondPlaintiff}
                            placeholder="123 Main Street"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutocompleteAddress('secondPlaintiffStreetAddress')}
                            disabled={isLoadingSecondPlaintiffAddress}
                            className="px-3"
                          >
                            {isLoadingSecondPlaintiffAddress ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Click the location button to auto-complete city, state, and zip
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="secondPlaintiffCity">City *</Label>
                          <Input
                            id="secondPlaintiffCity"
                            value={formData.secondPlaintiffCity}
                            onChange={(e) => handleInputChange("secondPlaintiffCity", e.target.value)}
                            required={formData.hasSecondPlaintiff}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondPlaintiffState">State *</Label>
                          <Input
                            id="secondPlaintiffState"
                            value={formData.secondPlaintiffState}
                            onChange={(e) => handleInputChange("secondPlaintiffState", e.target.value)}
                            required={formData.hasSecondPlaintiff}
                            placeholder="CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="secondPlaintiffZip">Zip *</Label>
                          <Input
                            id="secondPlaintiffZip"
                            value={formData.secondPlaintiffZip}
                            onChange={(e) => handleInputChange("secondPlaintiffZip", e.target.value)}
                            required={formData.hasSecondPlaintiff}
                            placeholder="90210"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondPlaintiffEmail">Email Address</Label>
                        <Input
                          id="secondPlaintiffEmail"
                          type="email"
                          value={formData.secondPlaintiffEmail}
                          onChange={(e) => handleInputChange("secondPlaintiffEmail", e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Defendant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Defendant Information</CardTitle>
                <CardDescription>Information about the person/business you are suing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defendantName">Full Name/Business Name *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="defendantName"
                      value={formData.defendantName}
                      onChange={(e) => handleInputChange("defendantName", e.target.value)}
                      required
                      placeholder="Defendant's full legal name or business name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFetchBusinessInfo}
                      disabled={isLoadingBusinessInfo}
                      className="px-3"
                    >
                      {isLoadingBusinessInfo ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click the search button to auto-fetch business information
                  </p>
                </div>
                <div>
                  <Label htmlFor="defendantPhone">Phone Number</Label>
                  <Input
                    id="defendantPhone"
                    type="tel"
                    value={formData.defendantPhone}
                    onChange={(e) => handleInputChange("defendantPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="defendantStreetAddress">Street Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="defendantStreetAddress"
                      value={formData.defendantStreetAddress}
                      onChange={(e) => handleInputChange("defendantStreetAddress", e.target.value)}
                      required
                      placeholder="123 Main Street"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAutocompleteAddress('defendantStreetAddress')}
                      disabled={isLoadingDefendantAddress}
                      className="px-3"
                    >
                      {isLoadingDefendantAddress ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click the location button to auto-complete city, state, and zip
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="defendantCity">City *</Label>
                    <Input
                      id="defendantCity"
                      value={formData.defendantCity}
                      onChange={(e) => handleInputChange("defendantCity", e.target.value)}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defendantState">State *</Label>
                    <Input
                      id="defendantState"
                      value={formData.defendantState}
                      onChange={(e) => handleInputChange("defendantState", e.target.value)}
                      required
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="defendantZip">Zip *</Label>
                    <Input
                      id="defendantZip"
                      value={formData.defendantZip}
                      onChange={(e) => handleInputChange("defendantZip", e.target.value)}
                      required
                      placeholder="90210"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="moreThanOneDefendant"
                      checked={formData.moreThanOneDefendant}
                      onCheckedChange={(checked) => handleInputChange("moreThanOneDefendant", checked as boolean)}
                    />
                    <Label htmlFor="moreThanOneDefendant" className="text-sm">
                      Your case is against more than one defendant
                    </Label>
                  </div>
                  
                  {/* Additional Defendant Fields - Show when moreThanOneDefendant is true */}
                  {formData.moreThanOneDefendant && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Defendant Information</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="additionalDefendantName">Full Name/Business Name</Label>
                          <Input
                            id="additionalDefendantName"
                            placeholder="Additional defendant's full legal name or business name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="additionalDefendantAddress">Street Address</Label>
                          <Input
                            id="additionalDefendantAddress"
                            placeholder="123 Main Street"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor="additionalDefendantCity">City</Label>
                            <Input
                              id="additionalDefendantCity"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <Label htmlFor="additionalDefendantState">State</Label>
                            <Input
                              id="additionalDefendantState"
                              placeholder="CA"
                            />
                          </div>
                          <div>
                            <Label htmlFor="additionalDefendantZip">Zip</Label>
                            <Input
                              id="additionalDefendantZip"
                              placeholder="90210"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Note: For multiple defendants, you may need to file separate forms or attach additional sheets with complete defendant information.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activeMilitaryDuty"
                      checked={formData.activeMilitaryDuty}
                      onCheckedChange={(checked) => handleInputChange("activeMilitaryDuty", checked as boolean)}
                    />
                    <Label htmlFor="activeMilitaryDuty" className="text-sm">
                      Any defendant is on active military duty
                    </Label>
                  </div>
                  {formData.activeMilitaryDuty && (
                    <div className="ml-6">
                      <Label htmlFor="militaryDefendantName">Military Defendant Name</Label>
                      <Input
                        id="militaryDefendantName"
                        value={formData.militaryDefendantName}
                        onChange={(e) => handleInputChange("militaryDefendantName", e.target.value)}
                        placeholder="Name of defendant on military duty"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needMoreSpace"
                      checked={formData.needMoreSpace}
                      onCheckedChange={(checked) => handleInputChange("needMoreSpace", checked as boolean)}
                    />
                    <Label htmlFor="needMoreSpace" className="text-sm">
                      You need more space (attach additional sheet)
                    </Label>
                  </div>
                  
                  {/* Additional Space Field - Show when needMoreSpace is true */}
                  {formData.needMoreSpace && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
                      <div>
                        <Label htmlFor="additionalSpace">Additional details (attach to your court filing)</Label>
                        <Textarea
                          id="additionalSpace"
                          placeholder="Enter additional information that didn't fit in the above fields. This will need to be attached as a separate sheet to your court filing."
                          rows={4}
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Note: This information should be printed separately and attached to your SC-100 form when filing with the court.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Court Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Court Information</CardTitle>
              <CardDescription>Enter the court details where you are filing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="courtName">Superior Court of California, County of *</Label>
                <div className="flex gap-2">
                  <Input
                    id="courtName"
                    value={formData.courtName}
                    onChange={(e) => handleInputChange("courtName", e.target.value)}
                    required
                    placeholder="e.g., Los Angeles"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCourtInfo}
                    disabled={isLoadingCourtInfo}
                    className="px-3"
                  >
                    {isLoadingCourtInfo ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click the wand button to auto-generate court info based on your address
                </p>
              </div>
              <div>
                <Label htmlFor="courtAddress">Court Address *</Label>
                <Input
                  id="courtAddress"
                  value={formData.courtAddress}
                  onChange={(e) => handleInputChange("courtAddress", e.target.value)}
                  required
                  placeholder="Court street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseNumber">Case Number</Label>
                  <Input
                    id="caseNumber"
                    value={formData.caseNumber}
                    onChange={(e) => handleInputChange("caseNumber", e.target.value)}
                    placeholder="Leave blank - court will assign"
                  />
                </div>
                <div>
                  <Label htmlFor="caseName">Case Name</Label>
                  <Input
                    id="caseName"
                    value={formData.caseName}
                    onChange={(e) => handleInputChange("caseName", e.target.value)}
                    placeholder="Your name vs Defendant name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Type of Claim</CardTitle>
              <CardDescription>Select the type of small claims case that best describes your situation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="claimType">What type of claim is this? *</Label>
                <Select
                  value={formData.claimType}
                  onValueChange={(value) => handleInputChange("claimType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid-debts">Unpaid debts or loans</SelectItem>
                    <SelectItem value="breach-contract">Breach of contract</SelectItem>
                    <SelectItem value="property-damage">Property damage</SelectItem>
                    <SelectItem value="security-deposit">Security deposit disputes</SelectItem>
                    <SelectItem value="unpaid-wages">Unpaid wages</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 mt-2">
                  <div className="space-y-1">
                    <p><strong>Unpaid debts:</strong> Money lent and not repaid, roommate didn't pay their share</p>
                    <p><strong>Breach of contract:</strong> Contractor didn't complete work, service not provided after payment</p>
                    <p><strong>Property damage:</strong> Vehicle accidents, rental property damage, broken personal items</p>
                    <p><strong>Security deposit:</strong> Landlord refuses to return deposit without valid reason</p>
                    <p><strong>Unpaid wages:</strong> Final paycheck, overtime, or other earned compensation owed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">5. Your Claim Details</CardTitle>
              <CardDescription>Specific details about what you are claiming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="claimAmount">Amount you are claiming (in dollars) *</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="12500"
                  value={formData.claimAmount}
                  onChange={(e) => handleInputChange("claimAmount", e.target.value)}
                  required
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: $12,500 for individuals, $6,250 for businesses</p>
              </div>
              <div>
                <Label htmlFor="claimReason">Why does the defendant owe you money? *</Label>
                <Textarea
                  id="claimReason"
                  value={formData.claimReason}
                  onChange={(e) => handleInputChange("claimReason", e.target.value)}
                  required
                  placeholder="Explain what happened and why the defendant owes you money..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="incidentDate">When did this happen? (Date)</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => handleInputChange("incidentDate", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentStartDate">If no specific date, start date:</Label>
                  <Input
                    id="incidentStartDate"
                    type="date"
                    value={formData.incidentStartDate}
                    onChange={(e) => handleInputChange("incidentStartDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="incidentEndDate">Through (end date):</Label>
                  <Input
                    id="incidentEndDate"
                    type="date"
                    value={formData.incidentEndDate}
                    onChange={(e) => handleInputChange("incidentEndDate", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="calculationExplanation">How did you calculate the money owed? *</Label>
                <Textarea
                  id="calculationExplanation"
                  value={formData.calculationExplanation}
                  onChange={(e) => handleInputChange("calculationExplanation", e.target.value)}
                  required
                  placeholder="Explain your calculation (do not include court costs or service fees)..."
                  rows={3}
                />
                {formData.claimType && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateLegalText}
                      disabled={isLoadingLegalText}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoadingLegalText ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Generating Legal Reasoning...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Proper Legal Reasoning
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {isLoadingLegalText 
                        ? "AI is analyzing your claim and creating formal legal language..." 
                        : "Transform your reasons into proper legal terminology for court"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pre-suit Demand */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">6. Pre-suit Demand</CardTitle>
              <CardDescription>Required: You must ask defendant for payment before filing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Did you ask the defendant to pay you before filing this lawsuit? *</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="askedYes"
                      name="askedForPayment"
                      checked={formData.askedForPayment === true}
                      onChange={() => handleInputChange("askedForPayment", true)}
                    />
                    <Label htmlFor="askedYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="askedNo"
                      name="askedForPayment"
                      checked={formData.askedForPayment === false}
                      onChange={() => handleInputChange("askedForPayment", false)}
                    />
                    <Label htmlFor="askedNo">No</Label>
                  </div>
                </div>
              </div>
              {formData.askedForPayment === false && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whyNotAsked">If no, explain why not: *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGeneratePresuitDemand}
                      disabled={isLoadingPresuitDemand}
                      className="flex items-center gap-2"
                    >
                      {isLoadingPresuitDemand ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Legal Explanation
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="whyNotAsked"
                    value={formData.whyNotAsked}
                    onChange={(e) => handleInputChange("whyNotAsked", e.target.value)}
                    required={formData.askedForPayment === false}
                    placeholder="Explain why you did not ask for payment first..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {isLoadingPresuitDemand 
                      ? "Generating legally acceptable explanation for court..." 
                      : "Click 'Generate Legal Explanation' for a court-acceptable reason"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Jurisdiction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">7. Why are you filing at this courthouse?</CardTitle>
              <CardDescription>Select the reason this court has jurisdiction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="jurisdictionReason">This courthouse covers the area where: *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateJurisdiction}
                      disabled={isLoadingJurisdiction}
                      className="flex items-center gap-2"
                    >
                      {isLoadingJurisdiction ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      Generate from Claim
                    </Button>
                  </div>
                  <Select
                    value={formData.jurisdictionReason}
                    onValueChange={(value) => handleInputChange("jurisdictionReason", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defendant-lives">Defendant lives or does business</SelectItem>
                      <SelectItem value="property-damaged">Plaintiff's property was damaged</SelectItem>
                      <SelectItem value="plaintiff-injured">Plaintiff was injured</SelectItem>
                      <SelectItem value="contract-location">Contract was made, signed, performed, or broken</SelectItem>
                      <SelectItem value="buyer-contract">Buyer/lessee signed contract or lives (personal/family goods)</SelectItem>
                      <SelectItem value="retail-installment">Buyer signed retail installment contract</SelectItem>
                      <SelectItem value="vehicle-finance">Vehicle finance sale location</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Generate from Claim" to auto-fill based on your claim details
                  </p>
                </div>
                <div>
                  <Label htmlFor="jurisdictionZip">Zip code of the place checked above:</Label>
                  <Input
                    id="jurisdictionZip"
                    value={formData.jurisdictionZip}
                    onChange={(e) => handleInputChange("jurisdictionZip", e.target.value)}
                    placeholder="Zip code"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jurisdictionLocation1">Additional location details (if needed):</Label>
                  <Input
                    id="jurisdictionLocation1"
                    value={formData.jurisdictionLocation1}
                    onChange={(e) => handleInputChange("jurisdictionLocation1", e.target.value)}
                    placeholder="Street or landmark"
                  />
                </div>
                <div>
                  <Label htmlFor="jurisdictionLocation2">Additional location details (cont.):</Label>
                  <Input
                    id="jurisdictionLocation2"
                    value={formData.jurisdictionLocation2}
                    onChange={(e) => handleInputChange("jurisdictionLocation2", e.target.value)}
                    placeholder="Additional info"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Cases and Declarations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Questions</CardTitle>
              <CardDescription>Required information for filing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="attorneyClientDispute"
                    checked={formData.attorneyClientDispute}
                    onCheckedChange={(checked) => handleInputChange("attorneyClientDispute", checked as boolean)}
                  />
                  <Label htmlFor="attorneyClientDispute" className="text-sm">
                    This claim is about an attorney-client fee dispute
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="suingPublicEntity"
                    checked={formData.suingPublicEntity}
                    onCheckedChange={(checked) => handleInputChange("suingPublicEntity", checked as boolean)}
                  />
                  <Label htmlFor="suingPublicEntity" className="text-sm">
                    I am suing a public entity (government agency)
                  </Label>
                </div>
                
                {formData.suingPublicEntity && (
                  <div className="ml-6">
                    <Label htmlFor="publicEntityClaimDate">Date claim was filed with public entity:</Label>
                    <Input
                      id="publicEntityClaimDate"
                      type="date"
                      value={formData.publicEntityClaimDate}
                      onChange={(e) => handleInputChange("publicEntityClaimDate", e.target.value)}
                      required={formData.suingPublicEntity}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="moreThan12Claims"
                    checked={formData.moreThan12Claims}
                    onCheckedChange={(checked) => handleInputChange("moreThan12Claims", checked as boolean)}
                  />
                  <Label htmlFor="moreThan12Claims" className="text-sm">
                    I have filed more than 12 small claims cases in the last 12 months in California
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="claimOver2500"
                    checked={formData.claimOver2500}
                    onCheckedChange={(checked) => handleInputChange("claimOver2500", checked as boolean)}
                  />
                  <Label htmlFor="claimOver2500" className="text-sm">
                    My claim is for more than $2,500 (I understand I cannot file more than 2 such cases per year)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Declaration and Submit */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="understandsNoAppeal"
                    checked={formData.understandsNoAppeal}
                    onCheckedChange={(checked) => handleInputChange("understandsNoAppeal", checked as boolean)}
                  />
                  <Label htmlFor="understandsNoAppeal" className="text-sm">
                    I understand that by filing a claim in small claims court, I have no right to appeal this claim. *
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I declare under penalty of perjury under the laws of the State of California that the information above and on any attachments to this form is true and correct. *
                  </Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <Label htmlFor="signatureDate">Signature Date *</Label>
                    <Input
                      id="signatureDate"
                      type="date"
                      value={formData.signatureDate}
                      onChange={(e) => handleInputChange("signatureDate", e.target.value)}
                      required
                    />
                  </div>
                  {formData.hasSecondPlaintiff && (
                    <div>
                      <Label htmlFor="secondSignatureDate">Second Plaintiff Signature Date</Label>
                      <Input
                        id="secondSignatureDate"
                        type="date"
                        value={formData.secondSignatureDate}
                        onChange={(e) => handleInputChange("secondSignatureDate", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-600 hover:bg-amber-700 flex-1 md:flex-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating SC-100 Form...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate SC-100 Form
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
