"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Trash2, Plus, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// Define the form schema
const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  clientEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  invoiceDate: z.date(),
  dueDate: z.date(),
  items: z.array(
    z.object({
      description: z.string().min(1, { message: "Description is required" }),
      quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
      unitPrice: z.number().min(0, { message: "Unit price must be at least 0" }),
    }),
  ),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  paymentMethods: z.object({
    zelle: z.boolean().default(false),
    venmo: z.boolean().default(false),
    paypal: z.boolean().default(false),
    cashapp: z.boolean().default(false),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateInvoicePage() {
  const router = useRouter()
  const [items, setItems] = useState([{ description: "", quantity: 1, unitPrice: 0 }])

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 7.5, // Default tax rate
      notes: "",
      paymentMethods: {
        zelle: true,
        venmo: true,
        paypal: true,
        cashapp: false,
      },
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
  function onSubmit(data: FormValues) {
    console.log(data)
    // Here you would typically save the invoice to your database
    // Then redirect to the invoices list
    router.push("/invoices")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
        <p className="text-muted-foreground">Fill out the form below to create a new invoice</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the client details for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        <Input placeholder="client@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Dates</CardTitle>
              <CardDescription>Set the issue and due dates for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Date</FormLabel>
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
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

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add the products or services you're invoicing for</CardDescription>
                </div>
                <Button type="button" onClick={addItem} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid md:grid-cols-12 md:gap-4 py-2 px-4 bg-muted/50 rounded-md text-sm font-medium">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Item Rows */}
                {items.map((item, index) => (
                  <div key={index} className="space-y-4 md:space-y-0">
                    {/* Mobile Item Header */}
                    <div className="flex justify-between items-center md:hidden">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                      <div className="col-span-5">
                        <Textarea
                          placeholder="Item description"
                          className="resize-none"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          className="text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", Number(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="text-center"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2 text-center font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </div>
                      <div className="col-span-1 text-right">
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      <div>
                        <FormLabel className="text-xs text-muted-foreground">Description</FormLabel>
                        <Textarea
                          placeholder="Item description"
                          className="resize-none mt-1"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">Quantity</FormLabel>
                          <Input
                            type="number"
                            min="1"
                            className="mt-1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", Number(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <FormLabel className="text-xs text-muted-foreground">Unit Price</FormLabel>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="mt-1"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-xs text-muted-foreground">Line Total</FormLabel>
                        <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                      </div>
                      <Separator className="md:hidden" />
                    </div>
                  </div>
                ))}

                {/* Mobile Add Item Button */}
                <div className="md:hidden">
                  <Button type="button" onClick={addItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Totals</CardTitle>
              <CardDescription>Review and adjust the invoice totals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
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
                            step="0.1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value) || 0)
                              form.trigger("taxRate")
                            }}
                          />
                        </FormControl>
                        <FormDescription>Enter the tax rate percentage to apply to this invoice</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax ({form.getValues("taxRate")}%):</span>
                    <span className="font-medium">{formatCurrency(calculateTaxAmount())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-xl font-bold">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
              <CardDescription>Add any additional notes or terms for this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes, payment terms, or special instructions..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>These notes will be visible to your client on the invoice</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Select the payment methods you accept for this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethods.zelle"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Zelle</FormLabel>
                        <FormDescription>payments@tradetab.com</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethods.venmo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Venmo</FormLabel>
                        <FormDescription>@trade-tab</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethods.paypal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>PayPal</FormLabel>
                        <FormDescription>payments@tradetab.com</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethods.cashapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>CashApp</FormLabel>
                        <FormDescription>$tradetab</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" className="sm:order-1" onClick={() => router.push("/invoices")}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" className="sm:order-2">
              <Save className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
