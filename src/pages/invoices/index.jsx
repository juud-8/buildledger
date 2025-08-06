import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceToolbar from './components/InvoiceToolbar';
import InvoicesList from './components/InvoicesList';
import CreateInvoiceModal from './components/CreateInvoiceModal';

const InvoicesPage = () => {
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

  // Mock invoices data with payment-specific fields
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Residential Homes LLC',
      projectName: 'Kitchen Renovation - Phase 2',
      projectReference: 'PR-2024-005',
      description: 'Progress billing for kitchen renovation: cabinets installation and countertop work completed.',
      amount: 22500,
      paidAmount: 22500,
      dueDate: '02/15/2024',
      issuedDate: '01/15/2024',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      paymentDate: '02/10/2024',
      agingDays: 0,
      lineItemsCount: 8,
      progressBilling: true,
      milestoneId: 'MS-001'
    },
    {
      id: 'INV-2024-002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Commercial Builders Inc',
      projectName: 'Office Complex Foundation',
      projectReference: 'PR-2024-012',
      description: 'Foundation work completion billing including excavation, concrete pouring, and waterproofing.',
      amount: 75000,
      paidAmount: 0,
      dueDate: '02/20/2024',
      issuedDate: '01/20/2024',
      paymentStatus: 'pending',
      paymentMethod: 'check',
      paymentDate: null,
      agingDays: 15,
      lineItemsCount: 12,
      progressBilling: false,
      milestoneId: null
    },
    {
      id: 'INV-2024-003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Green Construction Co',
      projectName: 'Bathroom Remodel - Materials',
      projectReference: 'PR-2024-008',
      description: 'Material costs for luxury bathroom fixtures, tiles, and plumbing components.',
      amount: 18750,
      paidAmount: 9375,
      dueDate: '01/25/2024',
      issuedDate: '12/25/2023',
      paymentStatus: 'partial',
      paymentMethod: 'ach',
      paymentDate: '01/15/2024',
      agingDays: 45,
      lineItemsCount: 15,
      progressBilling: true,
      milestoneId: 'MS-003'
    },
    {
      id: 'INV-2024-004',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Urban Developers Group',
      projectName: 'Warehouse Steel Frame',
      projectReference: 'PR-2024-020',
      description: 'Steel frame construction and roofing work for new warehouse facility.',
      amount: 125000,
      paidAmount: 0,
      dueDate: '12/28/2023',
      issuedDate: '11/28/2023',
      paymentStatus: 'overdue',
      paymentMethod: 'wire',
      paymentDate: null,
      agingDays: 68,
      lineItemsCount: 10,
      progressBilling: false,
      milestoneId: null
    },
    {
      id: 'INV-2024-005',
      invoiceNumber: 'INV-2024-005',
      clientName: 'Heritage Builders',
      projectName: 'Emergency Roof Repair',
      projectReference: 'PR-2024-003',
      description: 'Emergency repair work after storm damage including shingle replacement and gutter repair.',
      amount: 8500,
      paidAmount: 8500,
      dueDate: '01/30/2024',
      issuedDate: '01/15/2024',
      paymentStatus: 'paid',
      paymentMethod: 'stripe',
      paymentDate: '01/28/2024',
      agingDays: 0,
      lineItemsCount: 6,
      progressBilling: false,
      milestoneId: null
    },
    {
      id: 'INV-2024-006',
      invoiceNumber: 'INV-2024-006',
      clientName: 'Residential Homes LLC',
      projectName: 'Deck Construction - Materials',
      projectReference: 'PR-2024-015',
      description: 'Composite decking materials, fasteners, and LED lighting components for custom deck project.',
      amount: 12300,
      paidAmount: 0,
      dueDate: '03/10/2024',
      issuedDate: '02/08/2024',
      paymentStatus: 'pending',
      paymentMethod: 'check',
      paymentDate: null,
      agingDays: 5,
      lineItemsCount: 9,
      progressBilling: true,
      milestoneId: 'MS-002'
    },
    {
      id: 'INV-2024-007',
      invoiceNumber: 'INV-2024-007',
      clientName: 'Commercial Builders Inc',
      projectName: 'HVAC System Installation',
      projectReference: 'PR-2024-025',
      description: 'Commercial HVAC system installation including ductwork, units, and smart control systems.',
      amount: 45000,
      paidAmount: 0,
      dueDate: '11/15/2023',
      issuedDate: '10/15/2023',
      paymentStatus: 'overdue',
      paymentMethod: 'ach',
      paymentDate: null,
      agingDays: 122,
      lineItemsCount: 14,
      progressBilling: false,
      milestoneId: null
    },
    {
      id: 'INV-2024-008',
      invoiceNumber: 'INV-2024-008',
      clientName: 'Green Construction Co',
      projectName: 'Solar Panel Installation',
      projectReference: 'PR-2024-030',
      description: 'Residential solar panel system with battery backup and monitoring equipment.',
      amount: 28000,
      paidAmount: 14000,
      dueDate: '03/15/2024',
      issuedDate: '02/15/2024',
      paymentStatus: 'partial',
      paymentMethod: 'stripe',
      paymentDate: '03/01/2024',
      agingDays: 5,
      lineItemsCount: 7,
      progressBilling: true,
      milestoneId: 'MS-004'
    }
  ];

  useEffect(() => {
    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
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

  const handleCreateInvoice = (invoiceData) => {
    const newInvoice = {
      id: `INV-2024-${String(invoices?.length + 1)?.padStart(3, '0')}`,
      invoiceNumber: `INV-2024-${String(invoices?.length + 1)?.padStart(3, '0')}`,
      clientName: invoiceData?.clientId?.replace('-', ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
      projectName: invoiceData?.projectName,
      projectReference: invoiceData?.projectReference,
      description: invoiceData?.description,
      amount: invoiceData?.total,
      paidAmount: 0,
      dueDate: new Date(Date.now() + parseInt(invoiceData.paymentTerms) * 24 * 60 * 60 * 1000)?.toLocaleDateString(),
      issuedDate: new Date()?.toLocaleDateString(),
      paymentStatus: 'pending',
      paymentMethod: invoiceData?.paymentMethod,
      paymentDate: null,
      agingDays: 0,
      lineItemsCount: invoiceData?.lineItems?.length,
      progressBilling: invoiceData?.progressBilling || false,
      milestoneId: invoiceData?.milestoneId || null
    };

    setInvoices(prev => [newInvoice, ...prev]);
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
    alert(`Reminder sent successfully! 📧\n\nInvoice ID: ${invoiceId}\n\nIn production, this would send an email reminder to the client.`);
    console.log('Send reminder for invoice:', invoiceId);
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

  const handleDownloadPDF = (invoiceId) => {
    alert(`PDF Download started! 📄\n\nInvoice ID: ${invoiceId}\n\nIn production, this would generate and download the invoice PDF.`);
    console.log('Download PDF for invoice:', invoiceId);
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
          onSuccess={() => {
            setIsCreateModalOpen(false);
            // In production, refresh the invoices list here
          }}
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