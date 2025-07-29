'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { uploadLogo, deleteLogo, LogoUploadResult } from '@/lib/profileService'

interface LogoUploadProps {
  onUploadComplete?: (result: LogoUploadResult) => void
  className?: string
}

export function LogoUpload({ onUploadComplete, className = '' }: LogoUploadProps) {
  const { user, profile, refreshProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await uploadLogo(user.id, file)
      
      if (result.success) {
        // Refresh profile to get updated logo URL
        await refreshProfile()
        onUploadComplete?.(result)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Unexpected error during upload')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDeleteLogo = async () => {
    if (!user?.id) return

    setUploading(true)
    setError(null)

    try {
      const result = await deleteLogo(user.id)
      
      if (result.success) {
        await refreshProfile()
        onUploadComplete?.({ success: true })
      } else {
        setError(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Unexpected error during delete')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Current Logo Display */}
      {profile?.logo_url && (
        <div className="mb-4 text-center">
          <div className="relative inline-block">
            <Image
              src={profile.logo_url}
              alt="Company Logo"
              width={96}
              height={96}
              className="object-contain border-2 border-gray-200 rounded-lg"
              onError={(e) => {
                console.error('Logo failed to load:', profile.logo_url)
                // Hide the image on error
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <button
              onClick={handleDeleteLogo}
              disabled={uploading}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
              title="Delete logo"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-1">
              {profile?.logo_url ? 'Replace logo' : 'Upload your logo'}
            </p>
            <p className="text-xs text-gray-500">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPEG, PNG, WebP, SVG (max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {!error && !uploading && profile?.logo_url && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Logo uploaded successfully!</p>
        </div>
      )}
    </div>
  )
} 