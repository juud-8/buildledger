import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const PricingSection = ({ formData, errors, onChange, onSupplierChange, onSeasonalPricingChange }) => {
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showSeasonalPricing, setShowSeasonalPricing] = useState(formData?.seasonalPricing?.enabled || false);

  const taxCategories = [
    { value: 'materials', label: 'Materials (Taxable)' },
    { value: 'labor', label: 'Labor (Non-taxable)' },
    { value: 'equipment', label: 'Equipment Rental (Taxable)' },
    { value: 'exempt', label: 'Tax Exempt' }
  ];

  // Calculate markup percentage when prices change
  useEffect(() => {
    const costPrice = parseFloat(formData?.costPrice) || 0;
    const sellingPrice = parseFloat(formData?.sellingPrice) || 0;
    
    if (costPrice > 0 && sellingPrice > 0) {
      const markup = ((sellingPrice - costPrice) / costPrice) * 100;
      onChange?.('markupPercentage', Math.round(markup * 100) / 100);
    }
  }, [formData?.costPrice, formData?.sellingPrice, onChange]);

  // Update selling price when cost price or markup changes
  const handleCostPriceChange = (value) => {
    onChange?.('costPrice', value);
    
    const costPrice = parseFloat(value) || 0;
    const markup = parseFloat(formData?.markupPercentage) || 0;
    
    if (costPrice > 0 && markup > 0) {
      const sellingPrice = costPrice * (1 + markup / 100);
      onChange?.('sellingPrice', sellingPrice?.toFixed(2));
    }
  };

  const handleMarkupChange = (value) => {
    onChange?.('markupPercentage', value);
    
    const costPrice = parseFloat(formData?.costPrice) || 0;
    const markup = parseFloat(value) || 0;
    
    if (costPrice > 0) {
      const sellingPrice = costPrice * (1 + markup / 100);
      onChange?.('sellingPrice', sellingPrice?.toFixed(2));
    }
  };

  const handleSeasonalPricingToggle = (enabled) => {
    setShowSeasonalPricing(enabled);
    onSeasonalPricingChange?.({ 
      ...formData?.seasonalPricing, 
      enabled 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Main Pricing */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="DollarSign" size={20} className="mr-2" />
          Pricing Information
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cost Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData?.costPrice || ''}
                onChange={(e) => handleCostPriceChange(e?.target?.value)}
                className="pl-8"
                error={errors?.costPrice}
              />
            </div>
            {errors?.costPrice && (
              <p className="text-sm text-error mt-1">{errors?.costPrice}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Your cost per {formData?.unit || 'unit'}
            </p>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Selling Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData?.sellingPrice || ''}
                onChange={(e) => onChange?.('sellingPrice', e?.target?.value)}
                className="pl-8"
                error={errors?.sellingPrice}
              />
            </div>
            {errors?.sellingPrice && (
              <p className="text-sm text-error mt-1">{errors?.sellingPrice}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Price charged to customer
            </p>
          </div>

          {/* Markup Percentage */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Markup %
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="50"
                value={formData?.markupPercentage || ''}
                onChange={(e) => handleMarkupChange(e?.target?.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Profit margin percentage
            </p>
          </div>
        </div>

        {/* Pricing Summary */}
        {formData?.costPrice && formData?.sellingPrice && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-3">Pricing Summary</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cost:</span>
                <div className="font-semibold text-foreground">
                  {formatCurrency(formData?.costPrice)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Selling:</span>
                <div className="font-semibold text-foreground">
                  {formatCurrency(formData?.sellingPrice)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Profit:</span>
                <div className="font-semibold text-success">
                  {formatCurrency(formData?.sellingPrice - formData?.costPrice)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Margin:</span>
                <div className="font-semibold text-success">
                  {formData?.markupPercentage?.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Tax Category */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Receipt" size={18} className="mr-2" />
          Tax Information
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tax Category
            </label>
            <Select
              value={formData?.taxCategory || 'materials'}
              onChange={(e) => onChange?.('taxCategory', e.target.value)}
            >
              {taxCategories?.map((category) => (
                <option key={category?.value} value={category?.value}>
                  {category?.label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Determines if sales tax applies to this item
            </p>
          </div>
        </div>
      </div>
      {/* Seasonal Pricing */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-foreground flex items-center">
            <Icon name="Calendar" size={18} className="mr-2" />
            Seasonal Pricing
          </h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={showSeasonalPricing}
              onChange={handleSeasonalPricingToggle}
            />
            <span className="text-sm text-foreground">Enable seasonal pricing</span>
          </label>
        </div>

        {showSeasonalPricing && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Winter Price (Dec-Feb)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData?.seasonalPricing?.winter || ''}
                  onChange={(e) => onSeasonalPricingChange?.({ 
                    ...formData?.seasonalPricing, 
                    winter: e?.target?.value 
                  })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Summer Price (Jun-Aug)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData?.seasonalPricing?.summer || ''}
                  onChange={(e) => onSeasonalPricingChange?.({ 
                    ...formData?.seasonalPricing, 
                    summer: e?.target?.value 
                  })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Supplier Information */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-foreground flex items-center">
            <Icon name="Truck" size={18} className="mr-2" />
            Supplier Information
          </h3>
          <Button
            variant="ghost"
            size="sm"
            iconName={showSupplierForm ? "ChevronUp" : "ChevronDown"}
            onClick={() => setShowSupplierForm(!showSupplierForm)}
          >
            {showSupplierForm ? 'Hide' : 'Show'} Details
          </Button>
        </div>

        {showSupplierForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Supplier Name
              </label>
              <Input
                type="text"
                placeholder="Enter supplier name"
                value={formData?.supplier?.name || ''}
                onChange={(e) => onSupplierChange?.({ 
                  ...formData?.supplier, 
                  name: e?.target?.value 
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Number
              </label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={formData?.supplier?.contact || ''}
                onChange={(e) => onSupplierChange?.({ 
                  ...formData?.supplier, 
                  contact: e?.target?.value 
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="orders@supplier.com"
                value={formData?.supplier?.email || ''}
                onChange={(e) => onSupplierChange?.({ 
                  ...formData?.supplier, 
                  email: e?.target?.value 
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingSection;