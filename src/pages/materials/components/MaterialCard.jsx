import React from 'react';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const MaterialCard = ({
  material,
  isSelected,
  onSelect,
  onViewDetails,
  onEdit,
  onDelete,
  onTrackCost
}) => {
  if (!material) return null;

  const handleClick = (e) => {
    if (e.target.closest('.action-button, .checkbox-wrapper')) {
      return;
    }
    onViewDetails(material.id);
  };

  const getStockStatus = () => {
    if (material.current_stock <= 0) {
      return { status: 'Out of Stock', color: 'text-destructive bg-destructive/10' };
    } else if (material.current_stock <= material.reorder_point) {
      return { status: 'Low Stock', color: 'text-warning bg-warning/10' };
    }
    return { status: 'In Stock', color: 'text-success bg-success/10' };
  };

  const stockStatus = getStockStatus();
  const profitMargin = material.profit_margin || 0;

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
            material.is_active
              ? "bg-success/20 text-success"
              : "bg-muted text-muted-foreground"
          )}>
            {material.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Material Info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {material.name}
          </h3>
          {material.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {material.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-muted/50 rounded text-muted-foreground">
              {material.category}
            </span>
            {material.sku && (
              <span className="px-2 py-1 bg-muted/50 rounded text-muted-foreground">
                SKU: {material.sku}
              </span>
            )}
          </div>
        </div>

        {/* Vendor Info */}
        {material.vendors && (
          <div className="mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="Store" size={14} className="mr-1" />
              <span className="truncate">{material.vendors.name}</span>
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div className="mb-4">
          <div className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            stockStatus.color
          )}>
            <Icon 
              name={material.current_stock <= 0 ? "AlertTriangle" : material.current_stock <= material.reorder_point ? "AlertCircle" : "CheckCircle"} 
              size={12} 
              className="mr-1" 
            />
            {stockStatus.status}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Current: {material.current_stock || 0}</span>
              <span>Min: {material.minimum_stock || 0}</span>
            </div>
            {material.reorder_point && (
              <div className="text-xs mt-1">
                Reorder at: {material.reorder_point}
              </div>
            )}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cost:</span>
              <span className="ml-1 font-medium text-foreground">
                ${material.unit_cost?.toFixed(2) || '0.00'}/{material.unit}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Price:</span>
              <span className="ml-1 font-medium text-foreground">
                ${material.unit_price?.toFixed(2) || '0.00'}/{material.unit}
              </span>
            </div>
          </div>
          {profitMargin > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Profit Margin:</span>
              <span className={cn(
                "ml-1 font-medium",
                profitMargin > 25 ? "text-success" : profitMargin > 15 ? "text-warning" : "text-muted-foreground"
              )}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* SKUs */}
        {material.vendor_sku && (
          <div className="mb-4">
            <div className="text-xs text-muted-foreground">
              <span>Vendor SKU: {material.vendor_sku}</span>
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-muted-foreground mb-4">
          Added {new Date(material.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Eye"
            onClick={() => onViewDetails(material.id)}
            className="action-button"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit3"
            onClick={() => onEdit(material.id)}
            className="action-button"
          />
          <Button
            variant="ghost"
            size="sm"
            iconName="TrendingUp"
            onClick={() => onTrackCost(material.id)}
            className="action-button"
            title="Track Cost"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Trash2"
            onClick={() => onDelete(material.id)}
            className="action-button text-destructive hover:text-destructive"
          />
        </div>
      </div>
    </Card>
  );
};

export default MaterialCard;