'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.3 }: FadeInProps) {
  return (
    <div
      className={cn('animate-fade-in', className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

interface SlideInProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
}

export function SlideIn({ 
  children, 
  className, 
  direction = 'up', 
  delay = 0, 
  duration = 0.3 
}: SlideInProps) {
  return (
    <div
      className={cn(`animate-slide-in-${direction}`, className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function ScaleIn({ children, className, delay = 0, duration = 0.3 }: ScaleInProps) {
  return (
    <div
      className={cn('animate-scale-in', className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

// Staggered children animation
interface StaggeredProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

export function Staggered({ 
  children, 
  className, 
  staggerDelay = 0.1, 
  initialDelay = 0 
}: StaggeredProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{
            animationDelay: `${initialDelay + (index * staggerDelay)}s`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}