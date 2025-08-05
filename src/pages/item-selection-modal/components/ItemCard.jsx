import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import QuantityAdjuster from './QuantityAdjuster';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/Card';

const ItemCard = ({ 
  item, 
  viewMode = 'grid', 
  onItemSelect, 
  isInCart, 
  cartQuantity = 0, 
  onQuantityChange 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Calculate final price with markup
  const finalPrice = item?.unitPrice * (1 + item?.markup / 100);

  // Handle drag start
  const handleDragStart = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    setDragOffset({
      x: e?.clientX - rect?.left,
      y: e?.clientY - rect?.top
    });
    
    // Set drag data
    e?.dataTransfer?.setData('application/json', JSON.stringify({
      item,
      type: 'construction-item'
    }));
    
    // Add visual feedback
    if (e?.currentTarget?.style) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    if (e?.currentTarget?.style) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const stockStatus = item?.stockStatus || 'unknown';

  if (viewMode === 'list') {
    return (
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="cursor-move"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-3">
              <Icon name={item?.categoryIcon} size={24} className="text-primary" />
              <div>
                <CardTitle>{item?.name}</CardTitle>
                <CardDescription>{item?.description}</CardDescription>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-muted-foreground">SKU: {item?.sku}</span>
                  <span className="text-sm text-muted-foreground">Supplier: {item?.supplier}</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${stockStatus.replace('_', '-')}/10 text-${stockStatus.replace('_', '-')}`}>
                    {stockStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-foreground">${finalPrice?.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{item?.unit}</p>
              {item?.markup > 0 && (
                <p className="text-xs text-muted-foreground">+{item?.markup}% markup</p>
              )}
            </div>
            
            {isInCart ? (
              <QuantityAdjuster
                quantity={cartQuantity}
                onQuantityChange={(newQuantity) => onQuantityChange(item?.id, newQuantity)}
              />
            ) : (
              <Button
                onClick={() => onItemSelect(item, 1)}
                iconName="Plus"
                iconPosition="left"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="cursor-move"
    >
      <CardHeader>
        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded-full bg-${stockStatus.replace('_', '-')}/10 text-${stockStatus.replace('_', '-')}`}>
            {stockStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Cart Quantity Badge */}
        {isInCart && (
          <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
            {cartQuantity}
          </div>
        )}

        {/* Item Header */}
        <div className="flex items-center mb-3">
          <Icon name={item?.categoryIcon} size={20} className="mr-3 text-primary" />
          <div className="flex-1">
            <CardTitle className="leading-tight">{item?.name}</CardTitle>
            <CardDescription>SKU: {item?.sku}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Item Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {item?.description}
        </p>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-foreground">${finalPrice?.toFixed(2)}</span>
            {item?.markup > 0 && (
              <span className="text-xs text-muted-foreground">+{item?.markup}%</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{item?.unit}</p>
          {item?.seasonalPricing && (
            <p className="text-xs text-warning font-medium">Seasonal Pricing</p>
          )}
        </div>

        {/* Action Button */}
        {isInCart ? (
          <QuantityAdjuster
            quantity={cartQuantity}
            onQuantityChange={(newQuantity) => onQuantityChange(item?.id, newQuantity)}
            size="sm"
          />
        ) : (
          <Button
            onClick={() => onItemSelect(item, 1)}
            iconName="Plus"
            iconPosition="left"
            size="sm"
            className="w-full"
          >
            Add to Cart
          </Button>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="space-y-1">
              <p><strong>Supplier:</strong> {item?.supplier}</p>
              <p><strong>Tax Category:</strong> {item?.taxCategory}</p>
              <p><strong>Usage:</strong> {item?.usageFrequency}% projects</p>
              {item?.markup > 0 && (
                <p><strong>Base Price:</strong> ${item?.unitPrice?.toFixed(2)}</p>
              )}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ItemCard;