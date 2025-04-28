"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface LibraryItemFormProps {
  initialData?: LibraryItemFormValues
  onSubmit: (data: LibraryItemFormValues) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function LibraryItemForm({ initialData, onSubmit, onCancel, isEditing = false }: LibraryItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values or existing item data
  const form = useForm<LibraryItemFormValues>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: initialData || {
      description: "",
      unit: "",
      price: 0,
    },
  })

  // Handle form submission
  async function handleSubmit(data: LibraryItemFormValues) {
    setIsSubmitting(true)

    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error saving library item:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
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
                {isEditing ? "Update Item" : "Save Item"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
