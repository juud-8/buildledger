import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoice, companyInfo = {}) => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set default font
  doc.setFont('helvetica');
  
  // Company/Header Information
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;
  
  // Company Logo/Name
  doc.setFontSize(24);
  doc.setTextColor(33, 37, 41);
  doc.text(companyInfo.name || 'BuildLedger', 20, yPosition);
  yPosition += 10;
  
  // Company Details
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  if (companyInfo.address) {
    doc.text(companyInfo.address, 20, yPosition);
    yPosition += 5;
  }
  if (companyInfo.phone) {
    doc.text(`Phone: ${companyInfo.phone}`, 20, yPosition);
    yPosition += 5;
  }
  if (companyInfo.email) {
    doc.text(`Email: ${companyInfo.email}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Invoice Title
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });
  
  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Invoice #: ${invoice.invoiceNumber || invoice.invoice_number || 'N/A'}`, pageWidth - 20, 40, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.issuedDate || invoice.created_at)}`, pageWidth - 20, 45, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate || invoice.due_date)}`, pageWidth - 20, 50, { align: 'right' });
  
  // Add a line separator
  yPosition = Math.max(yPosition + 10, 60);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;
  
  // Bill To Section
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.clientName || invoice.client?.name || 'N/A', 20, yPosition);
  yPosition += 5;
  
  if (invoice.clientEmail || invoice.client?.email) {
    doc.text(invoice.clientEmail || invoice.client.email, 20, yPosition);
    yPosition += 5;
  }
  
  if (invoice.clientPhone || invoice.client?.phone) {
    doc.text(invoice.clientPhone || invoice.client.phone, 20, yPosition);
    yPosition += 5;
  }
  
  if (invoice.clientAddress || invoice.client?.address) {
    const address = invoice.clientAddress || invoice.client.address;
    if (typeof address === 'object') {
      const addressStr = `${address.street || ''} ${address.city || ''} ${address.state || ''} ${address.zip || ''}`.trim();
      if (addressStr) {
        doc.text(addressStr, 20, yPosition);
        yPosition += 5;
      }
    } else if (typeof address === 'string') {
      doc.text(address, 20, yPosition);
      yPosition += 5;
    }
  }
  
  // Project Information
  if (invoice.projectName || invoice.project?.name) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.projectName || invoice.project.name, 50, yPosition);
    yPosition += 5;
  }
  
  // Description
  if (invoice.description) {
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 20, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    
    // Wrap long descriptions
    const splitDescription = doc.splitTextToSize(invoice.description, pageWidth - 40);
    doc.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 5 + 5;
  }
  
  // Line Items Table
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  // Table Headers
  const tableStartY = yPosition;
  doc.text('Item', 20, yPosition);
  doc.text('Qty', 100, yPosition);
  doc.text('Unit Price', 120, yPosition);
  doc.text('Total', 160, yPosition);
  
  // Draw header line
  yPosition += 2;
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;
  
  // Table Content
  doc.setFont('helvetica', 'normal');
  
  // Get line items
  const lineItems = invoice.lineItems || invoice.invoice_items || invoice.items || [];
  
  if (lineItems.length > 0) {
    lineItems.forEach(item => {
      const itemName = item.name || item.item?.name || 'Item';
      const quantity = item.quantity || 1;
      const unitPrice = item.unit_price || item.unitPrice || 0;
      const totalPrice = item.total_price || item.totalPrice || (quantity * unitPrice);
      
      // Wrap long item names
      const splitName = doc.splitTextToSize(itemName, 75);
      doc.text(splitName, 20, yPosition);
      doc.text(quantity.toString(), 100, yPosition);
      doc.text(`$${unitPrice.toFixed(2)}`, 120, yPosition);
      doc.text(`$${totalPrice.toFixed(2)}`, 160, yPosition);
      
      yPosition += Math.max(splitName.length * 5, 5) + 2;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
    });
  } else {
    // If no line items, show the total amount directly
    doc.text('Invoice Services', 20, yPosition);
    doc.text('1', 100, yPosition);
    doc.text(`$${(invoice.amount || 0).toFixed(2)}`, 120, yPosition);
    doc.text(`$${(invoice.amount || 0).toFixed(2)}`, 160, yPosition);
    yPosition += 7;
  }
  
  // Draw line before totals
  yPosition += 5;
  doc.line(100, yPosition, pageWidth - 20, yPosition);
  yPosition += 7;
  
  // Totals Section
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  const subtotal = invoice.subtotal || invoice.amount || 
    lineItems.reduce((sum, item) => sum + (item.total_price || item.totalPrice || 0), 0);
  doc.text('Subtotal:', 120, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, 160, yPosition);
  yPosition += 5;
  
  // Tax
  const taxAmount = invoice.tax_amount || invoice.taxAmount || 0;
  const taxRate = invoice.tax_rate || invoice.taxRate || 0;
  if (taxAmount > 0 || taxRate > 0) {
    doc.text(`Tax (${taxRate}%):`, 120, yPosition);
    doc.text(`$${taxAmount.toFixed(2)}`, 160, yPosition);
    yPosition += 5;
  }
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const total = invoice.total_amount || invoice.totalAmount || (subtotal + taxAmount);
  doc.text('Total:', 120, yPosition);
  doc.text(`$${total.toFixed(2)}`, 160, yPosition);
  yPosition += 10;
  
  // Payment Status
  if (invoice.paymentStatus || invoice.status) {
    yPosition += 5;
    doc.setFontSize(10);
    const status = invoice.paymentStatus || invoice.status;
    const statusColor = getStatusColor(status);
    doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    doc.text(`Status: ${status.toUpperCase()}`, 20, yPosition);
    doc.setTextColor(33, 37, 41);
  }
  
  // Notes
  if (invoice.notes) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(33, 37, 41);
    doc.text('Notes:', 20, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPosition);
  }
  
  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth / 2, footerY + 5, { align: 'center' });
  
  return doc;
};

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date; // Return as-is if not a valid date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to get status color
const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'paid':
      return { r: 34, g: 197, b: 94 }; // Green
    case 'pending':
      return { r: 251, g: 146, b: 60 }; // Orange
    case 'overdue':
      return { r: 239, g: 68, b: 68 }; // Red
    case 'partial':
      return { r: 59, g: 130, b: 246 }; // Blue
    default:
      return { r: 108, g: 117, b: 125 }; // Gray
  }
};

// Function to download the PDF
export const downloadInvoicePDF = (invoice, companyInfo = {}) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  const fileName = `invoice_${invoice.invoiceNumber || invoice.invoice_number || 'document'}.pdf`;
  doc.save(fileName);
};

// Function to get PDF as blob (useful for preview or email)
export const getInvoicePDFBlob = (invoice, companyInfo = {}) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  return doc.output('blob');
};

// Function to get PDF as base64 (useful for storing or sending)
export const getInvoicePDFBase64 = (invoice, companyInfo = {}) => {
  const doc = generateInvoicePDF(invoice, companyInfo);
  return doc.output('datauristring');
}; 