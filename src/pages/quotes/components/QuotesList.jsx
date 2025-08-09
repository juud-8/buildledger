import React from 'react';
import QuoteCard from './QuoteCard';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const QuotesList = ({ 
  quotes, 
  viewMode, 
  selectedQuotes, 
  onSelectQuote, 
  onSelectAll,
  onEdit,
  onDuplicate,
  onSend,
  onConvertToInvoice,
  onDownloadPDF 
}) => {
  const isAllSelected = quotes?.length > 0 && selectedQuotes?.length === quotes?.length;
  const isPartiallySelected = selectedQuotes?.length > 0 && selectedQuotes?.length < quotes?.length;

  if (quotes?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl construction-card-3d construction-depth-3 p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Icon name="FileText" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No quotes found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first quote or adjust your filters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-card border border-border rounded-xl construction-card-3d construction-depth-3 overflow-hidden">
        {/* Table Header */}
        <div className="bg-muted/50 border-b border-border p-4">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground">
            <div className="col-span-1">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isPartiallySelected}
                onChange={onSelectAll}
              />
            </div>
            <div className="col-span-2">Quote #</div>
            <div className="col-span-2">Client</div>
            <div className="col-span-3">Project</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Expires</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        {/* Table Body */}
        <div className="divide-y divide-border">
          {quotes?.map((quote) => (
            <div key={quote?.id} className="p-4 hover:bg-muted/30 construction-transition">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedQuotes?.includes(quote?.id)}
                    onChange={() => onSelectQuote(quote?.id)}
                  />
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-foreground">{quote?.quoteNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-foreground">{quote?.clientName}</span>
                </div>
                <div className="col-span-3">
                  <div>
                    <p className="font-medium text-foreground truncate">{quote?.projectName}</p>
                    <p className="text-sm text-muted-foreground truncate">{quote?.description}</p>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className="font-semibold text-foreground">${quote?.amount?.toLocaleString()}</span>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quote?.status === 'draft' ? 'bg-muted text-muted-foreground' :
                    quote?.status === 'sent' ? 'bg-accent/10 text-accent' :
                    quote?.status === 'accepted' ? 'bg-success/10 text-success' :
                    quote?.status === 'expired'? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                  }`}>
                    {quote?.status?.charAt(0)?.toUpperCase() + quote?.status?.slice(1)}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-muted-foreground">
                    {Math.ceil((new Date(quote.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))}d
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(quote?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground construction-transition"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => onDownloadPDF(quote?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground construction-transition"
                    >
                      <Icon name="Download" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-4">
      {/* Select All Checkbox for Grid View */}
      <div className="flex items-center space-x-2 px-2">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          onChange={onSelectAll}
          label="Select all quotes"
        />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes?.map((quote) => (
          <div key={quote?.id} className="relative">
            <div className="absolute top-4 left-4 z-10">
              <Checkbox
                checked={selectedQuotes?.includes(quote?.id)}
                onChange={() => onSelectQuote(quote?.id)}
              />
            </div>
            <QuoteCard
              quote={quote}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onSend={onSend}
              onConvertToInvoice={onConvertToInvoice}
              onDownloadPDF={onDownloadPDF}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotesList;