import React from 'react';
import { cn } from '../utils/cn';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "transition-all duration-300 ease-in-out",
        "hover:shadow-glow-primary hover:opacity-90",
        className
      )}
      onError={(e) => {
        e.target.src = "/assets/images/buildledger-logo-watermark.png"
      }}
      {...props}
    />
  );
}

export default Image;
