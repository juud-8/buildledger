import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';

const QuoteCard = ({ quote, onEdit, onDuplicate, onSend, onConvertToInvoice, onDownloadPDF, onDelete }) => {
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{quote?.quoteNumber}</CardTitle>
            <CardDescription>{quote?.clientName}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${quote?.status}/10 text-${quote?.status} border border-${quote?.status}/20`}>
              {quote?.status?.charAt(0)?.toUpperCase() + quote?.status?.slice(1)}
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
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete quote ${quote?.quoteNumber}?`)) {
                          onDelete(quote?.id);
                          setIsMenuOpen(false);
                        }
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Delete Quote
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-foreground font-medium mb-1">{quote?.projectName}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{quote?.description}</p>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-foreground">${quote?.amount?.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{quote?.lineItemsCount} line items</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Created: {quote?.createdDate}</p>
          </div>
          <div className="text-right">
            <p className={`font-medium text-${expirationStatus?.color}`}>
              {expirationStatus?.text}
              {expirationStatus?.urgent && (
                <Icon name="AlertTriangle" size={14} className="inline ml-1" />
              )}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border w-full">
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(quote?.id)}
            iconName="Edit"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90 flex-shrink-0"
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
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
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
              className="flex-shrink-0 whitespace-nowrap"
            >
              To Invoice
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete quote ${quote?.quoteNumber}?`)) {
                onDelete(quote?.id);
              }
            }}
            iconName="Trash2"
            iconPosition="left"
            className="ml-auto flex-shrink-0"
          >
            Delete
          </Button>
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