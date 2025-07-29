import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Invoice, InvoiceItem } from '@/lib/types'

interface InvoicePDFProps {
  invoice: Invoice & {
    clients?: { name: string; email?: string; phone?: string; address?: string }
    invoice_items?: InvoiceItem[]
  }
}

// Register a default font
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  invoiceInfo: {
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6b7280'
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  clientInfo: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.5
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold'
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableCellLast: {
    borderRightWidth: 0
  },
  description: {
    width: '40%',
    textAlign: 'left'
  },
  quantity: {
    width: '15%',
    textAlign: 'right'
  },
  rate: {
    width: '20%',
    textAlign: 'right'
  },
  amount: {
    width: '25%',
    textAlign: 'right'
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #e5e7eb'
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 20
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280'
  }
})

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BuildLedger</Text>
            <Text style={{ fontSize: 10, color: '#6b7280', marginTop: 5 }}>
              Contractor Financial Command Center
            </Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>
              {invoice.invoice_number || `Invoice #${invoice.id.slice(0, 8)}`}
            </Text>
            <Text style={styles.invoiceDate}>
              Date: {formatDate(invoice.created_at)}
            </Text>
            {invoice.due_date && (
              <Text style={styles.invoiceDate}>
                Due: {formatDate(invoice.due_date)}
              </Text>
            )}
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <View style={styles.clientInfo}>
            <Text>{invoice.clients?.name || 'No Client'}</Text>
            {invoice.clients?.email && <Text>{invoice.clients.email}</Text>}
            {invoice.clients?.phone && <Text>{invoice.clients.phone}</Text>}
            {invoice.clients?.address && <Text>{invoice.clients.address}</Text>}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.section}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.description]}>Description</Text>
              <Text style={[styles.tableCell, styles.quantity]}>Qty</Text>
              <Text style={[styles.tableCell, styles.rate]}>Rate</Text>
              <Text style={[styles.tableCell, styles.amount, styles.tableCellLast]}>Amount</Text>
            </View>

            {/* Table Body */}
            {invoice.invoice_items?.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.description]}>
                  {item.description}
                </Text>
                <Text style={[styles.tableCell, styles.quantity]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, styles.rate]}>
                  {formatCurrency(item.rate)}
                </Text>
                <Text style={[styles.tableCell, styles.amount, styles.tableCellLast]}>
                  {formatCurrency(item.quantity * item.rate)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! | BuildLedger - Professional Contractor Management
        </Text>
      </Page>
    </Document>
  )
} 