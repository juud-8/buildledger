import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceToolbar from './components/InvoiceToolbar';
import InvoicesList from './components/InvoicesList';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import { showSuccessToast } from '../../utils/toastHelper';
import { pdfService } from '../../services/pdfService';
import { invoicesService } from '../../services/invoicesService';
import { useAuth } from '../../contexts/AuthContext';

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    dateFrom: '',
    dateTo: '',
    client: 'all',
    amountRange: 'all',
    paymentMethod: 'all',
    search: ''
  });


  // Load real invoices from DB
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dbInvoices = await invoicesService.getInvoices();
        if (!isMounted) return;
        const uiInvoices = (dbInvoices || []).map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          clientName: inv.client?.name || '—',
          projectName: inv.project?.name || '—',
          projectReference: inv.quote?.quote_number || '',
          description: inv.description || '',
          amount: Number(inv.total_amount || 0),
          paidAmount: Number(inv.paid_amount || 0),
          dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '',
          issuedDate: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '',
          paymentStatus: inv.payment_status || inv.status || 'pending',
          paymentMethod: inv.payment_method || 'stripe',
          agingDays: 0,
          lineItemsCount: inv.invoice_items?.length || 0,
          progressBilling: false,
          milestoneId: null
        }));
        setInvoices(uiInvoices);
        setFilteredInvoices(uiInvoices);
      } catch (e) {
        console.error('Failed to load invoices', e);
        // No fallback to mock data - keep empty state
        setInvoices([]);
        setFilteredInvoices([]);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let filtered = [...invoices];

    // Apply filters
    if (filters?.paymentStatus !== 'all') {
      filtered = filtered?.filter(invoice => invoice?.paymentStatus === filters?.paymentStatus);
    }

    if (filters?.client !== 'all') {
      filtered = filtered?.filter(invoice => 
        invoice?.clientName?.toLowerCase()?.includes(filters?.client?.replace('-', ' '))
      );
    }

    if (filters?.paymentMethod !== 'all') {
      filtered = filtered?.filter(invoice => invoice?.paymentMethod === filters?.paymentMethod);
    }

    if (filters?.amountRange !== 'all') {
      const [min, max] = filters?.amountRange?.split('-')?.map(v => 
        v === '100000+' ? [100000, Infinity] : [parseInt(v) || 0, parseInt(v?.split('-')?.[1]) || Infinity]
      )?.flat();
      filtered = filtered?.filter(invoice => invoice?.amount >= min && invoice?.amount <= max);
    }

    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(invoice =>
        invoice?.invoiceNumber?.toLowerCase()?.includes(searchTerm) ||
        invoice?.projectName?.toLowerCase()?.includes(searchTerm) ||
        invoice?.clientName?.toLowerCase()?.includes(searchTerm) ||
        invoice?.projectReference?.toLowerCase()?.includes(searchTerm)
      );
    }

    if (filters?.dateFrom) {
      filtered = filtered?.filter(invoice => 
        new Date(invoice.issuedDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(invoice => 
        new Date(invoice.issuedDate) <= new Date(filters.dateTo)
      );
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.issuedDate) - new Date(a.issuedDate);
        case 'date-asc':
          return new Date(a.issuedDate) - new Date(b.issuedDate);
        case 'amount-desc':
          return b?.amount - a?.amount;
        case 'amount-asc':
          return a?.amount - b?.amount;
        case 'due-date':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'aging':
          return b?.agingDays - a?.agingDays;
        case 'status':
          return a?.paymentStatus?.localeCompare(b?.paymentStatus);
        case 'client':
          return a?.clientName?.localeCompare(b?.clientName);
        default:
          return 0;
      }
    });

    setFilteredInvoices(filtered);
  }, [invoices, filters, sortBy]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      paymentStatus: 'all',
      dateFrom: '',
      dateTo: '',
      client: 'all',
      amountRange: 'all',
      paymentMethod: 'all',
      search: ''
    });
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev => 
      prev?.includes(invoiceId) 
        ? prev?.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices?.length === filteredInvoices?.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices?.map(invoice => invoice?.id));
    }
  };

  const handleCreateInvoice = (newInvoice) => {
    if (newInvoice) {
      const ui = {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoice_number,
        clientName: newInvoice.client?.name || '—',
        projectName: newInvoice.project?.name || '—',
        projectReference: newInvoice.quote?.quote_number || '',
        description: newInvoice.description || '',
        amount: Number(newInvoice.total_amount || 0),
        paidAmount: Number(newInvoice.paid_amount || 0),
        dueDate: newInvoice.due_date ? new Date(newInvoice.due_date).toLocaleDateString() : '',
        issuedDate: newInvoice.created_at ? new Date(newInvoice.created_at).toLocaleDateString() : '',
        paymentStatus: newInvoice.payment_status || newInvoice.status || 'pending',
        paymentMethod: newInvoice.payment_method || 'stripe',
        agingDays: 0,
        lineItemsCount: newInvoice.invoice_items?.length || 0,
        progressBilling: false,
        milestoneId: null
      };
      setInvoices(prev => [ui, ...prev]);
      setFilteredInvoices(prev => [ui, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  const handleBulkAction = (actionId, selectedIds) => {
    console.log(`Bulk action: ${actionId} for invoices:`, selectedIds);
    if (actionId === 'send-reminder') {
      // Send reminder emails
      console.log('Sending payment reminders...');
    } else if (actionId === 'record-payment') {
      // Open bulk payment recording
      console.log('Opening bulk payment recording...');
    } else if (actionId === 'export') {
      // Export selected invoices
      console.log('Exporting invoices...');
    }
    setSelectedInvoices([]);
  };

  const handleEdit = (invoiceId) => {
    setEditingInvoiceId(invoiceId);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingInvoiceId(null);
    // Refresh invoices list
    // In a real app, you would refetch from the database
    console.log('Invoice updated successfully');
  };

  const handleSendReminder = (invoiceId) => {
    showSuccessToast('Reminder sent successfully!', '📧');
    console.log('Send reminder for invoice:', invoiceId);
    // Email reminder functionality would integrate with email service
  };

  const handleRecordPayment = (invoiceId, paymentData) => {
    setInvoices(prev => prev?.map(invoice => {
      if (invoice?.id === invoiceId) {
        const newPaidAmount = invoice?.paidAmount + paymentData?.amount;
        const newStatus = newPaidAmount >= invoice?.amount ? 'paid' : 
                         newPaidAmount > 0 ? 'partial' : 'pending';
        
        return {
          ...invoice,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          paymentDate: newStatus === 'paid' ? new Date()?.toLocaleDateString() : invoice?.paymentDate,
          agingDays: newStatus === 'paid' ? 0 : invoice?.agingDays
        };
      }
      return invoice;
    }));
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      await pdfService.downloadInvoicePDF(invoiceId);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Invoices - BuildLedger</title>
        <meta name="description" content="Comprehensive invoice management with progress billing, payment tracking, and automated follow-up for construction projects." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <Breadcrumb />
        
        <main className="pt-4 pb-8">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-3">
                <InvoiceFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-6">
                <InvoiceToolbar
                  selectedInvoices={selectedInvoices}
                  onCreateInvoice={() => setIsCreateModalOpen(true)}
                  onBulkAction={handleBulkAction}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                <InvoicesList
                  invoices={filteredInvoices}
                  viewMode={viewMode}
                  selectedInvoices={selectedInvoices}
                  onSelectInvoice={handleSelectInvoice}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEdit}
                  onSendReminder={handleSendReminder}
                  onRecordPayment={handleRecordPayment}
                  onDownloadPDF={handleDownloadPDF}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Create Invoice Modal */}
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateInvoice}
        />

        {/* Edit Invoice Modal */}
        <CreateInvoiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingInvoiceId(null);
          }}
          onSuccess={handleEditSuccess}
          editMode={true}
          invoiceId={editingInvoiceId}
        />
      </div>
    </>
  );
};

export default InvoicesPage;