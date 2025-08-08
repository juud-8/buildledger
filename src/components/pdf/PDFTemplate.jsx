import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  documentInfo: {
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  documentNumber: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  documentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  clientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  clientInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  clientDetails: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.4,
  },
  itemsTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellText: {
    fontSize: 10,
    color: '#4b5563',
  },
  itemDescription: {
    flex: 3,
  },
  itemQuantity: {
    flex: 1,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1.5,
    textAlign: 'right',
  },
  itemTotal: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalsSection: {
    alignSelf: 'flex-end',
    width: 200,
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 11,
    color: '#374151',
  },
  totalValue: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
  },
  finalTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notesSection: {
    marginTop: 30,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  statusBadge: {
    position: 'absolute',
    top: 100,
    right: 30,
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 4,
    transform: 'rotate(15deg)',
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const PDFTemplate = ({ 
  data, 
  type = 'quote', // 'quote' or 'invoice'
  companyInfo,
  logoUrl 
}) => {
  const isQuote = type === 'quote';
  const title = isQuote ? 'QUOTE' : 'INVOICE';
  const numberLabel = isQuote ? 'Quote #:' : 'Invoice #:';
  const dateLabel = isQuote ? 'Quote Date:' : 'Invoice Date:';
  
  // Precompute concatenated strings to avoid boolean/null children in <Text>
  const clientDetailsText = (() => {
    const clientName = data?.client?.name || 'Client Name';
    const companyName = data?.client?.company_name ? String(data.client.company_name) : '';
    const street = data?.client?.address?.street || 'Client Address';
    const city = data?.client?.address?.city || 'City';
    const state = data?.client?.address?.state || 'ST';
    const zip = data?.client?.address?.zip || '12345';
    const email = data?.client?.email ? `Email: ${data.client.email}` : '';
    const phone = data?.client?.phone ? `Phone: ${data.client.phone}` : '';

    return [
      clientName,
      companyName,
      street,
      `${city}, ${state} ${zip}`,
      email,
      phone,
    ]
      .filter((line) => Boolean(line) && line !== 'undefined')
      .join('\n');
  })();

  const projectDetailsText = (() => {
    if (!data?.project) return '';
    const name = data.project.name || '';
    const address = data.project.address || '';
    const description = data.project.description || '';
    return [name, address, description]
      .filter((line) => Boolean(line) && line !== 'undefined')
      .join('\n');
  })();
  
  // Safeguard primitive-only strings for react-pdf <Text>
  const safeText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {logoUrl && (
              <Image style={styles.logo} src={logoUrl} />
            )}
            <Text style={styles.companyName}>
              {safeText(companyInfo?.name || 'BuildLedger')}
            </Text>
            <Text style={styles.companyDetails}>
              {safeText(companyInfo?.address || '123 Construction St')}{'\n'}
              {safeText(companyInfo?.city || 'Builder City')}, {safeText(companyInfo?.state || 'ST')} {safeText(companyInfo?.zip || '12345')}{'\n'}
              {`Phone: ${safeText(companyInfo?.phone || '(555) 123-4567')}`}{'\n'}
              {`Email: ${safeText(companyInfo?.email || 'contact@buildledger.com')}`}
            </Text>
          </View>
          
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{safeText(title)}</Text>
            <Text style={styles.documentNumber}>
              {`${numberLabel} ${data?.quote_number || data?.invoice_number || ''}`}
            </Text>
            <Text style={styles.documentDate}>
              {`${dateLabel} ${formatDate(data?.created_at)}`}
            </Text>
            {!isQuote && data?.due_date && (
              <Text style={styles.documentDate}>
                {`Due Date: ${formatDate(data?.due_date)}`}
              </Text>
            )}
            {isQuote && data?.valid_until && (
              <Text style={styles.documentDate}>
                {`Valid Until: ${formatDate(data?.valid_until)}`}
              </Text>
            )}
          </View>
        </View>

        {/* Status Badge for Invoices */}
        {!isQuote && data?.status === 'overdue' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>OVERDUE</Text>
          </View>
        )}

        {/* Client Information */}
        <View style={styles.clientSection}>
          <View style={styles.clientInfo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.clientDetails}>{safeText(clientDetailsText)}</Text>
          </View>
          {projectDetailsText ? (
            <View style={styles.clientInfo}>
              <Text style={styles.sectionTitle}>Project:</Text>
              <Text style={styles.clientDetails}>{safeText(projectDetailsText)}</Text>
            </View>
          ) : null}
        </View>

        {/* Project Title and Description */}
        {data?.title && (
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 5 }]}>
              {data.title}
            </Text>
            {data?.description && (
              <Text style={styles.clientDetails}>
                {data.description}
              </Text>
            )}
          </View>
        )}

        {/* Items Table */}
        <View style={styles.itemsTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.itemDescription}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.itemQuantity}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.itemPrice}>
              <Text style={styles.tableHeaderText}>Unit Price</Text>
            </View>
            <View style={styles.itemTotal}>
              <Text style={styles.tableHeaderText}>Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {(data?.items || []).filter(Boolean).map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.itemDescription}>
                <Text style={styles.tableCellText}>{item.name || item.description}</Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.tableCellText}>{item.quantity}</Text>
              </View>
              <View style={styles.itemPrice}>
                <Text style={styles.tableCellText}>{formatCurrency(item.unit_price)}</Text>
              </View>
              <View style={styles.itemTotal}>
                <Text style={styles.tableCellText}>{formatCurrency(item.total_price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data?.subtotal)}</Text>
          </View>
          
          {data?.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(data?.tax_amount)}</Text>
            </View>
          )}
          
          {data?.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(data?.discount_amount)}</Text>
            </View>
          )}
          
          <View style={styles.finalTotalRow}>
            <Text style={styles.finalTotalLabel}>Total:</Text>
            <Text style={styles.finalTotalValue}>
              {formatCurrency(data?.total_amount || data?.amount)}
            </Text>
          </View>

          {!isQuote && data?.paid_amount > 0 ? (
            <View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Paid:</Text>
                <Text style={styles.totalValue}>-{formatCurrency(data?.paid_amount)}</Text>
              </View>
              <View style={styles.finalTotalRow}>
                <Text style={styles.finalTotalLabel}>Balance Due:</Text>
                <Text style={styles.finalTotalValue}>
                  {formatCurrency((data?.total_amount || data?.amount) - (data?.paid_amount || 0))}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Notes Section */}
        {data?.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Payment Terms for Invoices */}
        {!isQuote && data?.payment_terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Payment Terms:</Text>
            <Text style={styles.notesText}>{data.payment_terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by BuildLedger - {formatDate(new Date().toISOString())}
          </Text>
          <Text style={styles.footerText}>
            Page 1 of 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFTemplate;