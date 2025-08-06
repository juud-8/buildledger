// Simple test to verify PDF generation works
import { pdfService } from './src/services/pdfService.js';

// Mock data for testing
const mockQuoteData = {
  id: 'test-quote-1',
  quote_number: 'Q-0001',
  title: 'Test Quote - Kitchen Renovation',
  description: 'Complete kitchen remodel including cabinets, countertops, and appliances.',
  created_at: new Date().toISOString(),
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  subtotal: 25000,
  tax_amount: 2250,
  total_amount: 27250,
  notes: 'All materials included. Labor warranty: 2 years.',
  client: {
    name: 'John Smith',
    company_name: 'Smith Residence',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zip: '90210'
    }
  },
  project: {
    name: 'Kitchen Renovation Project',
    address: '123 Main Street, Anytown, CA',
    description: 'Complete kitchen remodel'
  },
  items: [
    {
      name: 'Custom Kitchen Cabinets',
      quantity: 1,
      unit_price: 15000,
      total_price: 15000
    },
    {
      name: 'Granite Countertops',
      quantity: 45,
      unit_price: 120,
      total_price: 5400
    },
    {
      name: 'Kitchen Appliance Package',
      quantity: 1,
      unit_price: 4600,
      total_price: 4600
    }
  ]
};

async function testPDFGeneration() {
  try {
    console.log('🧪 Testing PDF generation...');
    
    const blob = await pdfService.generatePDFBlob(mockQuoteData, 'quote');
    
    if (blob && blob.size > 0) {
      console.log('✅ PDF generated successfully!');
      console.log(`📄 PDF size: ${(blob.size / 1024).toFixed(2)} KB`);
      console.log('📋 PDF MIME type:', blob.type);
      
      // Test filename generation
      console.log('📝 Testing mobile filename generation...');
      const { generateMobileFilename } = await import('./src/utils/mobileUtils.js');
      const filename = generateMobileFilename('Quote', 'QT', 'Q-0001');
      console.log('📋 Generated filename:', filename);
      
      console.log('🎉 All PDF tests passed!');
    } else {
      console.log('❌ PDF generation failed - empty blob');
    }
  } catch (error) {
    console.error('❌ PDF generation test failed:', error.message);
  }
}

testPDFGeneration();