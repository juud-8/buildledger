import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { materialsService } from '../../../services/materialsService';
import { showErrorToast } from '../../../utils/toastHelper';

const CreateMaterialModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editMode = false, 
  initialData = null,
  vendors = [] 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'materials',
    unit: 'each',
    sku: '',
    vendor_sku: '',
    vendor_id: null,
    unit_cost: 0,
    unit_price: 0,
    profit_margin: 0,
    minimum_stock: 0,
    current_stock: 0,
    reorder_point: 0,
    lead_time_days: 0,
    specifications: {},
    is_active: true
  });

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'materials',
        unit: initialData.unit || 'each',
        sku: initialData.sku || '',
        vendor_sku: initialData.vendor_sku || '',
        vendor_id: initialData.vendor_id || null,
        unit_cost: initialData.unit_cost || 0,
        unit_price: initialData.unit_price || 0,
        profit_margin: initialData.profit_margin || 0,
        minimum_stock: initialData.minimum_stock || 0,
        current_stock: initialData.current_stock || 0,
        reorder_point: initialData.reorder_point || 0,
        lead_time_days: initialData.lead_time_days || 0,
        specifications: initialData.specifications || {},
        is_active: initialData.is_active ?? true
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        category: 'materials',
        unit: 'each',
        sku: '',
        vendor_sku: '',
        vendor_id: null,
        unit_cost: 0,
        unit_price: 0,
        profit_margin: 0,
        minimum_stock: 0,
        current_stock: 0,
        reorder_point: 0,
        lead_time_days: 0,
        specifications: {},
        is_active: true
      });
    }
  }, [editMode, initialData, isOpen]);

  // Calculate profit margin when cost or price changes
  useEffect(() => {
    if (formData.unit_cost > 0 && formData.unit_price > 0) {
      const margin = ((formData.unit_price - formData.unit_cost) / formData.unit_price) * 100;
      setFormData(prev => ({
        ...prev,
        profit_margin: Math.round(margin * 100) / 100
      }));
    }
  }, [formData.unit_cost, formData.unit_price]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showErrorToast('Material name is required');
      return;
    }

    setIsLoading(true);
    try {
      if (editMode) {
        await materialsService.updateMaterial(initialData.id, formData);
      } else {
        await materialsService.createMaterial(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving material:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const categoryOptions = [
    { value: 'materials', label: 'Materials' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'overhead', label: 'Overhead' },
    { value: 'other', label: 'Other' }
  ];

  const unitOptions = [
    { value: 'each', label: 'Each' },
    { value: 'ft', label: 'Feet' },
    { value: 'sq ft', label: 'Square Feet' },
    { value: 'cu ft', label: 'Cubic Feet' },
    { value: 'lb', label: 'Pounds' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'bag', label: 'Bag' },
    { value: 'box', label: 'Box' },
    { value: 'roll', label: 'Roll' },
    { value: 'sheet', label: 'Sheet' },
    { value: 'yard', label: 'Yard' },
    { value: 'meter', label: 'Meter' },
    { value: 'gallon', label: 'Gallon' },
    { value: 'liter', label: 'Liter' },
    { value: 'hour', label: 'Hour' },
    { value: 'day', label: 'Day' }
  ];

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: vendor.name
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {editMode ? 'Edit Material' : 'Add New Material'}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
            />
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Material Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter material name"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter material description"
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                    options={categoryOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit of Measure
                  </label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleChange('unit', value)}
                    options={unitOptions}
                  />
                </div>
              </div>
            </div>

            {/* SKU Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">SKU Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Internal SKU
                  </label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="Your internal SKU"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vendor SKU
                  </label>
                  <Input
                    type="text"
                    value={formData.vendor_sku}
                    onChange={(e) => handleChange('vendor_sku', e.target.value)}
                    placeholder="Vendor's SKU"
                  />
                </div>
              </div>
            </div>

            {/* Vendor */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Vendor</h3>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Primary Vendor
                </label>
                <Select
                  value={formData.vendor_id}
                  onValueChange={(value) => handleChange('vendor_id', value)}
                  options={[
                    { value: null, label: 'Select a vendor (optional)' },
                    ...vendorOptions
                  ]}
                />
              </div>
            </div>

            {/* Pricing Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit Cost ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_cost}
                    onChange={(e) => handleChange('unit_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Profit Margin (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.profit_margin}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </div>

            {/* Inventory Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Inventory Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => handleChange('current_stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Minimum Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) => handleChange('minimum_stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reorder Point
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.reorder_point}
                    onChange={(e) => handleChange('reorder_point', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Lead Time (Days)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.lead_time_days}
                    onChange={(e) => handleChange('lead_time_days', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 mr-2"
                />
                <span className="text-sm font-medium text-foreground">Active Material</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading}
              iconName={isLoading ? "Loader2" : undefined}
              iconPosition="left"
              className={isLoading ? "animate-spin" : ""}
            >
              {isLoading ? 'Saving...' : editMode ? 'Update Material' : 'Create Material'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMaterialModal;