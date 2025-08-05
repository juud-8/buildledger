import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';

const ItemCard = ({ 
  item, 
  viewMode = 'grid', 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onAddToFavorites, 
  onViewUsageHistory 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Foundation': 'Building',
      'Framing': 'Grid3X3',
      'Electrical': 'Zap',
      'Plumbing': 'Droplets',
      'HVAC': 'Wind',
      'Roofing': 'Home',
      'Labor': 'Users',
      'Equipment': 'Truck'
    };
    return iconMap?.[category] || 'Package';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const stockStatus = item?.inStock ? (item?.currentStock && item?.reorderLevel && item?.currentStock <= item?.reorderLevel ? { status: 'Low Stock', color: 'warning' } : { status: 'In Stock', color: 'success' }) : { status: 'Out of Stock', color: 'error' };

  if (viewMode === 'list') {
    return (
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`p-2 rounded-lg bg-${item?.category?.toLowerCase()}/10 text-${item?.category?.toLowerCase()}`}>
              <Icon 
                name={getCategoryIcon(item?.category)} 
                size={20} 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <CardTitle className="truncate">{item?.name}</CardTitle>
                <span className={`px-2 py-1 text-xs rounded-full bg-${stockStatus?.color}/10 text-${stockStatus?.color}`}>
                  {stockStatus?.status}
                </span>
              </div>
              <CardDescription className="truncate">{item?.description}</CardDescription>
              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                <span>SKU: {item?.sku}</span>
                <span>Unit: {item?.unit}</span>
                <span>Used: {item?.usageCount} times</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cost</div>
              <div className="font-medium text-foreground">
                {formatCurrency(item?.costPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Selling</div>
              <div className="font-medium text-foreground">
                {formatCurrency(item?.sellingPrice)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Markup</div>
              <div className="font-medium text-success">
                {item?.markupPercentage}%
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                iconName="Edit"
                onClick={() => onEdit?.(item?.id)}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="Copy"
                onClick={() => onDuplicate?.(item?.id)}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="Star"
                onClick={() => onAddToFavorites?.(item?.id)}
              />
              <Button
                variant="ghost"
                size="sm"
                iconName="MoreHorizontal"
                onClick={() => setShowActions(!showActions)}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${item?.category?.toLowerCase()}/10 text-${item?.category?.toLowerCase()}`}>
              <Icon 
                name={getCategoryIcon(item?.category)} 
                size={20} 
              />
            </div>
            <div>
              <CardTitle className="line-clamp-1">{item?.name}</CardTitle>
              <CardDescription>{item?.category}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
            onClick={() => setShowActions(!showActions)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {item?.description}
        </p>

        {/* Item Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unit:</span>
            <span className="text-foreground font-medium">{item?.unit}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SKU:</span>
            <span className="text-foreground font-medium">{item?.sku}</span>
          </div>
          {item?.supplier && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="text-foreground font-medium truncate ml-2">{item?.supplier}</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Cost Price</div>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(item?.costPrice)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Selling Price</div>
              <div className="text-sm font-semibold text-foreground">
                {formatCurrency(item?.sellingPrice)}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Markup:</span>
            <span className="text-sm font-medium text-success">
              {item?.markupPercentage}%
            </span>
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full bg-${stockStatus?.color}/10 text-${stockStatus?.color}`}>
              {stockStatus?.status}
            </span>
            {item?.currentStock && (
              <span className="text-xs text-muted-foreground">
                {item?.currentStock} available
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Used {item?.usageCount} times
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              iconName="Edit"
              onClick={() => onEdit?.(item?.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="Copy"
              onClick={() => onDuplicate?.(item?.id)}
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="Star"
              onClick={() => onAddToFavorites?.(item?.id)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="BarChart3"
            onClick={() => onViewUsageHistory?.(item?.id)}
          />
        </div>

        {/* Action Dropdown */}
        {showActions && (
          <div className="absolute top-12 right-4 bg-card border border-border rounded-lg shadow-lg py-2 z-10 min-w-[160px]">
            <button
              onClick={() => {
                onEdit?.(item?.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Edit Item
            </button>
            <button
              onClick={() => {
                onDuplicate?.(item?.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
            >
              <Icon name="Copy" size={16} className="mr-2" />
              Duplicate
            </button>
            <button
              onClick={() => {
                onAddToFavorites?.(item?.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
            >
              <Icon name="Star" size={16} className="mr-2" />
              Add to Favorites
            </button>
            <button
              onClick={() => {
                onViewUsageHistory?.(item?.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center"
            >
              <Icon name="BarChart3" size={16} className="mr-2" />
              Usage History
            </button>
            <div className="border-t border-border my-1"></div>
            <button
              onClick={() => {
                onDelete?.(item?.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center text-error"
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Delete
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemCard;