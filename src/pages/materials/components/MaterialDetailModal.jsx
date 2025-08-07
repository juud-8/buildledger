import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';
import { vendorMaterialsService } from '../../../services/vendorMaterialsService';

const MaterialDetailModal = ({ material, isOpen, onClose, onEdit, onDelete, onTrackCost }) => {
  const [linkedVendors, setLinkedVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  useEffect(() => {
    if (isOpen && material) {
      loadLinkedVendors();
    }
  }, [isOpen, material]);

  const loadLinkedVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const vendors = await vendorMaterialsService.getVendorsByMaterial(material.id);
      setLinkedVendors(vendors);
    } catch (error) {
      console.error('Error loading linked vendors:', error);
      setLinkedVendors([]);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  if (!isOpen || !material) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStockStatus = () => {
    if (material.current_stock <= 0) {
      return { status: 'Out of Stock', color: 'text-destructive', icon: 'AlertTriangle' };
    } else if (material.current_stock <= material.reorder_point) {
      return { status: 'Low Stock', color: 'text-warning', icon: 'AlertCircle' };
    }
    return { status: 'In Stock', color: 'text-success', icon: 'CheckCircle' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{material.name}</h2>
            {material.description && (
              <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              material.is_active
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            )}>
              {material.is_active ? 'Active' : 'Inactive'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Info" size={20} className="mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Category
                </label>
                <p className="text-sm text-foreground capitalize">{material.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Unit
                </label>
                <p className="text-sm text-foreground">{material.unit}</p>
              </div>
              {material.sku && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    SKU
                  </label>
                  <p className="text-sm text-foreground">{material.sku}</p>
                </div>
              )}
              {material.vendor_sku && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Vendor SKU
                  </label>
                  <p className="text-sm text-foreground">{material.vendor_sku}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information */}
          {material.vendors && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="Store" size={20} className="mr-2" />
                Vendor Information
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Vendor Name
                    </label>
                    <p className="text-sm text-foreground">{material.vendors.name}</p>
                  </div>
                  {material.vendors.company_name && material.vendors.company_name !== material.vendors.name && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Company
                      </label>
                      <p className="text-sm text-foreground">{material.vendors.company_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="DollarSign" size={20} className="mr-2" />
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Unit Cost
                </label>
                <p className="text-lg font-semibold text-foreground">
                  ${material.unit_cost?.toFixed(2) || '0.00'}
                  <span className="text-sm text-muted-foreground ml-1">per {material.unit}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Unit Price
                </label>
                <p className="text-lg font-semibold text-foreground">
                  ${material.unit_price?.toFixed(2) || '0.00'}
                  <span className="text-sm text-muted-foreground ml-1">per {material.unit}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Profit Margin
                </label>
                <p className={cn(
                  "text-lg font-semibold",
                  (material.profit_margin || 0) > 25 ? "text-success" : 
                  (material.profit_margin || 0) > 15 ? "text-warning" : "text-muted-foreground"
                )}>
                  {material.profit_margin?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Package" size={20} className="mr-2" />
              Inventory Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Current Stock
                </label>
                <div className="flex items-center">
                  <p className="text-lg font-semibold text-foreground">
                    {material.current_stock || 0}
                  </p>
                  <div className={cn(
                    "ml-2 flex items-center",
                    stockStatus.color
                  )}>
                    <Icon name={stockStatus.icon} size={16} className="mr-1" />
                    <span className="text-xs font-medium">{stockStatus.status}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Minimum Stock
                </label>
                <p className="text-lg font-semibold text-foreground">
                  {material.minimum_stock || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Reorder Point
                </label>
                <p className="text-lg font-semibold text-foreground">
                  {material.reorder_point || 0}
                </p>
              </div>
              {material.lead_time_days && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Lead Time
                  </label>
                  <p className="text-lg font-semibold text-foreground">
                    {material.lead_time_days} days
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked Vendors */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Store" size={20} className="mr-2" />
              Available Vendors ({linkedVendors.length})
            </h3>
            {isLoadingVendors ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading vendors...</span>
              </div>
            ) : linkedVendors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Store" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vendors linked to this material</p>
                <p className="text-xs mt-1">Add vendors to compare pricing and availability</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {linkedVendors.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="p-3 border border-border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">
                        {relationship.vendors.name}
                      </h4>
                      {relationship.is_preferred && (
                        <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                          Preferred
                        </span>
                      )}
                    </div>
                    {relationship.vendors.company_name && relationship.vendors.company_name !== relationship.vendors.name && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {relationship.vendors.company_name}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-foreground">
                        ${relationship.unit_cost?.toFixed(2) || '0.00'} per {material.unit}
                      </span>
                      {relationship.lead_time_days && (
                        <span className="text-muted-foreground">
                          {relationship.lead_time_days}d lead time
                        </span>
                      )}
                    </div>
                    {relationship.vendor_sku && (
                      <div className="text-xs text-muted-foreground mb-2">
                        Vendor SKU: {relationship.vendor_sku}
                      </div>
                    )}
                    {relationship.minimum_order_quantity && relationship.minimum_order_quantity > 1 && (
                      <div className="text-xs text-muted-foreground">
                        Min order: {relationship.minimum_order_quantity} {material.unit}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center space-x-1 text-xs">
                        {relationship.vendors.email && (
                          <a
                            href={`mailto:${relationship.vendors.email}`}
                            className="text-primary hover:underline"
                            title="Email vendor"
                          >
                            <Icon name="Mail" size={14} />
                          </a>
                        )}
                        {relationship.vendors.phone && (
                          <a
                            href={`tel:${relationship.vendors.phone}`}
                            className="text-primary hover:underline"
                            title="Call vendor"
                          >
                            <Icon name="Phone" size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          {material.specifications && Object.keys(material.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="FileText" size={20} className="mr-2" />
                Specifications
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <pre className="text-sm text-foreground whitespace-pre-wrap">
                  {JSON.stringify(material.specifications, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Clock" size={20} className="mr-2" />
              Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Created Date
                </label>
                <p className="text-sm text-foreground">
                  {new Date(material.created_at).toLocaleDateString()}
                </p>
              </div>
              {material.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-foreground">
                    {new Date(material.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Edit3"
              iconPosition="left"
              onClick={() => onEdit(material.id)}
            >
              Edit Material
            </Button>
            <Button
              variant="outline"
              iconName="TrendingUp"
              iconPosition="left"
              onClick={() => onTrackCost(material.id)}
            >
              Track Cost
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="destructive"
              iconName="Trash2"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this material?')) {
                  onDelete(material.id);
                  onClose();
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailModal;