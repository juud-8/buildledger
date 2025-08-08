import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuoteFilters from './components/QuoteFilters';
import QuoteToolbar from './components/QuoteToolbar';
import QuotesList from './components/QuotesList';
import { quotesService } from '../../services/quotesService';
import CreateQuoteModal from './components/CreateQuoteModal';
import { pdfService } from '../../services/pdfService';

const QuotesPage = () => {
  const location = useLocation();
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

  // Load real quotes from DB
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const dbQuotes = await quotesService.getQuotes();
        if (!isMounted) return;
        // map DB rows -> UI model expected by cards/list
        const uiQuotes = (dbQuotes || []).map(q => ({
          id: q.id,
          quoteNumber: q.quote_number,
          clientName: q.client?.name || '—',
          projectName: q.project?.name || '—',
          description: q.description || '',
          amount: Number(q.total_amount || 0),
          lineItemsCount: q.quote_items?.length || q.items_count || 0,
          status: q.status || 'draft',
          createdDate: new Date(q.created_at).toLocaleDateString(),
          expirationDate: q.valid_until ? new Date(q.valid_until).toLocaleDateString() : '',
          projectType: q.project?.type || 'general'
        }));
        setQuotes(uiQuotes);
        setFilteredQuotes(uiQuotes);
      } catch (e) {
        console.error('Failed to load quotes', e);
      }
    })();
    return () => { isMounted = false; };
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
      // Map created DB row -> UI model and prepend
      const ui = {
        id: newQuote.id,
        quoteNumber: newQuote.quote_number,
        clientName: newQuote.client?.name || '—',
        projectName: newQuote.project?.name || '—',
        description: newQuote.description || '',
        amount: Number(newQuote.total_amount || 0),
        lineItemsCount:  newQuote.quote_items?.length || 0,
        status: newQuote.status || 'draft',
        createdDate: new Date(newQuote.created_at).toLocaleDateString(),
        expirationDate: newQuote.valid_until ? new Date(newQuote.valid_until).toLocaleDateString() : '',
        projectType: newQuote.project?.type || 'general'
      };
      setQuotes(prev => [ui, ...prev]);
      setFilteredQuotes(prev => [ui, ...prev]);
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

  // Open create modal if navigated with { state: { action: 'create', clientId } }
  useEffect(() => {
    if (location?.state?.action === 'create') {
      setIsCreateModalOpen(true);
    }
  }, [location?.state]);

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
          initialClientId={location?.state?.clientId || ''}
        />
      </div>
    </>
  );
};

export default QuotesPage;