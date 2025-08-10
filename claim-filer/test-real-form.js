// Test the real form filling with cleaned PDF
const testData = {
  firstName: "John",
  lastName: "Doe", 
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  company: "123 Main Street, San Francisco, CA 94102",
  position: "Software Engineer",
  documentType: "nda",
  agreementType: "mutual",
  effectiveDate: "2024-01-01",
  expirationDate: "2025-01-01",
  confidentialInfo: "Breach of non-disclosure agreement regarding proprietary software and trade secrets",
  additionalTerms: "Seeking damages of $5000 for violation of confidentiality terms",
  signature: "John Doe",
  agreeToTerms: true
};

async function testRealFormFilling() {
  try {
    console.log('🧪 Testing real PDF form filling...');
    
    const response = await fetch('http://localhost:3000/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', result.message);
      console.log('📋 Fields filled:', result.data.fieldsFilled);
      
      if (result.data.pdfBase64) {
        // Save PDF to file for inspection
        const fs = require('fs');
        const buffer = Buffer.from(result.data.pdfBase64, 'base64');
        fs.writeFileSync('filled-sc100-form.pdf', buffer);
        console.log('📄 Filled PDF saved as filled-sc100-form.pdf');
        console.log('🎉 Open this file to see the filled form fields!');
      }
    } else {
      console.error('❌ Error:', result.error);
      if (result.details) console.error('Details:', result.details);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testRealFormFilling();