import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { clientsService } from '../../../services/clientsService';
import { projectsService } from '../../../services/projectsService';
import { quotesService } from '../../../services/quotesService';
import { showErrorToast } from '../../../utils/toastHelper';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ItemSelectionModal from '../../item-selection-modal';

const CreateQuoteModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [useCustomClient, setUseCustomClient] = useState(false);
  
  // Data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    clientId: '',
    customClientName: '',
    projectId: '',
    quoteNumber: '',
    title: '',
    description: '',
    taxRate: 0,
    validUntil: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadData();
      generateQuoteNumber();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    try {
      setIsClientsLoading(true);
      setClientsError(null);
      const clientsData = await clientsService.getClients();
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClientsError('Failed to load clients. Please try again.');
    } finally {
      setIsClientsLoading(false);
    }

    try {
      // Load projects using service
      const projectsData = await projectsService.getProjects();
      setProjects(projectsData || []);

      // Load items from items_database table
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        console.error('User profile or company not found');
        return;
      }

      const companyId = userProfile.company_id;

      const { data: itemsData } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      setItems(itemsData || []);
    } catch (error) {
      console.error('Error loading projects or items:', error);
    }
  };

  const handleAddItem = (item, quantity = 1) => {
    const existingItem = selectedItems?.find(si => si?.item_id === item?.id);
    
    if (existingItem) {
      setSelectedItems(prev => prev?.map(si => 
        si?.item_id === item?.id 
          ? { ...si, quantity: si?.quantity + quantity, total_price: (si?.quantity + quantity) * si?.unit_price }
          : si
      ));
    } else {
      setSelectedItems(prev => [...prev, {
        item_id: item?.id,
        name: item?.name,
        unit_price: item?.unit_price,
        quantity: quantity,
        total_price: quantity * item?.unit_price
      }]);
    }
    
    setShowItemSelection(false);
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev?.filter(si => si?.item_id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = selectedItems?.reduce((sum, item) => sum + item?.total_price, 0);
    const taxAmount = subtotal * (formData?.taxRate / 100);
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      // Create quote using service
      const quoteData = {
        client_id: useCustomClient ? null : (formData?.clientId || null),
        custom_client_name: useCustomClient ? formData?.customClientName : null,
        project_id: formData?.projectId || null,
        quote_number: formData?.quoteNumber,
        title: formData?.title,
        description: formData?.description,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        valid_until: formData?.validUntil,
        notes: formData?.notes
      };

      const quote = await quotesService.createQuote(quoteData);

      // Add quote items
      if (selectedItems?.length > 0) {
        const quoteItems = selectedItems?.map(item => ({
          quote_id: quote?.id,
          item_id: item?.item_id,
          quantity: item?.quantity,
          unit_price: item?.unit_price,
          total_price: item?.total_price
        }));

        const { error: itemsError } = await supabase?.from('quote_items')?.insert(quoteItems);

        if (itemsError) throw itemsError;
      }

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating quote:', error);
      showErrorToast('Error creating quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuoteNumber = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        console.error('User profile or company not found');
        return;
      }

      const companyId = userProfile.company_id;

      // Get the latest quote number for this company
      const { data: latestQuote } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (latestQuote?.[0]?.quote_number) {
        const currentNumber = parseInt(latestQuote[0].quote_number.replace('Q-', ''));
        nextNumber = currentNumber + 1;
      }

      setFormData(prev => ({
        ...prev,
        quoteNumber: `Q-${nextNumber.toString().padStart(4, '0')}`
      }));
    } catch (error) {
      console.error('Error generating quote number:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      customClientName: '',
      projectId: '',
      quoteNumber: '',
      title: '',
      description: '',
      taxRate: 0,
      validUntil: '',
      notes: ''
    });
    setSelectedItems([]);
    setCurrentStep(1);
    setUseCustomClient(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    setSelectedItems(prev => prev?.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            [field]: value,
            total_price: field === 'quantity' || field === 'unit_price' 
              ? (field === 'quantity' ? value : item.quantity) * (field === 'unit_price' ? value : item.unit_price)
              : item.total_price
          }
        : item
    ));
  };

  const addLineItem = () => {
    setSelectedItems(prev => [...prev, {
      item_id: '',
      name: '',
      unit_price: 0,
      quantity: 1,
      total_price: 0
    }]);
  };

  const removeLineItem = (index) => {
    setSelectedItems(prev => prev?.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems?.reduce((sum, item) => sum + (item?.total_price || 0), 0);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create New Quote</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex mb-6">
          {['Basic Info', 'Items', 'Review'].map((step, index) => (
            <div
              key={step}
              className={`flex-1 text-center py-2 rounded ${
                currentStep > index + 1
                  ? 'bg-green-600 text-white'
                  : currentStep === index + 1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Quote Number</label>
                  <Input
                    value={formData.quoteNumber}
                    onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
                    placeholder="Q-0001"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-foreground">Client</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useCustomClient"
                        checked={useCustomClient}
                        onChange={(e) => {
                          setUseCustomClient(e.target.checked);
                          handleInputChange('clientId', '');
                          handleInputChange('customClientName', '');
                        }}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <label htmlFor="useCustomClient" className="text-sm text-muted-foreground">
                        Use custom client name
                      </label>
                    </div>
                  </div>
                  
                  {useCustomClient ? (
                    <Input
                      value={formData.customClientName}
                      onChange={(e) => handleInputChange('customClientName', e.target.value)}
                      placeholder="Enter custom client name"
                    />
                  ) : (
                    <Select
                      value={formData.clientId}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      disabled={isClientsLoading}
                    >
                      {isClientsLoading ? (
                        <option>Loading clients...</option>
                      ) : clientsError ? (
                        <option>{clientsError}</option>
                      ) : clients.length === 0 ? (
                        <option>No clients available</option>
                      ) : (
                        <>
                          <option value="">Select Client (Optional)</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </>
                      )}
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Project (Optional)</label>
                <Select
                  value={formData.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                >
                  <option value="">Select Project</option>
                  {projects?.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Quote title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Quote description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Valid Until</label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quote Items</h3>
                <Button
                  type="button"
                  onClick={() => setShowItemSelection(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                  Add Item
                </Button>
              </div>

              {selectedItems?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No items added yet. Click "Add Item" to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedItems?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <div className="flex-1">
                        <input
                          value={item.name}
                          onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                          className="w-full p-1 border rounded"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full p-1 border rounded"
                          placeholder="Qty"
                          step="0.01"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full p-1 border rounded"
                          placeholder="Price"
                          step="0.01"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.total_price}
                          className="w-full p-1 border rounded bg-muted"
                          placeholder="Total"
                          readOnly
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total: ${calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Quote</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Quote Number:</strong> {formData.quoteNumber}</p>
                  <p><strong>Client:</strong> {
                    useCustomClient 
                      ? formData.customClientName || 'Custom Client'
                      : clients?.find(c => c.id === formData.clientId)?.name || 'No Client Selected'
                  }</p>
                  <p><strong>Project:</strong> {projects?.find(p => p.id === formData.projectId)?.name || 'None'}</p>
                </div>
                <div>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Tax Rate:</strong> {formData.taxRate}%</p>
                  <p><strong>Valid Until:</strong> {formData.validUntil}</p>
                </div>
              </div>

              <div>
                <p><strong>Description:</strong></p>
                <p className="text-muted-foreground">{formData.description || 'No description'}</p>
              </div>

              <div>
                <p><strong>Items:</strong></p>
                <div className="border rounded p-2">
                  {selectedItems?.map((item, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span>{item.name} (Qty: {item.quantity})</span>
                      <span>${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-bold">
                  Total: ${calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-muted text-muted-foreground px-4 py-2 rounded disabled:opacity-50 hover:bg-muted/80"
            >
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700"
              >
                {isLoading ? 'Creating...' : 'Create Quote'}
              </Button>
            )}
          </div>
        </form>

        {/* Item Selection Modal */}
        {showItemSelection && (
          <ItemSelectionModal
            isOpen={showItemSelection}
            onClose={() => setShowItemSelection(false)}
            onSelect={handleAddItem}
            items={items}
          />
        )}
      </div>
    </div>
  );
};

export default CreateQuoteModal;