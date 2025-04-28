"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the form schema with validation
const libraryItemSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  unit: z.string().min(1, {
    message: "Unit is required.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
})

type LibraryItemFormValues = z.infer<typeof libraryItemSchema>

// Common units for construction and service work
const commonUnits = [
  { value: "each", label: "Each" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "sq_ft", label: "Square Foot" },
  { value: "sq_yd", label: "Square Yard" },
  { value: "linear_ft", label: "Linear Foot" },
  { value: "gallon", label: "Gallon" },
  { value: "pound", label: "Pound" },
]

export default function LibraryItemPage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values or existing item data
  const form = useForm<LibraryItemFormValues>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: {
      description: "",
      unit: "",
      price: 0,
    },
  })

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Handle form submission
  async function onSubmit(data: LibraryItemFormValues) {
    setIsSubmitting(true)

    try {
      // Here you would typically save the data to your database
      console.log("Form data:", data)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect back to library page after successful submission
      router.push("/library")
    } catch (error) {
      console.error("Error saving library item:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel button click
  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{isEditing ? "Edit Library Item" : "Add Library Item"}</h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Update the details of this service or material item."
            : "Add a new service or material to your library for quick access when creating quotes and invoices."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name/Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., Standard Electrical Outlet Installation, Premium Interior Paint (1 Gallon), Hourly Labor Rate, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Provide a clear, detailed description of the service or material.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unit Field */}
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commonUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Unit...</SelectItem>
                        </SelectContent>
                      </Select>
                      {field.value === "custom" && (
                        <Input
                          className="mt-2"
                          placeholder="Enter custom unit"
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                      <FormDescription>How is this item measured or sold?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Field */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" min="0" placeholder="0.00" className="pl-7" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Price per unit (excluding tax).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Item
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
