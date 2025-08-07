import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';
import { vendorMaterialsService } from '../../../services/vendorMaterialsService';

const VendorDetailModal = ({ vendor, isOpen, onClose, onEdit, onDelete }) => {
  const [linkedMaterials, setLinkedMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  useEffect(() => {
    if (isOpen && vendor) {
      loadLinkedMaterials();
    }
  }, [isOpen, vendor]);

  const loadLinkedMaterials = async () => {
    setIsLoadingMaterials(true);
    try {
      const materials = await vendorMaterialsService.getMaterialsByVendor(vendor.id);
      setLinkedMaterials(materials);
    } catch (error) {
      console.error('Error loading linked materials:', error);
      setLinkedMaterials([]);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  if (!isOpen || !vendor) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{vendor.name}</h2>
            {vendor.company_name && vendor.company_name !== vendor.name && (
              <p className="text-sm text-muted-foreground">{vendor.company_name}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              vendor.is_active
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            )}>
              {vendor.is_active ? 'Active' : 'Inactive'}
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
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="User" size={20} className="mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.contact_person && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Contact Person
                  </label>
                  <p className="text-sm text-foreground">{vendor.contact_person}</p>
                </div>
              )}
              {vendor.email && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <p className="text-sm text-foreground">
                    <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">
                      {vendor.email}
                    </a>
                  </p>
                </div>
              )}
              {vendor.phone && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Phone
                  </label>
                  <p className="text-sm text-foreground">
                    <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                      {vendor.phone}
                    </a>
                  </p>
                </div>
              )}
              {vendor.website && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Website
                  </label>
                  <p className="text-sm text-foreground">
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {vendor.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {vendor.address && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="MapPin" size={20} className="mr-2" />
                Address
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  {[
                    vendor.address.street,
                    vendor.address.city && vendor.address.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor.address.city || vendor.address.state,
                    vendor.address.zip
                  ].filter(Boolean).join('\n')}
                </p>
              </div>
            </div>
          )}

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Building" size={20} className="mr-2" />
              Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.tax_id && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Tax ID
                  </label>
                  <p className="text-sm text-foreground">{vendor.tax_id}</p>
                </div>
              )}
              {vendor.payment_terms && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Payment Terms
                  </label>
                  <p className="text-sm text-foreground">{vendor.payment_terms}</p>
                </div>
              )}
              {vendor.preferred_payment_method && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Preferred Payment Method
                  </label>
                  <p className="text-sm text-foreground">{vendor.preferred_payment_method}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {vendor.notes && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Icon name="FileText" size={20} className="mr-2" />
                Notes
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            </div>
          )}

          {/* Linked Materials */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Package" size={20} className="mr-2" />
              Linked Materials ({linkedMaterials.length})
            </h3>
            {isLoadingMaterials ? (
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading materials...</span>
              </div>
            ) : linkedMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Package" size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No materials linked to this vendor</p>
                <p className="text-xs mt-1">Materials can be linked when creating or editing materials</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {linkedMaterials.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="p-3 border border-border rounded-lg bg-muted/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">
                        {relationship.materials.name}
                      </h4>
                      {relationship.is_preferred && (
                        <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded">
                          Preferred
                        </span>
                      )}
                    </div>
                    {relationship.materials.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {relationship.materials.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Unit: {relationship.materials.unit}
                      </span>
                      {relationship.unit_cost && (
                        <span className="font-medium text-foreground">
                          ${relationship.unit_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {relationship.vendor_sku && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        SKU: {relationship.vendor_sku}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
              <Icon name="Info" size={20} className="mr-2" />
              Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Created Date
                </label>
                <p className="text-sm text-foreground">
                  {new Date(vendor.created_at).toLocaleDateString()}
                </p>
              </div>
              {vendor.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-foreground">
                    {new Date(vendor.updated_at).toLocaleDateString()}
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
              onClick={() => onEdit(vendor.id)}
            >
              Edit Vendor
            </Button>
            <Button
              variant="outline"
              iconName="Package"
              iconPosition="left"
            >
              View Materials
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Mail"
              onClick={() => window.location.href = `mailto:${vendor.email}`}
              disabled={!vendor.email}
            >
              Contact
            </Button>
            <Button
              variant="destructive"
              iconName="Trash2"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this vendor?')) {
                  onDelete(vendor.id);
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

export default VendorDetailModal;