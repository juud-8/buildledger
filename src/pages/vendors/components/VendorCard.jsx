import React from 'react';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const VendorCard = ({
  vendor,
  isSelected,
  onSelect,
  onViewDetails,
  onEdit,
  onDelete,
  onViewMaterials,
  onContactVendor
}) => {
  if (!vendor) return null;

  const handleClick = (e) => {
    if (e.target.closest('.action-button, .checkbox-wrapper')) {
      return;
    }
    onViewDetails(vendor.id);
  };

  return (
    <Card className={cn(
      "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20",
      isSelected && "ring-2 ring-primary/30 border-primary/40"
    )}>
      <div onClick={handleClick}>
        {/* Header with checkbox and status */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="checkbox-wrapper flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            vendor.is_active
              ? "bg-success/20 text-success"
              : "bg-muted text-muted-foreground"
          )}>
            {vendor.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Vendor Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {vendor.name}
          </h3>
          {vendor.company_name && vendor.company_name !== vendor.name && (
            <p className="text-sm text-muted-foreground mb-1">
              {vendor.company_name}
            </p>
          )}
          {vendor.contact_person && (
            <p className="text-sm text-muted-foreground flex items-center">
              <Icon name="User" size={14} className="mr-1" />
              {vendor.contact_person}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {vendor.email && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="Mail" size={14} className="mr-2 text-muted-foreground" />
              <span className="truncate">{vendor.email}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="Phone" size={14} className="mr-2 text-muted-foreground" />
              <span>{vendor.phone}</span>
            </div>
          )}
          {vendor.address && (
            <div className="flex items-start text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} className="mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="break-words">
                {[
                  vendor.address.street,
                  vendor.address.city && vendor.address.state ? `${vendor.address.city}, ${vendor.address.state}` : vendor.address.city || vendor.address.state,
                  vendor.address.zip
                ].filter(Boolean).join(' ')}
              </span>
            </div>
          )}
        </div>

        {/* Payment Terms */}
        {vendor.payment_terms && (
          <div className="mb-4">
            <div className="flex items-center text-sm">
              <Icon name="CreditCard" size={14} className="mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Payment Terms:</span>
              <span className="ml-1 font-medium text-foreground">{vendor.payment_terms}</span>
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground mb-4">
          Added {new Date(vendor.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Eye"
            onClick={() => onViewDetails(vendor.id)}
            className="action-button"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit3"
            onClick={() => onEdit(vendor.id)}
            className="action-button"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Package"
            onClick={() => onViewMaterials(vendor.id)}
            className="action-button"
            title="View Materials"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Mail"
            onClick={onContactVendor}
            className="action-button"
            title="Contact Vendor"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDelete(vendor.id)}
            className="action-button text-destructive hover:text-destructive"
          />
        </div>
      </div>
    </Card>
  );
};

export default VendorCard;