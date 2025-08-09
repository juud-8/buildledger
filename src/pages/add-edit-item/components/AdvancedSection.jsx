import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const AdvancedSection = ({ formData, errors, onChange }) => {
  const [showInventorySettings, setShowInventorySettings] = useState(formData?.inventoryTracking || false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  const handleInventoryToggle = (enabled) => {
    setShowInventorySettings(enabled);
    onChange?.('inventoryTracking', enabled);
  };

  const generateSKU = () => {
    // Generate a simple SKU based on category and timestamp
    const category = formData?.category?.substring(0, 3)?.toUpperCase() || 'ITM';
    const timestamp = Date.now()?.toString()?.slice(-6);
    const sku = `${category}-${timestamp}`;
    onChange?.('sku', sku);
  };

  const handleBarcodeInput = (barcode) => {
    onChange?.('barcode', barcode);
    setShowBarcodeScanner(false);
  };

  // Mock barcode scanner functionality
  const startBarcodeScanner = () => {
    setShowBarcodeScanner(true);
    // Simulate barcode scan after 2 seconds (demo functionality)
    setTimeout(() => {
      const demoBarcode = Math.floor(Math.random() * 9000000000000) + 1000000000000;
      handleBarcodeInput(demoBarcode?.toString());
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* SKU and Barcode */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Hash" size={20} className="mr-2" />
          Item Identification
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              SKU (Stock Keeping Unit) *
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter SKU"
                value={formData?.sku || ''}
                onChange={(e) => onChange?.('sku', e?.target?.value)}
                error={errors?.sku}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="default"
                iconName="RefreshCw"
                onClick={generateSKU}
                title="Generate SKU"
              />
            </div>
            {errors?.sku && (
              <p className="text-sm text-error mt-1">{errors?.sku}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for inventory tracking
            </p>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Barcode
            </label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter or scan barcode"
                value={formData?.barcode || ''}
                onChange={(e) => onChange?.('barcode', e?.target?.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="default"
                iconName="QrCode"
                onClick={startBarcodeScanner}
                title="Scan Barcode"
                loading={showBarcodeScanner}
              >
                {showBarcodeScanner ? 'Scanning...' : ''}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optional barcode for quick identification
            </p>
          </div>
        </div>
      </div>
      {/* Inventory Tracking */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-foreground flex items-center">
            <Icon name="Package" size={18} className="mr-2" />
            Inventory Management
          </h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={showInventorySettings}
              onChange={handleInventoryToggle}
            />
            <span className="text-sm text-foreground">Enable inventory tracking</span>
          </label>
        </div>

        {showInventorySettings && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Stock Level
              </label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={formData?.currentStock || ''}
                onChange={(e) => onChange?.('currentStock', e?.target?.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current quantity available
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reorder Level
              </label>
              <Input
                type="number"
                min="0"
                placeholder="10"
                value={formData?.reorderLevel || ''}
                onChange={(e) => onChange?.('reorderLevel', e?.target?.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alert when stock falls below this level
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Usage Notes */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
          <Icon name="FileText" size={18} className="mr-2" />
          Usage Notes & Instructions
        </h3>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Usage Notes
          </label>
          <textarea
            placeholder="Enter any special instructions, installation notes, or usage guidelines..."
            value={formData?.usageNotes || ''}
            onChange={(e) => onChange?.('usageNotes', e?.target?.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            These notes will be visible when adding this item to quotes or invoices
          </p>
        </div>
      </div>
      {/* Related Items */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Link" size={18} className="mr-2" />
          Related Items
        </h3>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <Icon name="Plus" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Link related items that are commonly used together
            </p>
            <Button variant="outline" size="sm">
              Add Related Item
            </Button>
          </div>

          {formData?.relatedItems?.length > 0 && (
            <div className="space-y-2">
              {formData?.relatedItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name="Package" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{item?.name}</span>
                    <span className="text-xs text-muted-foreground">({item?.sku})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => {
                      const updatedItems = formData?.relatedItems?.filter((_, i) => i !== index);
                      onChange?.('relatedItems', updatedItems);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
          <Icon name="Zap" size={16} className="mr-2" />
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" iconName="Copy">
            Duplicate Item
          </Button>
          <Button variant="outline" size="sm" iconName="Share">
            Export Item Data
          </Button>
          <Button variant="outline" size="sm" iconName="History">
            View Usage History
          </Button>
          <Button variant="outline" size="sm" iconName="Calculator">
            Cost Calculator
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSection;