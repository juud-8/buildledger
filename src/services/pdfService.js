import { pdf } from '@react-pdf/renderer';
import PDFTemplate from '../components/pdf/PDFTemplate';
import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toastHelper';
import { handleMobilePDFDownload, generateMobileFilename, isMobileDevice } from '../utils/mobileUtils';

class PDFService {
  constructor() {
    this.defaultCompanyInfo = {
      name: 'BuildLedger',
      address: '123 Construction Street',
      city: 'Builder City',
      state: 'ST',
      zip: '12345',
      phone: '(555) 123-4567',
      email: 'contact@buildledger.com'
    };
  }

  // Get company information from database
  async getCompanyInfo() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('No user found, using default company info');
        return this.defaultCompanyInfo;
      }

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        console.warn('No company profile found, using default company info');
        return this.defaultCompanyInfo;
      }

      const companyId = userProfile.company_id;

      // Get company information from company profile
      // First check if companies table exists, fallback to user profile data
      let companyData = null;
      try {
        const { data, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
        
        if (!companyError && data) {
          companyData = data;
        }
      } catch (error) {
        // Companies table might not exist, try to get data from user profiles
        console.warn('Companies table not accessible, checking user profile for company data');
      }

      // If no company data from companies table, try user profile metadata
      if (!companyData) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();
        
        if (profileData?.metadata?.company) {
          companyData = profileData.metadata.company;
        }
      }

      if (!companyData) {
        console.warn('No company data found, using default company info');
        return this.defaultCompanyInfo;
      }

      return {
        name: companyData.name || this.defaultCompanyInfo.name,
        address: companyData.address || this.defaultCompanyInfo.address,
        city: companyData.city || this.defaultCompanyInfo.city,
        state: companyData.state || this.defaultCompanyInfo.state,
        zip: companyData.zip || this.defaultCompanyInfo.zip,
        phone: companyData.phone || this.defaultCompanyInfo.phone,
        email: companyData.email || this.defaultCompanyInfo.email,
        logo_url: companyData.logo_url
      };
    } catch (error) {
      console.error('Error fetching company info:', error);
      return this.defaultCompanyInfo;
    }
  }

  // Get company logo URL
  async getLogoUrl() {
    try {
      const companyInfo = await this.getCompanyInfo();
      if (companyInfo.logo_url) {
        // If it's a Supabase storage URL, get the public URL
        if (companyInfo.logo_url.startsWith('company-logos/')) {
          const { data } = supabase.storage
            .from('company-assets')
            .getPublicUrl(companyInfo.logo_url);
          return data?.publicUrl;
        }
        return companyInfo.logo_url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo URL:', error);
      return null;
    }
  }

  // Get complete quote data with items and client information
  async getQuoteData(quoteId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // Get quote with client and project information
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(*),
          project:projects(*)
        `)
        .eq('company_id', companyId)
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Get quote items
      const { data: items, error: itemsError } = await supabase
        .from('quote_items')
        .select(`
          *,
          item:items_database(name, description)
        `)
        .eq('quote_id', quoteId)
        .order('created_at');

      if (itemsError) throw itemsError;

      // Format items for PDF
      const formattedItems = items?.map(item => ({
        name: item.item?.name || item.name || item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })) || [];

      return {
        ...quote,
        items: formattedItems
      };
    } catch (error) {
      console.error('Error fetching quote data:', error);
      throw error;
    }
  }

  // Get complete invoice data with items and client information
  async getInvoiceData(invoiceId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // Get invoice with client and project information
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          project:projects(*)
        `)
        .eq('company_id', companyId)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Get invoice items
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          item:items_database(name, description)
        `)
        .eq('invoice_id', invoiceId)
        .order('created_at');

      if (itemsError) throw itemsError;

      // Format items for PDF
      const formattedItems = items?.map(item => ({
        name: item.item?.name || item.name || item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })) || [];

      return {
        ...invoice,
        items: formattedItems
      };
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      throw error;
    }
  }

  // Generate and download quote PDF
  async downloadQuotePDF(quoteId) {
    try {
      const loadingMessage = isMobileDevice() 
        ? 'Generating quote PDF... This may take a moment on mobile devices.' 
        : 'Generating quote PDF...';
      showInfoToast(loadingMessage, '📄');
      
      // Get all required data
      const [quoteData, companyInfo, logoUrl] = await Promise.all([
        this.getQuoteData(quoteId),
        this.getCompanyInfo(),
        this.getLogoUrl()
      ]);

      // Generate PDF blob (react-pdf expects a React element)
      const blob = await pdf(
        <PDFTemplate
          data={quoteData}
          type="quote"
          companyInfo={companyInfo}
          logoUrl={logoUrl}
        />
      ).toBlob();

      // Generate mobile-friendly filename
      const filename = generateMobileFilename(
        'Quote',
        'QT',
        quoteData.quote_number || quoteId
      );

      // Handle download with mobile-specific logic
      handleMobilePDFDownload(blob, filename, showInfoToast);
      
      showSuccessToast('Quote PDF generated successfully!', '✅');
    } catch (error) {
      console.error('Error generating quote PDF:', error);
      showErrorToast('Failed to generate quote PDF', error);
      throw error;
    }
  }

  // Generate and download invoice PDF
  async downloadInvoicePDF(invoiceId) {
    try {
      const loadingMessage = isMobileDevice() 
        ? 'Generating invoice PDF... This may take a moment on mobile devices.' 
        : 'Generating invoice PDF...';
      showInfoToast(loadingMessage, '📄');
      
      // Get all required data
      const [invoiceData, companyInfo, logoUrl] = await Promise.all([
        this.getInvoiceData(invoiceId),
        this.getCompanyInfo(),
        this.getLogoUrl()
      ]);

      // Generate PDF blob (react-pdf expects a React element)
      const blob = await pdf(
        <PDFTemplate
          data={invoiceData}
          type="invoice"
          companyInfo={companyInfo}
          logoUrl={logoUrl}
        />
      ).toBlob();

      // Generate mobile-friendly filename
      const filename = generateMobileFilename(
        'Invoice',
        'INV',
        invoiceData.invoice_number || invoiceId
      );

      // Handle download with mobile-specific logic
      handleMobilePDFDownload(blob, filename, showInfoToast);
      
      showSuccessToast('Invoice PDF generated successfully!', '✅');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      showErrorToast('Failed to generate invoice PDF', error);
      throw error;
    }
  }

  // Generate PDF blob (for preview or other uses)
  async generatePDFBlob(data, type = 'quote') {
    try {
      const [companyInfo, logoUrl] = await Promise.all([
        this.getCompanyInfo(),
        this.getLogoUrl()
      ]);

      return await pdf(
        <PDFTemplate
          data={data}
          type={type}
          companyInfo={companyInfo}
          logoUrl={logoUrl}
        />
      ).toBlob();
    } catch (error) {
      console.error('Error generating PDF blob:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pdfService = new PDFService();
export default pdfService;