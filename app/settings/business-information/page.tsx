"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const businessFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  businessLogo: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  taxId: z.string().optional(),
  website: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

// This simulates a business profile that would be fetched from an API
const defaultValues: Partial<BusinessFormValues> = {
  businessName: "Doht Construction",
  businessLogo: "/buildledger-logo.png",
  email: "jeff@dohtconstruction.com",
  phone: "(412) 555-1234",
  address: "123 Main Street",
  city: "Pittsburgh",
  state: "PA",
  zipCode: "15213",
  country: "United States",
  taxId: "12-3456789",
  website: "https://dohtconstruction.com",
}

export default function BusinessInformationPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues.businessLogo || null)

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues,
  })

  function onSubmit(data: BusinessFormValues) {
    // In a real app, you would send this data to your API
    console.log(data)
    toast({
      title: "Business information updated",
      description: "Your business information has been updated successfully.",
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Logo must be PNG, JPG, or SVG format",
        variant: "destructive",
      })
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setLogoPreview(result)
      form.setValue("businessLogo", result)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    form.setValue("businessLogo", "")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Business Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your business details that will appear on invoices and quotes.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Logo Upload */}
          <FormField
            control={form.control}
            name="businessLogo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Logo</FormLabel>
                <FormDescription>Upload your business logo to display on invoices and quotes.</FormDescription>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 w-full max-w-xs flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors ${
                        logoPreview ? "border-primary/30" : "border-muted"
                      }`}
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Drag & drop or click to upload (PNG, JPG, SVG, max 2MB)
                      </p>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>

                  {logoPreview && (
                    <div className="relative">
                      <div className="border rounded-lg p-2 w-32 h-32 flex items-center justify-center">
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Business logo preview"
                          width={100}
                          height={100}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove logo</span>
                      </Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Name */}
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your business address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Country */}
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tax ID and Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax ID or EIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yourwebsite.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  )
}
