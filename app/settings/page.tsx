"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

// Define the form schemas
const businessFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  defaultTaxRate: z.coerce.number().min(0).max(100).optional(),
  currency: z.string().default("USD"),
  dateFormat: z.string().default("MM/DD/YYYY"),
  logo: z.string().optional(),
})

const accountFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  })

const paymentMethodsFormSchema = z.object({
  zelleEnabled: z.boolean().default(false),
  zelleEmail: z.string().email().optional(),
  zellePhone: z.string().optional(),
  venmoEnabled: z.boolean().default(false),
  venmoUsername: z.string().optional(),
  paypalEnabled: z.boolean().default(false),
  paypalEmail: z.string().email().optional(),
  cashappEnabled: z.boolean().default(false),
  cashappUsername: z.string().optional(),
})

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business")
  const [isSaving, setIsSaving] = useState(false)

  // Initialize the business form
  const businessForm = useForm<z.infer<typeof businessFormSchema>>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      businessName: "TradeTab",
      email: "contact@tradetab.com",
      phone: "(412) 555-1234",
      address: "123 Main St, Pittsburgh, PA 15222",
      taxId: "12-3456789",
      defaultTaxRate: 7.5,
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      logo: "",
    },
  })

  // Initialize the account form
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "Jeff Doht",
      email: "jeff@tradetab.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Initialize the payment methods form
  const paymentMethodsForm = useForm<z.infer<typeof paymentMethodsFormSchema>>({
    resolver: zodResolver(paymentMethodsFormSchema),
    defaultValues: {
      zelleEnabled: true,
      zelleEmail: "payments@tradetab.com",
      zellePhone: "",
      venmoEnabled: true,
      venmoUsername: "@trade-tab",
      paypalEnabled: true,
      paypalEmail: "payments@tradetab.com",
      cashappEnabled: false,
      cashappUsername: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: any) {
    setIsSaving(true)
    console.log("Form data:", data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="mt-4 space-y-6">
          <Form {...businessForm}>
            <form onSubmit={businessForm.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details that will appear on your invoices and quotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="businessLogo">Business Logo</Label>
                      {businessForm.getValues("logo") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => businessForm.setValue("logo", "")}
                          className="h-8 text-xs"
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>

                    {businessForm.getValues("logo") ? (
                      <div className="relative w-full max-w-xs mx-auto">
                        <div className="w-full h-32 border border-border rounded-md overflow-hidden flex items-center justify-center bg-card">
                          <img
                            src={
                              businessForm.getValues("logo") ||
                              "/placeholder.svg?height=128&width=256&query=your+logo+here"
                            }
                            alt="Business Logo"
                            className="max-w-full max-h-full object-contain p-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full max-w-xs mx-auto h-32 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload your logo</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or SVG (max 2MB)</p>
                        <input
                          id="logo-upload"
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // Validate file size (max 2MB)
                              if (file.size > 2 * 1024 * 1024) {
                                alert("File size should be less than 2MB")
                                return
                              }

                              const reader = new FileReader()
                              reader.onload = (e) => {
                                businessForm.setValue("logo", e.target?.result as string)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      Your logo will appear on all invoices and quotes you send to clients
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={businessForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID / EIN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={businessForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoice & Quote Settings</CardTitle>
                  <CardDescription>Configure default settings for your invoices and quotes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <FormField
                      control={businessForm.control}
                      name="defaultTaxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={businessForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="mt-4 space-y-6">
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={accountForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={accountForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="mt-4 space-y-6">
          <Form {...paymentMethodsForm}>
            <form onSubmit={paymentMethodsForm.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure payment methods that will be displayed on your invoices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zelle */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Zelle</h3>
                        <p className="text-sm text-muted-foreground">Accept payments via Zelle</p>
                      </div>
                      <FormField
                        control={paymentMethodsForm.control}
                        name="zelleEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={paymentMethodsForm.control}
                        name="zelleEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zelle Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!paymentMethodsForm.watch("zelleEnabled")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={paymentMethodsForm.control}
                        name="zellePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zelle Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!paymentMethodsForm.watch("zelleEnabled")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Venmo */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Venmo</h3>
                        <p className="text-sm text-muted-foreground">Accept payments via Venmo</p>
                      </div>
                      <FormField
                        control={paymentMethodsForm.control}
                        name="venmoEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={paymentMethodsForm.control}
                      name="venmoUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venmo Username</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!paymentMethodsForm.watch("venmoEnabled")} />
                          </FormControl>
                          <FormDescription>Include the @ symbol (e.g., @username)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* PayPal */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">PayPal</h3>
                        <p className="text-sm text-muted-foreground">Accept payments via PayPal</p>
                      </div>
                      <FormField
                        control={paymentMethodsForm.control}
                        name="paypalEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={paymentMethodsForm.control}
                      name="paypalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PayPal Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!paymentMethodsForm.watch("paypalEnabled")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* CashApp */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">CashApp</h3>
                        <p className="text-sm text-muted-foreground">Accept payments via CashApp</p>
                      </div>
                      <FormField
                        control={paymentMethodsForm.control}
                        name="cashappEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={paymentMethodsForm.control}
                      name="cashappUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CashApp Username</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!paymentMethodsForm.watch("cashappEnabled")} />
                          </FormControl>
                          <FormDescription>Include the $ symbol (e.g., $username)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
