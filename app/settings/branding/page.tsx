"use client"

import { useState } from "react"
import { LogoUpload } from "@/components/settings/logo-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BrandingPage() {
  const [businessName, setBusinessName] = useState("BuildLedger")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")

  // Mock function to handle logo upload
  const handleLogoSave = async (file: File) => {
    // Simulate API call
    console.log("Uploading logo:", file.name)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Logo uploaded successfully")
  }

  // Mock function to save branding settings
  const handleSaveBranding = async () => {
    console.log("Saving branding settings:", { businessName, primaryColor })
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Branding settings saved successfully")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Branding</h1>
        <p className="text-muted-foreground">Customize how your business appears to clients</p>
      </div>

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6">
          <LogoUpload onSave={handleLogoSave} />

          <Card>
            <CardHeader>
              <CardTitle>Business Name</CardTitle>
              <CardDescription>
                Your business name will appear alongside your logo on invoices and quotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveBranding}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Preview</CardTitle>
              <CardDescription>Here's how your logo will appear in different parts of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dashboard Header Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2">Dashboard Header</h3>
                <div className="w-full h-16 bg-background border border-border rounded-md flex items-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-card border border-border rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src="/abstract-geometric-logo.png"
                        alt="Business Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-medium">{businessName}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2">Invoice Header</h3>
                <div className="w-full bg-white text-black border border-border rounded-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src="/abstract-geometric-logo.png"
                          alt="Business Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{businessName}</h2>
                        <p className="text-gray-500 text-sm">123 Business St, City, State</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold">INVOICE</h1>
                      <p className="text-gray-500">#INV-2024-0042</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Preview */}
              <div>
                <h3 className="text-sm font-medium mb-2">Quote Header</h3>
                <div className="w-full bg-white text-black border border-border rounded-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src="/abstract-geometric-logo.png"
                          alt="Business Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{businessName}</h2>
                        <p className="text-gray-500 text-sm">123 Business St, City, State</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-2xl font-bold">QUOTE</h1>
                      <p className="text-gray-500">#QT-2024-0018</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize the colors used in your client-facing documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-md border border-border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-32" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveBranding}>
                Save Colors
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <CardDescription>Choose and customize templates for your invoices and quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Template customization options coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
