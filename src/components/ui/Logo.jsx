import React from 'react';
import { cn } from '../../utils/cn';

const Logo = ({ 
  variant = 'horizontal', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-20'
  };

  const logoVariants = {
    horizontal: '/assets/images/buildledger-logo-full-horizontal.svg',
    vertical: '/assets/images/buildledger-logo-full-vertical.svg',
    icon: '/assets/images/buildledger-logo-icon-only.svg',
    text: '/assets/images/buildledger-logo-text-only.svg',
    watermark: '/assets/images/buildledger-logo-watermark.png',
    highres: '/assets/images/buildledger-logo-high-res.png'
  };

  const logoSrc = logoVariants[variant] || logoVariants.horizontal;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <img
      src={logoSrc}
      alt="BuildLedger"
      className={cn(
        sizeClass,
        'w-auto object-contain',
        'transition-opacity duration-200 ease-in-out',
        'hover:opacity-90',
        className
      )}
      loading="lazy"
      {...props}
    />
  );
};

export default Logo;