import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';

const QuoteCard = ({ quote, onEdit, onDuplicate, onSend, onConvertToInvoice, onDownloadPDF }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const expirationStatus = (() => {
    const today = new Date();
    const expiry = new Date(quote?.expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', color: 'error', urgent: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: 'warning', urgent: true };
    } else {
      return { text: `${diffDays} days left`, color: 'muted-foreground', urgent: false };
    }
  })();

  return (
    <Card className="border-border/60 hover:border-border construction-transition shadow-sm hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg tracking-tight">{quote?.quoteNumber}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{quote?.clientName}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
              quote?.status === 'draft' ? 'bg-muted text-muted-foreground border-muted-foreground/20' :
              quote?.status === 'sent' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
              quote?.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
              quote?.status === 'expired' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
              'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              {quote?.status}
            </span>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Icon name="MoreVertical" size={16} />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-popover border border-border rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(quote?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Edit" size={16} className="mr-2" />
                      Edit Quote
                    </button>
                    <button
                      onClick={() => {
                        onDuplicate(quote?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        onSend(quote?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Send" size={16} className="mr-2" />
                      Send Quote
                    </button>
                    <button
                      onClick={() => {
                        onDownloadPDF(quote?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Download PDF
                    </button>
                    {quote?.status === 'approved' && (
                      <>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => {
                            onConvertToInvoice(quote?.id);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-success hover:bg-muted"
                        >
                          <Icon name="FileText" size={16} className="mr-2" />
                          Convert to Invoice
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-3 space-y-1">
          <p className="text-sm text-foreground font-medium">{quote?.projectName}</p>
          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-snug">{quote?.description}</p>
        </div>

        <div className="mb-3">
          <p className="text-xl font-semibold text-foreground">${quote?.amount?.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{quote?.lineItemsCount} line items</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Created: {quote?.createdDate}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs font-medium ${
              expirationStatus?.urgent ? 'text-amber-300' : 'text-muted-foreground'
            }`}>
              {expirationStatus?.text}
              {expirationStatus?.urgent && (
                <Icon name="AlertTriangle" size={14} className="inline ml-1" />
              )}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/70 w-full">
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(quote?.id)}
            iconName="Edit"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90 flex-shrink-0 h-8 px-3"
          >
            Edit
          </Button>
          {quote?.status === 'draft' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSend(quote?.id)}
              iconName="Send"
              iconPosition="left"
              className="bg-primary hover:bg-primary/90 flex-shrink-0 h-8 px-3"
            >
              Send
            </Button>
          )}
          {quote?.status === 'approved' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onConvertToInvoice(quote?.id)}
              iconName="ArrowRight"
              iconPosition="right"
              className="flex-shrink-0 whitespace-nowrap h-8 px-3"
            >
              To Invoice
            </Button>
          )}
        </div>
      </CardFooter>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </Card>
  );
};

export default QuoteCard;