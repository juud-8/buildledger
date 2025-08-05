import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuantityAdjuster = ({ 
  quantity, 
  onQuantityChange, 
  min = 0, 
  max = 9999, 
  step = 1, 
  size = 'default' 
}) => {
  const handleDecrease = () => {
    const newQuantity = quantity - step;
    if (newQuantity >= min) {
      onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    const newQuantity = quantity + step;
    if (newQuantity <= max) {
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (e) => {
    const value = parseFloat(e?.target?.value) || 0;
    if (value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  const buttonSize = size === 'sm' ? 'xs' : 'sm';
  const inputWidth = size === 'sm' ? 'w-12' : 'w-16';

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleDecrease}
        disabled={quantity <= min}
        iconName="Minus"
        className="h-8 w-8 p-0"
      />
      
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className={`text-center h-8 ${inputWidth} px-1`}
      />
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleIncrease}
        disabled={quantity >= max}
        iconName="Plus"
        className="h-8 w-8 p-0"
      />
    </div>
  );
};

export default QuantityAdjuster;