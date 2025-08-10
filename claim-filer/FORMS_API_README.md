# California Small Claims Forms API

## Overview
This API endpoint allows you to fetch California Small Claims Court forms directly from the official courts.ca.gov website. It provides access to 8 different forms across 3 categories.

## Endpoint
`/api/fetch-forms`

## Available Forms

### Filing Forms
- **SC-100**: Plaintiff's Claim and ORDER to Go to Small Claims Court
- **SC-101**: Defendant's Claim and ORDER to Go to Small Claims Court (Small Claims)

### Judgment Forms  
- **SC-105**: Request to Enter Default Judgment
- **SC-107**: Request to Enter Judgment
- **SC-108**: Request to Enter Judgment on Stipulated Agreement
- **SC-109**: Request to Enter Judgment on Settlement Agreement

### Post-Judgment Forms
- **SC-103**: Request to Set Aside Default Judgment
- **SC-104**: Request to Correct or Vacate Judgment

## API Usage

### GET `/api/fetch-forms`
List all available forms or filter by category.

**Query Parameters:**
- `category` (optional): Filter by category (`filing`, `judgment`, `post-judgment`)
- `formId` (optional): Get specific form info

**Examples:**
```bash
# Get all forms
GET /api/fetch-forms

# Get only filing forms
GET /api/fetch-forms?category=filing

# Get specific form info
GET /api/fetch-forms?formId=SC-100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forms": [
      {
        "formId": "SC-100",
        "name": "Plaintiff's Claim and ORDER to Go to Small Claims Court",
        "description": "Form to file a small claims lawsuit",
        "url": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc100.pdf",
        "category": "filing"
      }
    ],
    "total": 8,
    "categories": ["filing", "judgment", "post-judgment"]
  }
}
```

### POST `/api/fetch-forms`
Fetch a specific PDF form from California Courts.

**Request Body:**
```json
{
  "formId": "SC-100",
  "download": false
}
```

**Parameters:**
- `formId` (required): The form ID to fetch (e.g., "SC-100")
- `download` (optional): If true, returns PDF directly for download

**Response:**
```json
{
  "success": true,
  "message": "Successfully fetched SC-100",
  "data": {
    "formId": "SC-100",
    "formName": "Plaintiff's Claim and ORDER to Go to Small Claims Court",
    "formDescription": "Form to file a small claims lawsuit",
    "category": "filing",
    "sourceUrl": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/sc100.pdf",
    "pdfBase64": "JVBERi0xLjQKJcOkw7zDtsO...",
    "fileSize": 309254,
    "fetchedAt": "2025-08-10T21:40:43.000Z"
  }
}
```

## Integration Examples

### Frontend Integration
```javascript
// Get all forms
const response = await fetch('/api/fetch-forms')
const { data } = await response.json()
console.log('Available forms:', data.forms)

// Fetch specific form
const pdfResponse = await fetch('/api/fetch-forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ formId: 'SC-100' })
})
const { data: pdfData } = await pdfResponse.json()

// Convert base64 to blob for download
const byteCharacters = atob(pdfData.pdfBase64)
const byteNumbers = new Array(byteCharacters.length)
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i)
}
const byteArray = new Uint8Array(byteNumbers)
const blob = new Blob([byteArray], { type: 'application/pdf' })

// Download the PDF
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = `${pdfData.formId}.pdf`
link.click()
window.URL.revokeObjectURL(url)
```

### Direct Download
```javascript
// Download PDF directly (no base64 conversion needed)
const response = await fetch('/api/fetch-forms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    formId: 'SC-100',
    download: true 
  })
})

// Response is the PDF file directly
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = 'SC-100.pdf'
link.click()
window.URL.revokeObjectURL(url)
```

## Testing
Run the test script to verify the API works:
```bash
node test-fetch-forms.js
```

This will test all endpoints and save a sample PDF to verify functionality.

## Error Handling
The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing formId)
- `404`: Form not found
- `500`: Server error (network issues, etc.)

## Notes
- All forms are fetched directly from the official California Courts website
- PDFs are cached by the courts server, so subsequent requests should be fast
- The API includes proper error handling and logging
- Forms are categorized for easy filtering
- Both JSON responses (with base64) and direct PDF downloads are supported 