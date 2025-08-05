import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../../lib/stripe';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import PaymentForm from '../../../components/payment/PaymentForm';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../../components/ui/Card';

const InvoiceCard = ({ invoice, onEdit, onSendReminder, onRecordPayment, onDownloadPDF }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isStripePaymentOpen, setIsStripePaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const agingPriority = (() => {
    if (invoice?.paymentStatus === 'paid') return { level: 'none', color: '' };
    if (invoice?.agingDays > 60) return { level: 'critical', color: 'border-l-4 border-l-error bg-error/5' };
    if (invoice?.agingDays > 30) return { level: 'high', color: 'border-l-4 border-l-warning bg-warning/5' };
    if (invoice?.agingDays > 0) return { level: 'medium', color: 'border-l-4 border-l-accent bg-accent/5' };
    return { level: 'none', color: '' };
  })();

  const paymentMethod = (() => {
    const methods = {
      stripe: { label: 'Stripe', icon: 'CreditCard' },
      ach: { label: 'ACH', icon: 'Building2' },
      check: { label: 'Check', icon: 'FileText' },
      wire: { label: 'Wire', icon: 'ArrowRightLeft' },
      cash: { label: 'Cash', icon: 'Banknote' }
    };
    return methods?.[invoice?.paymentMethod] || { label: invoice?.paymentMethod, icon: 'DollarSign' };
  })();

  const remainingAmount = invoice?.amount - invoice?.paidAmount;

  const handleRecordPayment = () => {
    if (paymentAmount && parseFloat(paymentAmount) > 0) {
      onRecordPayment(invoice?.id, {
        amount: parseFloat(paymentAmount),
        method: invoice?.paymentMethod,
        date: new Date()?.toISOString()
      });
      setPaymentAmount('');
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <Card className={agingPriority?.color}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{invoice?.invoiceNumber}</CardTitle>
            <CardDescription>{invoice?.clientName}</CardDescription>
            {invoice?.projectReference && (
              <p className="text-xs text-muted-foreground mt-1">
                Project: {invoice?.projectReference}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${invoice?.paymentStatus}/10 text-${invoice?.paymentStatus} border border-${invoice?.paymentStatus}/20`}>
              {invoice?.paymentStatus?.charAt(0)?.toUpperCase() + invoice?.paymentStatus?.slice(1)}
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
                        onEdit(invoice?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Edit" size={16} className="mr-2" />
                      Edit Invoice
                    </button>
                    {invoice?.paymentStatus !== 'paid' && (
                      <>
                        <button
                          onClick={() => {
                            setIsPaymentModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                        >
                          <Icon name="CreditCard" size={16} className="mr-2" />
                          Record Payment
                        </button>
                        <button
                          onClick={() => {
                            onSendReminder(invoice?.id);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                        >
                          <Icon name="Bell" size={16} className="mr-2" />
                          Send Reminder
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        onDownloadPDF(invoice?.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Download PDF
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
          <p className="text-sm text-foreground font-medium mb-1">{invoice?.projectName}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{invoice?.description}</p>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="text-xl font-bold text-foreground">${invoice?.amount?.toLocaleString()}</span>
          </div>
          {invoice?.paymentStatus === 'partial' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid:</span>
                <span className="text-sm font-medium text-success">${invoice?.paidAmount?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining:</span>
                <span className="text-sm font-medium text-warning">${remainingAmount?.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name={paymentMethod?.icon} size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{paymentMethod?.label}</span>
          </div>
          {invoice?.progressBilling && (
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={14} className="text-accent" />
              <span className="text-xs text-accent">Progress Billing</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Issued: {invoice?.issuedDate}</p>
            <p className="text-muted-foreground">Due: {invoice?.dueDate}</p>
          </div>
          <div className="text-right">
            {invoice?.paymentStatus === 'paid' ? (
              <p className="text-success font-medium">
                Paid: {invoice?.paymentDate}
              </p>
            ) : (
              <div>
                {invoice?.agingDays > 0 && (
                  <p className={`font-medium ${
                    invoice?.agingDays > 60 ? 'text-error' :
                    invoice?.agingDays > 30 ? 'text-warning' : 'text-accent'
                  }`}>
                    {invoice?.agingDays} days overdue
                    <Icon name="AlertTriangle" size={14} className="inline ml-1" />
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border w-full">
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(invoice?.id)}
            iconName="Edit"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            Edit
          </Button>
          {invoice?.paymentStatus !== 'paid' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsPaymentModalOpen(true)}
                iconName="CreditCard"
                iconPosition="left"
                className="flex-shrink-0 whitespace-nowrap"
              >
                Record Payment
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsStripePaymentOpen(true)}
                iconName="Zap"
                iconPosition="left"
                className="bg-primary hover:bg-primary/90 flex-shrink-0 whitespace-nowrap"
              >
                Pay Online
              </Button>
            </>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => onDownloadPDF(invoice?.id)}
            iconName="Download"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            PDF
          </Button>
        </div>
      </CardFooter>
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e?.target?.value)}
                  placeholder={`Max: $${remainingAmount?.toLocaleString()}`}
                  max={remainingAmount}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setPaymentAmount('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isStripePaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Pay Invoice Online</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsStripePaymentOpen(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            <Elements stripe={getStripe()}>
              <PaymentForm
                amount={remainingAmount}
                invoiceId={invoice?.id}
                customerId={invoice?.stripe_customer_id}
                description={`Payment for ${invoice?.invoiceNumber}`}
                onSuccess={(result) => {
                  console.log('Payment successful:', result);
                  setIsStripePaymentOpen(false);
                  // Refresh invoice data
                  window.location.reload();
                }}
                onError={(error) => {
                  console.error('Payment failed:', error);
                }}
                onCancel={() => setIsStripePaymentOpen(false)}
              />
            </Elements>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </Card>
  );
};

export default InvoiceCard;