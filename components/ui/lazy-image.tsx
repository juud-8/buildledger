'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  fill?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes,
  fill = false,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Generate optimized image sources
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.startsWith('http') || originalSrc.startsWith('//')) {
      return originalSrc
    }
    
    const baseName = originalSrc.split('.').slice(0, -1).join('.')
    return baseName
  }

  const baseSrc = getOptimizedSrc(src)

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <picture>
      {/* AVIF for modern browsers - best compression */}
      <source 
        srcSet={`${baseSrc}-optimized.avif`}
        type="image/avif"
        sizes={sizes}
      />
      
      {/* WebP for broader support */}
      <source 
        srcSet={`${baseSrc}-optimized.webp`}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Fallback to original */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </picture>
  )
}