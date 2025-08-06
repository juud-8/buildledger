import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { clientsService } from '../../../services/clientsService';
import { projectsService } from '../../../services/projectsService';
import { quotesService } from '../../../services/quotesService';
import { showSuccessToast, showErrorToast } from '../../../utils/toastHelper';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import ItemSelectionModal from '../../item-selection-modal';
import Icon from '../../../components/AppIcon';

const CreateQuoteFromProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showItemSelection, setShowItemSelection] = useState(false);
  
  // Data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Form data - Pre-filled with project data
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    quoteNumber: '',
    title: '',
    description: '',
    taxRate: 0,
    validUntil: '',
    notes: '',
    status: 'draft' // Default to draft
  });

  useEffect(() => {
    if (isOpen && user && project) {
      loadData();
      generateQuoteNumber();
      // Pre-fill form with project data
      setFormData(prev => ({
        ...prev,
        projectId: project.id || '',
        clientId: project.client?.id || project.clientId || '',
        title: `Quote for ${project.name || 'Project'}`,
        description: project.description || '',
        notes: `This quote is for project: ${project.name || 'Project'}`
      }));
    }
  }, [isOpen, user, project]);

  const loadData = async () => {
    try {
      // Load clients using service
      const clientsData = await clientsService.getClients();
      
      // Load projects using service
      const projectsData = await projectsService.getProjects();

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
        showErrorToast('Failed to load user profile');
        return;
      }

      const companyId = userProfile.company_id;

      const { data: itemsData } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      setClients(clientsData || []);
      setProjects(projectsData || []);
      setItems(itemsData || []);
    } catch (error) {
      showErrorToast('Failed to load data', error);
    }
  };

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, quoteNumber: `QT-${year}${month}-${random}` }));
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
        total_price: quantity * item?.unit_price,
        description: item?.description || ''
      }]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev?.filter(item => item?.item_id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setSelectedItems(prev => prev?.map(item => 
      item?.item_id === itemId 
        ? { ...item, quantity: newQuantity, total_price: newQuantity * item?.unit_price }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return selectedItems?.reduce((sum, item) => sum + (item?.total_price || 0), 0) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData?.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!formData?.clientId || !formData?.projectId) {
      showErrorToast('Please select both client and project');
      return;
    }

    if (selectedItems?.length === 0) {
      showErrorToast('Please add at least one item to the quote');
      return;
    }

    setIsLoading(true);
    try {
      // Get user profile for company_id
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', currentUser.id)
        .single();

      if (!userProfile?.company_id) {
        throw new Error('Company not found');
      }

      // Create the quote
      const quoteData = {
        quote_number: formData.quoteNumber,
        client_id: formData.clientId,
        project_id: formData.projectId,
        status: 'draft', // Always save as draft initially
        subtotal: calculateSubtotal(),
        tax_rate: formData.taxRate,
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        valid_until: formData.validUntil || null,
        notes: formData.notes || null,
        title: formData.title,
        description: formData.description,
        company_id: userProfile.company_id,
        created_by: currentUser.id
      };

      const { data: createdQuote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Add quote items
      const quoteItems = selectedItems.map(item => ({
        quote_id: createdQuote.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        description: item.description || item.name
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      showSuccessToast(`Quote #${formData.quoteNumber} created successfully as draft`);
      onSuccess && onSuccess(createdQuote);
      handleClose();
    } catch (error) {
      showErrorToast('Failed to create quote', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientId: '',
      projectId: '',
      quoteNumber: '',
      title: '',
      description: '',
      taxRate: 0,
      validUntil: '',
      notes: '',
      status: 'draft'
    });
    setSelectedItems([]);
    setCurrentStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto construction-shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Create Quote from Project</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Creating quote for: {project?.name || 'Project'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg construction-transition"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-8">
            {[
              { step: 1, label: 'Basic Info' },
              { step: 2, label: 'Add Items' },
              { step: 3, label: 'Review' }
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-center space-x-2 cursor-pointer ${
                  currentStep === item.step ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setCurrentStep(item.step)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep >= item.step
                      ? 'bg-primary border-primary text-white'
                      : 'border-muted-foreground'
                  }`}
                >
                  {currentStep > item.step ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    item.step
                  )}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Quote Number
                  </label>
                  <Input
                    value={formData.quoteNumber}
                    onChange={(e) => setFormData({ ...formData, quoteNumber: e.target.value })}
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Valid Until
                  </label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Client (Pre-filled)
                  </label>
                  <Select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    disabled={!!project?.client?.id || !!project?.clientId}
                  >
                    <option value="">Select Client</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Project (Pre-filled)
                  </label>
                  <Select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    disabled={!!project?.id}
                  >
                    <option value="">Select Project</option>
                    {projects?.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Quote Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quote title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter quote description"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <Input
                    value="Draft"
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Quote will be saved as draft
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter any additional notes"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Quote Items</h3>
                <Button
                  onClick={() => setShowItemSelection(true)}
                  iconName="Plus"
                >
                  Add Items
                </Button>
              </div>

              {selectedItems?.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-border">
                  <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No items added yet</p>
                  <Button
                    onClick={() => setShowItemSelection(true)}
                    iconName="Plus"
                    variant="outline"
                  >
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItems?.map((item) => (
                    <div
                      key={item?.item_id}
                      className="bg-background border border-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item?.name}</h4>
                          {item?.description && (
                            <p className="text-sm text-muted-foreground mt-1">{item?.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item?.item_id, item?.quantity - 1)}
                              className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center construction-transition"
                            >
                              <Icon name="Minus" size={16} />
                            </button>
                            <input
                              type="number"
                              value={item?.quantity}
                              onChange={(e) => handleQuantityChange(item?.item_id, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center bg-background border border-border rounded-lg text-foreground"
                            />
                            <button
                              onClick={() => handleQuantityChange(item?.item_id, item?.quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center construction-transition"
                            >
                              <Icon name="Plus" size={16} />
                            </button>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="text-sm text-muted-foreground">
                              ${item?.unit_price?.toFixed(2)} each
                            </p>
                            <p className="font-semibold text-foreground">
                              ${item?.total_price?.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item?.item_id)}
                            className="p-2 hover:bg-muted rounded-lg construction-transition text-destructive"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quote Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quote Number:</span>
                    <span className="font-medium text-foreground">{formData.quoteNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium text-foreground">
                      {clients?.find(c => c.id === formData.clientId)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium text-foreground">
                      {projects?.find(p => p.id === formData.projectId)?.name || project?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Draft
                    </span>
                  </div>
                  {formData.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="font-medium text-foreground">
                        {new Date(formData.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Items Summary</h3>
                
                {selectedItems?.length === 0 ? (
                  <p className="text-muted-foreground">No items added</p>
                ) : (
                  <div className="space-y-2">
                    {selectedItems?.map((item) => (
                      <div key={item?.item_id} className="flex justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{item?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item?.quantity} × ${item?.unit_price?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-foreground">
                          ${item?.total_price?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({formData.taxRate}%):</span>
                    <span className="font-medium text-foreground">
                      ${calculateTax().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total:</span>
                    <span className="font-bold text-primary">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="bg-muted/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Notes</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{formData.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && (!formData.clientId || !formData.projectId || !formData.title)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedItems?.length === 0}
                  iconName={isLoading ? 'Loader' : 'Check'}
                >
                  {isLoading ? 'Creating...' : 'Create Quote (Draft)'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Selection Modal */}
      <ItemSelectionModal
        isOpen={showItemSelection}
        onClose={() => setShowItemSelection(false)}
        onSelectItem={handleAddItem}
        selectedItems={selectedItems}
        items={items}
      />
    </div>
  );
};

export default CreateQuoteFromProjectModal; 