import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentlyUsedItems = ({ items, onItemSelect, cartItems }) => {
  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground flex items-center">
        <Icon name="Clock" size={16} className="mr-2" />
        Recently Used Items
      </h3>
      
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {items?.slice(0, 6)?.map(item => (
          <div
            key={item?.id}
            className="flex-shrink-0 bg-card border border-border rounded-lg p-3 min-w-[200px] hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <Icon name={item?.categoryIcon} size={16} className="mr-2 text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm leading-tight">
                    {item?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${item?.unitPrice?.toFixed(2)} {item?.unit}
                  </p>
                </div>
              </div>
              {cartItems?.[item?.id] && (
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {cartItems?.[item?.id]?.quantity}
                </div>
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onItemSelect(item, 1)}
              iconName="Plus"
              iconPosition="left"
              className="w-full"
            >
              Quick Add
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyUsedItems;