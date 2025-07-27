'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { hoverScale } from '@/lib/animations'
import Link from 'next/link'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  href,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-lg shadow-blue-500/20',
    secondary: 'bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const buttonContent = (
    <>
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      
      {/* Button content */}
      <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
      
      {/* Shimmer effect for primary button */}
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 -top-[2px] flex h-[calc(100%+4px)] w-[calc(100%+4px)] animate-pulse">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" />
        </div>
      )}
    </>
  )
  
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`
  
  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block">
        <motion.div
          className={buttonClasses}
          {...(!disabled && !loading ? hoverScale : {})}
        >
          {buttonContent}
        </motion.div>
      </Link>
    )
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...(!disabled && !loading ? hoverScale : {})}
    >
      {buttonContent}
    </motion.button>
  )
} 