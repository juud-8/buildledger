import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const FloatingActionButton = ({ 
  onClick, 
  icon = 'Plus', 
  disabled = false,
  className = '',
  variant = 'default',
  ...props 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size="lg"
      className={`
        fixed bottom-6 right-6 z-40 
        w-14 h-14 rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-200 
        ${className}
      `}
      {...props}
    >
      <Icon name={icon} size={24} />
    </Button>
  );
};

export default FloatingActionButton;