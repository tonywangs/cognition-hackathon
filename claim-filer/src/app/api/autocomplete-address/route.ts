import { NextRequest, NextResponse } from 'next/server'

interface AddressInfo {
  street: string
  city: string
  state: string
  zip: string
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&types=address&key=${apiKey}`
    
    const autocompleteResponse = await fetch(autocompleteUrl)
    const autocompleteData = await autocompleteResponse.json()
    
    if (!autocompleteData.predictions || autocompleteData.predictions.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const bestPrediction = autocompleteData.predictions[0]
    
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${bestPrediction.place_id}&fields=address_components&key=${apiKey}`
    
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()
    
    if (!detailsData.result || !detailsData.result.address_components) {
      return NextResponse.json(
        { error: 'Could not fetch address details' },
        { status: 404 }
      )
    }

    let street = ''
    let city = ''
    let state = ''
    let zip = ''
    
    for (const component of detailsData.result.address_components) {
      const types = component.types
      
      if (types.includes('street_number')) {
        street = component.long_name + ' '
      } else if (types.includes('route')) {
        street += component.long_name
      } else if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      } else if (types.includes('postal_code')) {
        zip = component.long_name
      }
    }

    const addressInfo: AddressInfo = {
      street: street.trim(),
      city,
      state,
      zip
    }

    return NextResponse.json({ addressInfo })
    
  } catch (error) {
    console.error('Address autocomplete error:', error)
    return NextResponse.json(
      { error: 'Failed to autocomplete address' },
      { status: 500 }
    )
  }
}