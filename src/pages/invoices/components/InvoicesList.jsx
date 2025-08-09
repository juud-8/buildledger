import React from 'react';
import InvoiceCard from './InvoiceCard';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const InvoicesList = ({ 
  invoices, 
  viewMode, 
  selectedInvoices, 
  onSelectInvoice, 
  onSelectAll,
  onEdit,
  onSendReminder,
  onRecordPayment,
  onDownloadPDF 
}) => {
  const isAllSelected = invoices?.length > 0 && selectedInvoices?.length === invoices?.length;
  const isPartiallySelected = selectedInvoices?.length > 0 && selectedInvoices?.length < invoices?.length;

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-accent/10 text-accent';
      case 'partial':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAgingColor = (agingDays, status) => {
    if (status === 'paid') return 'text-muted-foreground';
    if (agingDays > 60) return 'text-error';
    if (agingDays > 30) return 'text-warning';
    if (agingDays > 0) return 'text-accent';
    return 'text-muted-foreground';
  };

  if (invoices?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl construction-card-3d construction-depth-3 p-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Icon name="Receipt" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No invoices found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first invoice or adjust your filters.
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
            <div className="col-span-2">Invoice #</div>
            <div className="col-span-2">Client</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-1">Amount</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-1">Aging</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
        {/* Table Body */}
        <div className="divide-y divide-border">
          {invoices?.map((invoice) => (
            <div key={invoice?.id} className="p-4 hover:bg-muted/30 construction-transition">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedInvoices?.includes(invoice?.id)}
                    onChange={() => onSelectInvoice(invoice?.id)}
                  />
                </div>
                <div className="col-span-2">
                  <div>
                    <span className="font-medium text-foreground">{invoice?.invoiceNumber}</span>
                    {invoice?.progressBilling && (
                      <div className="flex items-center mt-1">
                        <Icon name="TrendingUp" size={12} className="text-accent mr-1" />
                        <span className="text-xs text-accent">Progress</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-foreground">{invoice?.clientName}</span>
                </div>
                <div className="col-span-2">
                  <div>
                    <p className="font-medium text-foreground truncate">{invoice?.projectName}</p>
                    {invoice?.projectReference && (
                      <p className="text-xs text-muted-foreground">{invoice?.projectReference}</p>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <div>
                    <span className="font-semibold text-foreground">${invoice?.amount?.toLocaleString()}</span>
                    {invoice?.paymentStatus === 'partial' && (
                      <p className="text-xs text-muted-foreground">
                        Paid: ${invoice?.paidAmount?.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(invoice?.paymentStatus)}`}>
                    {invoice?.paymentStatus?.charAt(0)?.toUpperCase() + invoice?.paymentStatus?.slice(1)}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-muted-foreground">{invoice?.dueDate}</span>
                </div>
                <div className="col-span-1">
                  <span className={`text-sm font-medium ${getAgingColor(invoice?.agingDays, invoice?.paymentStatus)}`}>
                    {invoice?.paymentStatus === 'paid' ? 'Paid' : 
                     invoice?.agingDays > 0 ? `${invoice?.agingDays}d` : 'Current'}
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(invoice?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground construction-transition"
                      title="Edit Invoice"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    {invoice?.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => onRecordPayment(invoice?.id, { amount: invoice?.amount - invoice?.paidAmount })}
                        className="p-1 text-muted-foreground hover:text-success construction-transition"
                        title="Record Payment"
                      >
                        <Icon name="CreditCard" size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onDownloadPDF(invoice?.id)}
                      className="p-1 text-muted-foreground hover:text-foreground construction-transition"
                      title="Download PDF"
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
          label="Select all invoices"
        />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices?.map((invoice) => (
          <div key={invoice?.id} className="relative">
            <div className="absolute top-4 left-4 z-10">
              <Checkbox
                checked={selectedInvoices?.includes(invoice?.id)}
                onChange={() => onSelectInvoice(invoice?.id)}
              />
            </div>
            <InvoiceCard
              invoice={invoice}
              onEdit={onEdit}
              onSendReminder={onSendReminder}
              onRecordPayment={onRecordPayment}
              onDownloadPDF={onDownloadPDF}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoicesList;