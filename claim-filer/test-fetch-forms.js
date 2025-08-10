// Test script for the fetch-forms endpoint
async function testFetchForms() {
  const baseUrl = 'http://localhost:3000/api/fetch-forms'
  
  console.log('🧪 Testing California Small Claims Forms Fetching API...\n')
  
  try {
    // Test 1: Get all forms
    console.log('1️⃣ Testing GET /api/fetch-forms (all forms)')
    const allFormsResponse = await fetch(baseUrl)
    const allForms = await allFormsResponse.json()
    
    if (allFormsResponse.ok) {
      console.log('✅ Success:', allForms.data.total, 'forms found')
      console.log('📋 Categories:', allForms.data.categories.join(', '))
      console.log('📄 Forms:', allForms.data.forms.map(f => `${f.formId}: ${f.name}`).join('\n   '))
    } else {
      console.log('❌ Error:', allForms.error)
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test 2: Get forms by category
    console.log('2️⃣ Testing GET /api/fetch-forms?category=filing')
    const filingFormsResponse = await fetch(`${baseUrl}?category=filing`)
    const filingForms = await filingFormsResponse.json()
    
    if (filingFormsResponse.ok) {
      console.log('✅ Success:', filingForms.data.total, 'filing forms found')
      filingForms.data.forms.forEach(form => {
        console.log(`   📄 ${form.formId}: ${form.name}`)
      })
    } else {
      console.log('❌ Error:', filingForms.error)
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test 3: Get specific form info
    console.log('3️⃣ Testing GET /api/fetch-forms?formId=SC-100')
    const sc100InfoResponse = await fetch(`${baseUrl}?formId=SC-100`)
    const sc100Info = await sc100InfoResponse.json()
    
    if (sc100InfoResponse.ok) {
      console.log('✅ Success: SC-100 form info retrieved')
      console.log(`   📄 Name: ${sc100Info.data.name}`)
      console.log(`   📝 Description: ${sc100Info.data.description}`)
      console.log(`   🏷️ Category: ${sc100Info.data.category}`)
      console.log(`   🔗 URL: ${sc100Info.data.url}`)
    } else {
      console.log('❌ Error:', sc100Info.error)
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test 4: Fetch SC-100 PDF
    console.log('4️⃣ Testing POST /api/fetch-forms (fetch SC-100 PDF)')
    const fetchPDFResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: 'SC-100',
        download: false
      })
    })
    
    const fetchPDFResult = await fetchPDFResponse.json()
    
    if (fetchPDFResponse.ok) {
      console.log('✅ Success: SC-100 PDF fetched from California Courts')
      console.log(`   📄 Form: ${fetchPDFResult.data.formName}`)
      console.log(`   📊 File Size: ${fetchPDFResult.data.fileSize} bytes`)
      console.log(`   🕒 Fetched At: ${fetchPDFResult.data.fetchedAt}`)
      console.log(`   🔗 Source: ${fetchPDFResult.data.sourceUrl}`)
      console.log(`   📋 Base64 Length: ${fetchPDFResult.data.pdfBase64.length} characters`)
      
      // Save the PDF to verify it's valid
      const fs = require('fs')
      const buffer = Buffer.from(fetchPDFResult.data.pdfBase64, 'base64')
      fs.writeFileSync('fetched-sc100-form.pdf', buffer)
      console.log('💾 PDF saved as fetched-sc100-form.pdf')
      
    } else {
      console.log('❌ Error:', fetchPDFResult.error)
      if (fetchPDFResult.details) {
        console.log('   Details:', fetchPDFResult.details)
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Test 5: Test error handling
    console.log('5️⃣ Testing error handling (invalid form ID)')
    const invalidFormResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: 'SC-999',
        download: false
      })
    })
    
    const invalidFormResult = await invalidFormResponse.json()
    
    if (!invalidFormResponse.ok) {
      console.log('✅ Success: Properly handled invalid form ID')
      console.log(`   ❌ Error: ${invalidFormResult.error}`)
    } else {
      console.log('❌ Unexpected: Should have returned an error for invalid form ID')
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    console.log('🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the tests
testFetchForms() 