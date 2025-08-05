import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BasicInformation from './components/BasicInformation';
import PricingSection from './components/PricingSection';
import AdvancedSection from './components/AdvancedSection';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AddEditItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams?.get('id');
  const duplicateId = searchParams?.get('duplicate');
  const isEditing = Boolean(itemId);
  const isDuplicating = Boolean(duplicateId);

  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    image: null,
    costPrice: '',
    sellingPrice: '',
    markupPercentage: 50,
    taxCategory: 'materials',
    seasonalPricing: {
      enabled: false,
      winter: '',
      summer: ''
    },
    supplier: {
      name: '',
      contact: '',
      email: ''
    },
    sku: '',
    barcode: '',
    inventoryTracking: true,
    reorderLevel: '',
    currentStock: '',
    usageNotes: '',
    relatedItems: []
  });

  const [errors, setErrors] = useState({});

  // Mock item data for editing
  const mockItem = {
    id: 1,
    name: "Concrete Foundation Mix",
    category: "Foundation",
    description: "High-strength concrete mix for residential foundations",
    unit: "cubic yard",
    costPrice: 120.00,
    sellingPrice: 180.00,
    markupPercentage: 50,
    taxCategory: "materials",
    sku: "CFM-001",
    barcode: "1234567890123",
    supplier: {
      name: "Metro Concrete Supply",
      contact: "(555) 123-4567",
      email: "orders@metroconcrete.com"
    },
    reorderLevel: 10,
    currentStock: 25,
    seasonalPricing: {
      enabled: true,
      winter: 200.00,
      summer: 160.00
    },
    inventoryTracking: true,
    usageNotes: "Standard mix for most residential foundations. Requires 7-day cure time.",
    relatedItems: []
  };

  useEffect(() => {
    if (isEditing || isDuplicating) {
      setIsLoading(true);
      // Simulate loading item data
      setTimeout(() => {
        const data = { ...mockItem };
        if (isDuplicating) {
          data.name = `Copy of ${data?.name}`;
          data.sku = '';
          data.barcode = '';
        }
        setFormData(data);
        setIsLoading(false);
      }, 1000);
    }
  }, [isEditing, isDuplicating, itemId, duplicateId]);

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: 'Info' },
    { id: 'pricing', label: 'Pricing', icon: 'DollarSign' },
    { id: 'advanced', label: 'Advanced', icon: 'Settings' }
  ];

  const handleFormDataChange = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof data === 'object' && data !== null ? { ...prev?.[section], ...data } : data
    }));
    
    // Clear errors for the changed field
    if (errors?.[section]) {
      setErrors(prev => ({ ...prev, [section]: null }));
    }
  };

  const handleDirectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors for the changed field
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information validation
    if (!formData?.name?.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData?.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData?.unit) {
      newErrors.unit = 'Unit of measurement is required';
    }

    // Pricing validation
    if (!formData?.costPrice || parseFloat(formData?.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }
    if (!formData?.sellingPrice || parseFloat(formData?.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (parseFloat(formData?.sellingPrice) <= parseFloat(formData?.costPrice)) {
      newErrors.sellingPrice = 'Selling price must be higher than cost price';
    }

    // Advanced validation
    if (!formData?.sku?.trim()) {
      newErrors.sku = 'SKU is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async (action = 'save') => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving item:', formData);
      
      if (action === 'saveAndAddAnother') {
        // Reset form for new item
        setFormData({
          name: '',
          description: '',
          category: formData?.category, // Keep category for convenience
          unit: '',
          image: null,
          costPrice: '',
          sellingPrice: '',
          markupPercentage: 50,
          taxCategory: formData?.taxCategory, // Keep tax category for convenience
          seasonalPricing: {
            enabled: false,
            winter: '',
            summer: ''
          },
          supplier: {
            name: '',
            contact: '',
            email: ''
          },
          sku: '',
          barcode: '',
          inventoryTracking: true,
          reorderLevel: '',
          currentStock: '',
          usageNotes: '',
          relatedItems: []
        });
        setActiveTab('basic');
      } else if (action === 'saveAndAddToQuote') {
        navigate('/quotes', { state: { newItem: formData } });
      } else {
        navigate('/items');
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/items');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {isEditing ? 'Edit Item' : isDuplicating ? 'Duplicate Item' : 'Add New Item'} - BuildLedger
        </title>
        <meta name="description" content="Add or edit construction items with pricing and specifications" />
      </Helmet>

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                iconName="ArrowLeft"
                onClick={handleCancel}
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? 'Edit Item' : isDuplicating ? 'Duplicate Item' : 'Add New Item'}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing 
                    ? 'Update item details, pricing, and specifications' 
                    : 'Create a new construction item with pricing and specifications'
                  }
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('saveAndAddAnother')}
                disabled={isSaving}
                loading={isSaving}
              >
                Save & Add Another
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('saveAndAddToQuote')}
                disabled={isSaving}
              >
                Save & Add to Quote
              </Button>
              <Button
                variant="default"
                onClick={() => handleSave('save')}
                disabled={isSaving}
                loading={isSaving}
              >
                {isEditing ? 'Update Item' : 'Save Item'}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 lg:px-6">
          <div className="flex space-x-8 border-b border-border">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span className="hidden sm:inline">{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'basic' && (
            <BasicInformation
              formData={formData}
              errors={errors}
              onChange={handleDirectChange}
            />
          )}
          {activeTab === 'pricing' && (
            <PricingSection
              formData={formData}
              errors={errors}
              onChange={handleDirectChange}
              onSupplierChange={(data) => handleFormDataChange('supplier', data)}
              onSeasonalPricingChange={(data) => handleFormDataChange('seasonalPricing', data)}
            />
          )}
          {activeTab === 'advanced' && (
            <AdvancedSection
              formData={formData}
              errors={errors}
              onChange={handleDirectChange}
            />
          )}
        </div>
      </div>

      {/* Mobile Save Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => handleSave('save')}
            disabled={isSaving}
            loading={isSaving}
            className="flex-1"
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddEditItem;