import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuoteFilters from './components/QuoteFilters';
import QuoteToolbar from './components/QuoteToolbar';
import QuotesList from './components/QuotesList';
import CreateQuoteModal from './components/CreateQuoteModal';
import { pdfService } from '../../services/pdfService';

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    client: 'all',
    amountRange: 'all',
    projectType: 'all',
    search: ''
  });

  // Mock quotes data
  const mockQuotes = [
    {
      id: 'QT-2024-001',
      quoteNumber: 'QT-2024-001',
      clientName: 'Residential Homes LLC',
      projectName: 'Kitchen Renovation',
      description: 'Complete kitchen remodel including cabinets, countertops, appliances, and flooring. Modern design with energy-efficient features.',
      amount: 45000,
      lineItemsCount: 12,
      status: 'approved',
      createdDate: '01/15/2024',
      expirationDate: '02/14/2024',
      projectType: 'renovation'
    },
    {
      id: 'QT-2024-002',
      quoteNumber: 'QT-2024-002',
      clientName: 'Commercial Builders Inc',
      projectName: 'Office Complex Foundation',
      description: 'Foundation work for new 3-story office building including excavation, concrete pouring, and waterproofing systems.',
      amount: 125000,
      lineItemsCount: 8,
      status: 'sent',
      createdDate: '01/20/2024',
      expirationDate: '02/19/2024',
      projectType: 'commercial'
    },
    {
      id: 'QT-2024-003',
      quoteNumber: 'QT-2024-003',
      clientName: 'Green Construction Co',
      projectName: 'Bathroom Remodel',
      description: 'Master bathroom renovation with luxury fixtures, tile work, and modern plumbing upgrades.',
      amount: 28500,
      lineItemsCount: 15,
      status: 'draft',
      createdDate: '01/25/2024',
      expirationDate: '02/24/2024',
      projectType: 'renovation'
    },
    {
      id: 'QT-2024-004',
      quoteNumber: 'QT-2024-004',
      clientName: 'Urban Developers Group',
      projectName: 'Warehouse Construction',
      description: 'New warehouse facility construction including steel frame, roofing, electrical, and loading dock installation.',
      amount: 285000,
      lineItemsCount: 20,
      status: 'sent',
      createdDate: '01/28/2024',
      expirationDate: '02/27/2024',
      projectType: 'new-construction'
    },
    {
      id: 'QT-2024-005',
      quoteNumber: 'QT-2024-005',
      clientName: 'Heritage Builders',
      projectName: 'Roof Repair',
      description: 'Emergency roof repair and replacement of damaged shingles, gutters, and flashing after storm damage.',
      amount: 12500,
      lineItemsCount: 6,
      status: 'expired',
      createdDate: '12/15/2023',
      expirationDate: '01/14/2024',
      projectType: 'repair'
    },
    {
      id: 'QT-2024-006',
      quoteNumber: 'QT-2024-006',
      clientName: 'Residential Homes LLC',
      projectName: 'Deck Construction',
      description: 'Custom deck construction with composite materials, built-in seating, and LED lighting system.',
      amount: 18750,
      lineItemsCount: 9,
      status: 'approved',
      createdDate: '01/30/2024',
      expirationDate: '03/01/2024',
      projectType: 'new-construction'
    },
    {
      id: 'QT-2024-007',
      quoteNumber: 'QT-2024-007',
      clientName: 'Commercial Builders Inc',
      projectName: 'HVAC Installation',
      description: 'Complete HVAC system installation for office building including ductwork, units, and smart controls.',
      amount: 67500,
      lineItemsCount: 11,
      status: 'sent',
      createdDate: '02/01/2024',
      expirationDate: '03/03/2024',
      projectType: 'commercial'
    },
    {
      id: 'QT-2024-008',
      quoteNumber: 'QT-2024-008',
      clientName: 'Green Construction Co',
      projectName: 'Solar Panel Installation',
      description: 'Residential solar panel system installation with battery backup and smart monitoring system.',
      amount: 35000,
      lineItemsCount: 7,
      status: 'draft',
      createdDate: '02/03/2024',
      expirationDate: '03/05/2024',
      projectType: 'residential'
    }
  ];

  useEffect(() => {
    setQuotes(mockQuotes);
    setFilteredQuotes(mockQuotes);
  }, []);

  useEffect(() => {
    let filtered = [...quotes];

    // Apply filters
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(quote => quote?.status === filters?.status);
    }

    if (filters?.client !== 'all') {
      filtered = filtered?.filter(quote => 
        quote?.clientName?.toLowerCase()?.includes(filters?.client?.replace('-', ' '))
      );
    }

    if (filters?.projectType !== 'all') {
      filtered = filtered?.filter(quote => quote?.projectType === filters?.projectType);
    }

    if (filters?.amountRange !== 'all') {
      const [min, max] = filters?.amountRange?.split('-')?.map(v => 
        v === '100000+' ? [100000, Infinity] : [parseInt(v) || 0, parseInt(v?.split('-')?.[1]) || Infinity]
      )?.flat();
      filtered = filtered?.filter(quote => quote?.amount >= min && quote?.amount <= max);
    }

    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(quote =>
        quote?.quoteNumber?.toLowerCase()?.includes(searchTerm) ||
        quote?.projectName?.toLowerCase()?.includes(searchTerm) ||
        quote?.clientName?.toLowerCase()?.includes(searchTerm) ||
        quote?.description?.toLowerCase()?.includes(searchTerm)
      );
    }

    if (filters?.dateFrom) {
      filtered = filtered?.filter(quote => 
        new Date(quote.createdDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(quote => 
        new Date(quote.createdDate) <= new Date(filters.dateTo)
      );
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'date-asc':
          return new Date(a.createdDate) - new Date(b.createdDate);
        case 'amount-desc':
          return b?.amount - a?.amount;
        case 'amount-asc':
          return a?.amount - b?.amount;
        case 'status':
          return a?.status?.localeCompare(b?.status);
        case 'client':
          return a?.clientName?.localeCompare(b?.clientName);
        case 'expiration':
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  }, [quotes, filters, sortBy]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      client: 'all',
      amountRange: 'all',
      projectType: 'all',
      search: ''
    });
  };

  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => 
      prev?.includes(quoteId) 
        ? prev?.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuotes?.length === filteredQuotes?.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(filteredQuotes?.map(quote => quote?.id));
    }
  };

  const handleCreateQuote = (newQuote) => {
    // The CreateQuoteModal handles the actual quote creation
    // This callback is called when the quote is successfully created
    if (newQuote) {
      setQuotes(prev => [newQuote, ...prev]);
      setFilteredQuotes(prev => [newQuote, ...prev]);
    }
    setIsCreateModalOpen(false);
  };

  const handleBulkAction = (actionId, selectedIds) => {
    console.log(`Bulk action: ${actionId} for quotes:`, selectedIds);
    // Implement bulk actions here
    setSelectedQuotes([]);
  };

  const handleEdit = (quoteId) => {
    console.log('Edit quote:', quoteId);
    // Navigate to edit page or open edit modal
  };

  const handleDuplicate = (quoteId) => {
    const quoteToDuplicate = quotes?.find(q => q?.id === quoteId);
    if (quoteToDuplicate) {
      const duplicatedQuote = {
        ...quoteToDuplicate,
        id: `QT-2024-${String(quotes?.length + 1)?.padStart(3, '0')}`,
        quoteNumber: `QT-2024-${String(quotes?.length + 1)?.padStart(3, '0')}`,
        status: 'draft',
        createdDate: new Date()?.toLocaleDateString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)?.toLocaleDateString()
      };
      setQuotes(prev => [duplicatedQuote, ...prev]);
    }
  };

  const handleSend = (quoteId) => {
    setQuotes(prev => prev?.map(quote => 
      quote?.id === quoteId 
        ? { ...quote, status: 'sent' }
        : quote
    ));
  };

  const handleConvertToInvoice = (quoteId) => {
    console.log('Convert to invoice:', quoteId);
    // Navigate to invoice creation with quote data
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      await pdfService.downloadQuotePDF(quoteId);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Quotes - BuildLedger</title>
        <meta name="description" content="Manage construction quotes, track approvals, and convert to invoices with BuildLedger's comprehensive quote management system." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <Breadcrumb />
        
        <main className="pt-4 pb-8">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-3">
                <QuoteFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-6">
                <QuoteToolbar
                  selectedQuotes={selectedQuotes}
                  onCreateQuote={() => setIsCreateModalOpen(true)}
                  onBulkAction={handleBulkAction}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                <QuotesList
                  quotes={filteredQuotes}
                  viewMode={viewMode}
                  selectedQuotes={selectedQuotes}
                  onSelectQuote={handleSelectQuote}
                  onSelectAll={handleSelectAll}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onSend={handleSend}
                  onConvertToInvoice={handleConvertToInvoice}
                  onDownloadPDF={handleDownloadPDF}
                />
              </div>
            </div>
          </div>
        </main>

        <CreateQuoteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateQuote}
        />
      </div>
    </>
  );
};

export default QuotesPage;