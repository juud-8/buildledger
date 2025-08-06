import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CreateInvoiceModal = ({ isOpen, onClose, onCreateInvoice }) => {
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!amount || !dueDate) {
      alert('Amount and Due Date are required.');
      return;
    }
    onCreateInvoice({ amount, dueDate, description });
    console.log('Creating invoice:', { amount, dueDate, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md construction-shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Create New Invoice</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg construction-transition"
          >
            <Icon name="X" size={20} />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <Input
            label="Invoice Amount"
            type="number"
            placeholder="e.g., 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="e.g., Materials for kitchen"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            fullWidth
          >
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;