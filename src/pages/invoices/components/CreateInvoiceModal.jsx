import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { clientsService } from '../../../services/clientsService';
import { projectsService } from '../../../services/projectsService';
import { invoicesService } from '../../../services/invoicesService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ItemSelectionModal from '../../item-selection-modal';
import { showErrorToast } from '../../../utils/toastHelper';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, editMode = false, invoiceId = null }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    invoiceNumber: '',
    title: '',
    description: '',
    taxRate: 0,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && user) {
      loadData();
      if (editMode && invoiceId) {
        loadInvoiceData();
      } else {
        generateInvoiceNumber();
      }
    }
  }, [isOpen, user, editMode, invoiceId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.client-dropdown')) {
        setShowClientDropdown(false);
      }
      if (!event.target.closest('.project-dropdown')) {
        setShowProjectDropdown(false);
      }
    };

    if (showClientDropdown || showProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClientDropdown, showProjectDropdown]);

  const loadInvoiceData = async () => {
    try {
      setIsLoading(true);
      const invoice = await invoicesService.getInvoice(invoiceId);
      
      if (invoice) {
        // Set form data from existing invoice
        setFormData({
          clientId: invoice.client_id || '',
          projectId: invoice.project_id || '',
          invoiceNumber: invoice.invoice_number || '',
          title: invoice.title || '',
          description: invoice.description || '',
          taxRate: invoice.tax_rate || 0,
          dueDate: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
          notes: invoice.notes || ''
        });
        
        // Set search terms for dropdowns
        if (invoice.client_id) {
          const client = clients.find(c => c.id === invoice.client_id);
          if (client) setClientSearchTerm(client.name);
        }
        if (invoice.project_id) {
          const project = projects.find(p => p.id === invoice.project_id);
          if (project) setProjectSearchTerm(project.name);
        }
        
        // Load invoice items if they exist
        if (invoice.invoice_items && invoice.invoice_items.length > 0) {
          setSelectedItems(invoice.invoice_items.map(item => ({
            item_id: item.item_id,
            name: item.item?.name || item.name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total_price: item.total_price
          })));
        }
      }
    } catch (error) {
      console.error('Error loading invoice data:', error);
      alert('Failed to load invoice data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleItemsSelected = (itemsToAdd) => {
    // Add items from the selection modal
    const newItems = itemsToAdd.map(item => ({
      item_id: item.id,
      name: item.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      total_price: item.totalPrice,
      description: item.description,
      unit: item.unit
    }));
    
    setSelectedItems(prev => {
      const updatedItems = [...prev];
      
      newItems.forEach(newItem => {
        const existingIndex = updatedItems.findIndex(item => item.item_id === newItem.item_id);
        
        if (existingIndex >= 0) {
          // Update existing item quantity
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
            total_price: (updatedItems[existingIndex].quantity + newItem.quantity) * updatedItems[existingIndex].unit_price
          };
        } else {
          // Add new item
          updatedItems.push(newItem);
        }
      });
      
      return updatedItems;
    });
    
    setShowItemSelection(false);
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev?.filter(si => si?.item_id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = selectedItems?.reduce((sum, item) => sum + (item?.total_price || 0), 0) || 0;
    const taxAmount = subtotal * (formData?.taxRate / 100);
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      showErrorToast('Please fix the validation errors before submitting');
      return;
    }
    
    setIsLoading(true);
    setFormErrors({});
    
    try {
      const totals = calculateTotals();
      const invoiceData = {
        client_id: formData.clientId,
        project_id: formData.projectId || null,
        invoice_number: formData.invoiceNumber,
        title: formData.title,
        description: formData.description,
        amount: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.total,
        tax_rate: formData.taxRate,
        due_date: formData.dueDate || null,
        notes: formData.notes,
        status: 'pending'
      };

      let invoice;
      if (editMode && invoiceId) {
        // Update existing invoice
        invoice = await invoicesService.updateInvoice(invoiceId, invoiceData);
        
        // Delete existing invoice items
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
        
        if (deleteError) {
          console.error('Error deleting old invoice items:', deleteError);
          showErrorToast('Warning: Some old invoice items may not have been removed');
        }
      } else {
        // Create new invoice
        invoice = await invoicesService.createInvoice(invoiceData);
      }

      // Add invoice items (for both create and update)
      if (selectedItems?.length > 0 && invoice?.id) {
        const invoiceItems = selectedItems.map((item) => ({
          invoice_id: invoice.id,
          item_id: item.item_id,
          name: item.name, // Store name as backup
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) {
          console.error('Error adding invoice items:', itemsError);
          showErrorToast('Invoice created but some items may not have been added');
        }
      }

      onSuccess?.();
      onClose();
      if (!editMode) {
        resetForm();
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} invoice:`, error);
      setFormErrors({ submit: error.message || `Error ${editMode ? 'updating' : 'creating'} invoice. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
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

      // Get all existing invoice numbers to ensure uniqueness
      const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      let nextNumber = 1;
      let invoiceNumber = '';
      let isUnique = false;
      
      // Keep trying until we find a unique invoice number
      while (!isUnique) {
        invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
        
        // Check if this number already exists
        const exists = existingInvoices?.some(inv => inv.invoice_number === invoiceNumber);
        
        if (!exists) {
          isUnique = true;
        } else {
          nextNumber++;
        }
        
        // Safety valve to prevent infinite loops
        if (nextNumber > 9999) {
          console.error('Unable to generate unique invoice number');
          break;
        }
      }

      setFormData(prev => ({
        ...prev,
        invoiceNumber
      }));
    } catch (error) {
      console.error('Error generating invoice number:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      projectId: '',
      invoiceNumber: '',
      title: '',
      description: '',
      taxRate: 0,
      dueDate: '',
      notes: ''
    });
    setSelectedItems([]);
    setCurrentStep(1);
    setClientSearchTerm('');
    setProjectSearchTerm('');
    setShowClientDropdown(false);
    setShowProjectDropdown(false);
  };

  // Filter clients and projects based on search
  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(projectSearchTerm.toLowerCase());
    const matchesClient = !formData.clientId || project.client_id === formData.clientId;
    return matchesSearch && matchesClient;
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedProject = projects.find(p => p.id === formData.projectId);

  const handleClientSelect = (client) => {
    handleInputChange('clientId', client.id);
    setClientSearchTerm(client.name);
    setShowClientDropdown(false);
    // Clear project selection if it doesn't belong to the new client
    if (formData.projectId && selectedProject?.client_id !== client.id) {
      handleInputChange('projectId', '');
      setProjectSearchTerm('');
    }
  };

  const handleProjectSelect = (project) => {
    handleInputChange('projectId', project.id);
    setProjectSearchTerm(project.name);
    setShowProjectDropdown(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!formData.clientId.trim()) {
      errors.clientId = 'Client is required';
    }
    if (!formData.invoiceNumber.trim()) {
      errors.invoiceNumber = 'Invoice number is required';
    }
    if (!formData.title.trim()) {
      errors.title = 'Invoice title is required';
    }
    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    }
    
    // Business rule validation
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      errors.taxRate = 'Tax rate must be between 0 and 100';
    }
    
    if (selectedItems.length === 0) {
      errors.items = 'At least one item must be added to the invoice';
    }
    
    // Due date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.clientId.trim()) errors.clientId = 'Client is required';
      if (!formData.invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required';
      if (!formData.title.trim()) errors.title = 'Invoice title is required';
      if (formData.taxRate < 0 || formData.taxRate > 100) {
        errors.taxRate = 'Tax rate must be between 0 and 100';
      }
    }
    
    if (step === 2) {
      if (selectedItems.length === 0) {
        errors.items = 'At least one item must be added to the invoice';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

  // Remove duplicate functions - using calculateTotals() instead

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {editMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
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
                  <label className="block text-sm font-medium mb-1 text-foreground">Invoice Number</label>
                  <Input
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    placeholder="INV-0001"
                    required
                    className={validationErrors.invoiceNumber ? 'border-red-500' : ''}
                  />
                  {validationErrors.invoiceNumber && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.invoiceNumber}</p>
                  )}
                </div>
                <div className="relative client-dropdown">
                  <label className="block text-sm font-medium mb-1 text-foreground">Client</label>
                  {isClientsLoading ? (
                    <Input 
                      value="Loading clients..." 
                      disabled 
                      className="bg-muted"
                    />
                  ) : clientsError ? (
                    <div>
                      <Input 
                        value={clientsError} 
                        disabled 
                        className="border-red-500 bg-red-50"
                      />
                    </div>
                  ) : (
                    <div>
                      <Input
                        value={clientSearchTerm}
                        onChange={(e) => {
                          setClientSearchTerm(e.target.value);
                          setShowClientDropdown(true);
                          if (!e.target.value) {
                            handleInputChange('clientId', '');
                          }
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        placeholder={clients.length === 0 ? "No clients available" : "Search or select client..."}
                        required
                        className={validationErrors.clientId ? 'border-red-500' : ''}
                        disabled={clients.length === 0}
                      />
                      {showClientDropdown && filteredClients.length > 0 && (
                        <div className="absolute z-50 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                              onClick={() => handleClientSelect(client)}
                            >
                              <div className="font-medium">{client.name}</div>
                              {client.email && (
                                <div className="text-sm text-muted-foreground">{client.email}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {validationErrors.clientId && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.clientId}</p>
                  )}
                </div>
              </div>

              <div className="relative project-dropdown">
                <label className="block text-sm font-medium mb-1 text-foreground">Project (Optional)</label>
                <div>
                  <Input
                    value={projectSearchTerm}
                    onChange={(e) => {
                      setProjectSearchTerm(e.target.value);
                      setShowProjectDropdown(true);
                      if (!e.target.value) {
                        handleInputChange('projectId', '');
                      }
                    }}
                    onFocus={() => setShowProjectDropdown(true)}
                    placeholder={filteredProjects.length === 0 ? "No projects available" : "Search or select project..."}
                    disabled={!formData.clientId || filteredProjects.length === 0}
                  />
                  {showProjectDropdown && filteredProjects.length > 0 && (
                    <div className="absolute z-40 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                      <div
                        className="px-3 py-2 hover:bg-muted cursor-pointer border-b text-muted-foreground"
                        onClick={() => {
                          handleInputChange('projectId', '');
                          setProjectSearchTerm('');
                          setShowProjectDropdown(false);
                        }}
                      >
                        (No Project)
                      </div>
                      {filteredProjects.map(project => (
                        <div
                          key={project.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="font-medium">{project.name}</div>
                          {project.description && (
                            <div className="text-sm text-muted-foreground truncate">{project.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!formData.clientId && (
                  <p className="text-muted-foreground text-sm mt-1">Select a client first to choose projects</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Invoice title"
                  required
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Invoice description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                    className={validationErrors.taxRate ? 'border-red-500' : ''}
                  />
                  {validationErrors.taxRate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.taxRate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className={validationErrors.dueDate ? 'border-red-500' : ''}
                  />
                  {validationErrors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.dueDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Invoice Items</h3>
                <Button
                  type="button"
                  onClick={() => setShowItemSelection(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                  Add Item
                </Button>
              </div>

              {selectedItems?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No items added yet. Click "Add Item" to get started.
                  </p>
                  {validationErrors.items && (
                    <p className="text-red-500 text-sm mt-2">{validationErrors.items}</p>
                  )}
                </div>
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

              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateTotals().subtotal.toFixed(2)}</span>
                  </div>
                  {formData.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.taxRate}%):</span>
                      <span>${calculateTotals().taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-lg font-semibold border-t pt-1">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>${calculateTotals().total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Invoice</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Invoice Number:</strong> {formData.invoiceNumber}</p>
                  <p><strong>Client:</strong> {clients?.find(c => c.id === formData.clientId)?.name}</p>
                  <p><strong>Project:</strong> {projects?.find(p => p.id === formData.projectId)?.name || 'None'}</p>
                </div>
                <div>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Tax Rate:</strong> {formData.taxRate}%</p>
                  <p><strong>Due Date:</strong> {formData.dueDate}</p>
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

              <div className="text-right space-y-2">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateTotals().subtotal.toFixed(2)}</span>
                  </div>
                  {formData.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({formData.taxRate}%):</span>
                      <span>${calculateTotals().taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="text-xl font-bold border-t pt-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>${calculateTotals().total.toFixed(2)}</span>
                  </div>
                </div>
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
              <div className="flex flex-col items-end">
                {formErrors.submit && (
                  <p className="text-red-500 text-sm mb-2">{formErrors.submit}</p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700"
                >
                  {isLoading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Invoice' : 'Create Invoice')}
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* Item Selection Modal */}
        {showItemSelection && (
          <ItemSelectionModal
            isOpen={showItemSelection}
            onClose={() => setShowItemSelection(false)}
            onItemsSelected={handleItemsSelected}
            selectedItems={selectedItems}
            mode="invoice"
          />
        )}
      </div>
    </div>
  );
};

export default CreateInvoiceModal;