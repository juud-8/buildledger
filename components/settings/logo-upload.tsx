"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Check, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface LogoUploadProps {
  currentLogo?: string
  onSave?: (file: File) => Promise<void>
}

export function LogoUpload({ currentLogo, onSave }: LogoUploadProps) {
  const [logo, setLogo] = useState<string | null>(currentLogo || null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    handleFile(selectedFile)
  }

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return

    // Reset states
    setError(null)
    setSuccess(false)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid image file (PNG, JPG, or SVG)")
      return
    }

    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size should be less than 2MB")
      return
    }

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogo(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Store file for upload
    setFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    handleFile(droppedFile)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    if (!file || !onSave) return

    try {
      setIsLoading(true)
      setError(null)
      await onSave(file)
      setSuccess(true)
      // Reset file state but keep the preview
      setFile(null)
    } catch (err) {
      setError("Failed to save logo. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Logo</CardTitle>
        <CardDescription>Upload your business logo to display on invoices, quotes, and your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Preview */}
        {logo ? (
          <div className="relative w-full flex justify-center">
            <div className="relative w-64 h-32 bg-card border border-border rounded-md overflow-hidden">
              <img src={logo || "/placeholder.svg"} alt="Business Logo" className="w-full h-full object-contain p-2" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveLogo}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove Logo</span>
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "w-full h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
            )}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Drag and drop your logo here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileChange}
        />

        {/* Upload Button (visible when no logo is selected) */}
        {!logo && (
          <Button variant="outline" className="w-full" onClick={triggerFileInput}>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Logo
          </Button>
        )}

        {/* File Format Info */}
        <div className="text-xs text-muted-foreground">
          <p>Recommended file formats: PNG, JPG, SVG</p>
          <p>Maximum file size: 2MB</p>
          <p>For best results, use a transparent background (PNG or SVG)</p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
            <Check className="h-4 w-4" />
            <AlertDescription>Logo successfully updated!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!file || isLoading} className="ml-auto">
          {isLoading ? (
            <>
              <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
              Saving...
            </>
          ) : (
            "Save Logo"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
