"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Trash2, Plus, Send, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Define the form schema
const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  clientEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  quoteDate: z.date(),
  expiryDate: z.date(),
  items: z.array(
    z.object({
      description: z.string().min(1, { message: "Description is required" }),
      quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
      unitPrice: z.number().min(0, { message: "Unit price must be at least 0" }),
    }),
  ),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NewQuotePage() {
  const router = useRouter()
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }])

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      quoteDate: new Date(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      notes: "",
      termsAndConditions:
        "This quote is valid for 30 days from the date of issue. Payment terms are net 30 days from invoice date.",
    },
  })

  // Calculate totals
  const calculateLineTotals = () => {
    return items.map((item) => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }))
  }

  const calculateSubtotal = () => {
    return calculateLineTotals().reduce((sum, item) => sum + item.lineTotal, 0)
  }

  const calculateTaxAmount = () => {
    const taxRate = form.getValues("taxRate") || 0
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount()
  }

  // Add a new item
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
    form.setValue("items", [...form.getValues("items"), { description: "", quantity: 1, unitPrice: 0 }])
  }

  // Remove an item
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
    form.setValue("items", newItems)
  }

  // Update item values
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
    form.setValue(`items.${index}.${field}`, value)
  }

  // Handle form submission
  function onSubmit(data: FormValues, action: "send" | "draft") {
    console.log(data, action)
    // Here you would typically save the quote to your database
    // Then redirect to the quotes list
    router.push("/quotes")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">New Quote</h1>
        <p className="text-muted-foreground">Create a new quote for your client.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data, "send"))} className="space-y-8">
          {/* Client Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Email</FormLabel>
                      <FormControl>
                        <Input placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Dates */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="quoteDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Quote Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Quote Items</h3>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 py-2 font-medium text-sm text-muted-foreground">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Item Rows */}
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2 font-medium">{formatCurrency(item.quantity * item.unitPrice)}</div>
                    <div className="col-span-1 text-right">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quote Totals</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number.parseFloat(e.target.value) || 0)
                                form.trigger("taxRate")
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tax ({form.getValues("taxRate")}%):</span>
                      <span>{formatCurrency(calculateTaxAmount())}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes or special instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>These notes will be visible to your client on the quote.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add your terms and conditions..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>Standard terms that apply to this quote.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/quotes")}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.handleSubmit((data) => onSubmit(data, "draft"))()}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4" />
              Send Quote
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
