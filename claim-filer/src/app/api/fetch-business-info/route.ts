import { NextRequest, NextResponse } from 'next/server'

interface BusinessInfo {
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const { businessName } = await request.json()
    
    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
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

    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${apiKey}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (!searchData.candidates || searchData.candidates.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const place = searchData.candidates[0]
    
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,address_components,formatted_phone_number,website&key=${apiKey}`
    
    const detailsResponse = await fetch(detailsUrl)
    const detailsData = await detailsResponse.json()
    
    if (!detailsData.result) {
      return NextResponse.json(
        { error: 'Could not fetch business details' },
        { status: 404 }
      )
    }

    const result = detailsData.result
    
    let address = ''
    let city = ''
    let state = ''
    let zip = ''
    
    if (result.address_components) {
      for (const component of result.address_components) {
        const types = component.types
        
        if (types.includes('street_number')) {
          address = component.long_name + ' '
        } else if (types.includes('route')) {
          address += component.long_name
        } else if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('postal_code')) {
          zip = component.long_name
        }
      }
    }
    
    if (!address && result.formatted_address) {
      const addressParts = result.formatted_address.split(', ')
      if (addressParts.length > 0) {
        address = addressParts[0]
      }
    }

    const businessInfo: BusinessInfo = {
      name: result.name,
      address: address.trim(),
      city,
      state,
      zip,
      phone: result.formatted_phone_number || ''
    }

    return NextResponse.json({ businessInfo })
    
  } catch (error) {
    console.error('Business lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business information' },
      { status: 500 }
    )
  }
}