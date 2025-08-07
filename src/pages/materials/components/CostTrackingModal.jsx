import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { materialsService } from '../../../services/materialsService';
import { showErrorToast } from '../../../utils/toastHelper';
import { cn } from '../../../utils/cn';

const CostTrackingModal = ({ 
  material,
  vendors = [],
  isOpen, 
  onClose, 
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [costHistory, setCostHistory] = useState([]);
  const [formData, setFormData] = useState({
    cost: '',
    vendor_id: null,
    effective_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (isOpen && material) {
      // Load cost history
      loadCostHistory();
      
      // Reset form
      setFormData({
        cost: material.unit_cost || '',
        vendor_id: material.vendor_id || null,
        effective_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, material]);

  const loadCostHistory = async () => {
    if (!material) return;
    
    try {
      const history = await materialsService.getCostHistory(material.id);
      setCostHistory(history || []);
    } catch (error) {
      console.error('Error loading cost history:', error);
      // Use mock data for demo
      setCostHistory([
        {
          id: 1,
          cost: 3.50,
          effective_date: '2024-01-15',
          notes: 'Initial cost',
          vendors: { name: 'Home Depot Pro' }
        },
        {
          id: 2,
          cost: 3.25,
          effective_date: '2024-02-01',
          notes: 'Price reduction due to bulk discount',
          vendors: { name: 'Home Depot Pro' }
        }
      ]);
    }
  };

  if (!isOpen || !material) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      showErrorToast('Please enter a valid cost');
      return;
    }

    setIsLoading(true);
    try {
      await materialsService.addCostTracking(material.id, {
        ...formData,
        cost: parseFloat(formData.cost)
      });
      
      // Refresh cost history
      await loadCostHistory();
      
      // Reset form
      setFormData({
        cost: '',
        vendor_id: formData.vendor_id, // Keep vendor selection
        effective_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error adding cost tracking record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const vendorOptions = vendors.map(vendor => ({
    value: vendor.id,
    label: vendor.name
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cost Tracking</h2>
            <p className="text-sm text-muted-foreground mt-1">{material.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Add New Cost Record */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Plus" size={20} className="mr-2" />
              Add Cost Record
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unit Cost <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleChange('cost', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vendor
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Effective Date
                </label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Optional notes about this cost change..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={isLoading}
                iconName={isLoading ? "Loader2" : "Plus"}
                iconPosition="left"
                className={cn("w-full", isLoading && "animate-spin")}
              >
                {isLoading ? 'Adding...' : 'Add Cost Record'}
              </Button>
            </form>
          </div>

          {/* Cost History */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="TrendingUp" size={20} className="mr-2" />
              Cost History
            </h3>
            
            {costHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No cost history available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {costHistory.map((record, index) => (
                  <div
                    key={record.id}
                    className="p-4 border border-border rounded-lg bg-background"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(record.cost)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per {material.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">
                          {formatDate(record.effective_date)}
                        </p>
                        {record.vendors && (
                          <p className="text-xs text-muted-foreground">
                            {record.vendors.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {record.notes}
                      </p>
                    )}
                    
                    {index < costHistory.length - 1 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center text-xs text-muted-foreground">
                          {record.cost > costHistory[index + 1]?.cost ? (
                            <>
                              <Icon name="TrendingUp" size={12} className="mr-1 text-destructive" />
                              <span className="text-destructive">
                                +{formatCurrency(record.cost - costHistory[index + 1]?.cost)}
                              </span>
                            </>
                          ) : record.cost < costHistory[index + 1]?.cost ? (
                            <>
                              <Icon name="TrendingDown" size={12} className="mr-1 text-success" />
                              <span className="text-success">
                                {formatCurrency(record.cost - costHistory[index + 1]?.cost)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Icon name="Minus" size={12} className="mr-1" />
                              <span>No change</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CostTrackingModal;