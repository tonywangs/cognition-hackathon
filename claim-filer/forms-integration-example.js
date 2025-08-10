// Example: How to integrate the forms API with your existing form system

// 1. Add a form selector to your existing form
async function addFormSelector() {
  // Fetch available forms
  const response = await fetch('/api/fetch-forms')
  const { data } = await response.json()
  
  // Create form selector
  const formSelector = document.createElement('select')
  formSelector.id = 'formType'
  
  // Add options
  data.forms.forEach(form => {
    const option = document.createElement('option')
    option.value = form.formId
    option.textContent = `${form.formId}: ${form.name}`
    formSelector.appendChild(option)
  })
  
  // Add to your form
  document.getElementById('formContainer').appendChild(formSelector)
}

// 2. Modify your existing form submission to use fresh PDFs
async function submitFormWithFreshPDF(formData) {
  try {
    // First, fetch the fresh PDF from California Courts
    const pdfResponse = await fetch('/api/fetch-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        formId: formData.formType || 'SC-100',
        download: false 
      })
    })
    
    const pdfData = await pdfResponse.json()
    
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfData.error}`)
    }
    
    // Now use the fresh PDF with your existing form filling logic
    const fillResponse = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        freshPdfBase64: pdfData.data.pdfBase64 // Pass the fresh PDF to your existing endpoint
      })
    })
    
    return await fillResponse.json()
    
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// 3. Add a "Download Blank Form" feature
async function downloadBlankForm(formId = 'SC-100') {
  try {
    const response = await fetch('/api/fetch-forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        formId,
        download: true 
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to download form')
    }
    
    // Download the PDF directly
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log(`✅ Downloaded blank ${formId} form`)
    
  } catch (error) {
    console.error('❌ Download failed:', error)
  }
}

// 4. Example React component integration
function FormsIntegrationExample() {
  const [forms, setForms] = useState([])
  const [selectedForm, setSelectedForm] = useState('SC-100')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Load available forms on component mount
    fetch('/api/fetch-forms')
      .then(res => res.json())
      .then(({ data }) => setForms(data.forms))
      .catch(console.error)
  }, [])
  
  const handleDownloadBlank = async () => {
    setLoading(true)
    try {
      await downloadBlankForm(selectedForm)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3>Form Selection</h3>
      
      <select 
        value={selectedForm} 
        onChange={(e) => setSelectedForm(e.target.value)}
        className="w-full p-2 border rounded"
      >
        {forms.map(form => (
          <option key={form.formId} value={form.formId}>
            {form.formId}: {form.name}
          </option>
        ))}
      </select>
      
      <div className="flex gap-2">
        <button 
          onClick={handleDownloadBlank}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Downloading...' : 'Download Blank Form'}
        </button>
        
        <button 
          onClick={() => console.log('Use this form for filling')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Use This Form
        </button>
      </div>
      
      {selectedForm && (
        <div className="p-4 bg-gray-100 rounded">
          <h4>Selected Form: {selectedForm}</h4>
          <p>{forms.find(f => f.formId === selectedForm)?.description}</p>
        </div>
      )}
    </div>
  )
}

// 5. Example: Modify your existing submit-form endpoint to use fresh PDFs
/*
// In your /api/submit-form/route.ts, you could add:

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json()
    
    // Check if a fresh PDF was provided
    if (formData.freshPdfBase64) {
      // Use the fresh PDF instead of the local one
      const existingPdfBytes = Buffer.from(formData.freshPdfBase64, 'base64')
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      
      // ... rest of your existing form filling logic
    } else {
      // Fall back to your existing local PDF
      const pdfPath = path.join(process.cwd(), 'pdf', 'cleaned_sc100.pdf')
      const existingPdfBytes = await fs.readFile(pdfPath)
      const pdfDoc = await PDFDocument.load(existingPdfBytes)
      
      // ... rest of your existing form filling logic
    }
    
    // ... rest of your code
  } catch (error) {
    // ... error handling
  }
}
*/

// Export functions for use in your app
export {
  addFormSelector,
  submitFormWithFreshPDF,
  downloadBlankForm,
  FormsIntegrationExample
} 