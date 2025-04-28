"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LibraryItemDialog } from "@/components/library/library-item-dialog"

// Mock data for library items
const libraryItems = [
  {
    id: "1",
    description: "Standard Electrical Outlet Installation",
    unit: "each",
    price: 85.0,
  },
  {
    id: "2",
    description: "Premium Interior Paint (1 Gallon)",
    unit: "gallon",
    price: 45.99,
  },
  {
    id: "3",
    description: "Hourly Labor Rate - General Contractor",
    unit: "hour",
    price: 75.0,
  },
  {
    id: "4",
    description: "Drywall Installation",
    unit: "sq_ft",
    price: 2.5,
  },
  {
    id: "5",
    description: "Plumbing Service Call",
    unit: "each",
    price: 120.0,
  },
]

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Helper function to format unit display
const formatUnit = (unit: string) => {
  const unitMap: Record<string, string> = {
    each: "Each",
    hour: "Hour",
    day: "Day",
    sq_ft: "Square Foot",
    sq_yd: "Square Yard",
    linear_ft: "Linear Foot",
    gallon: "Gallon",
    pound: "Pound",
  }

  return unitMap[unit] || unit
}

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Filter items based on search query
  const filteredItems = libraryItems.filter((item) =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle opening the dialog for editing an item
  const handleEditItem = (item: any) => {
    setSelectedItem(item)
    setDialogOpen(true)
  }

  // Handle saving an item (create or update)
  const handleSaveItem = async (item: any) => {
    console.log("Saving item:", item)
    // Here you would typically save to your database
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Close dialog and reset selected item
    setDialogOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Service & Material Library</h1>
        <p className="text-muted-foreground">
          Manage your frequently used services and materials for quick access when creating quotes and invoices.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search library items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* Button to open the modal dialog */}
          <Button
            onClick={() => {
              setSelectedItem(null) // Ensure we're creating a new item
              setDialogOpen(true)
            }}
            className="sm:w-auto w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item (Modal)
          </Button>

          {/* Button to navigate to the dedicated page */}
          <Button asChild variant="outline" className="sm:w-auto w-full">
            <Link href="/library/item">
              <Plus className="mr-2 h-4 w-4" />
              Add Item (Page)
            </Link>
          </Button>
        </div>
      </div>

      {/* Library Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Library Items</CardTitle>
          <CardDescription>
            Your saved services and materials that can be quickly added to quotes and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No items match your search" : "No items in your library yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{formatUnit(item.unit)}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Library Item Dialog */}
      <LibraryItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} onSave={handleSaveItem} />
    </div>
  )
}
