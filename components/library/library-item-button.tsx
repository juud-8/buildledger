"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LibraryItemDialog } from "@/components/library/library-item-dialog"

interface LibraryItemButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  useModal?: boolean
  onSave?: (item: any) => Promise<void>
}

export function LibraryItemButton({
  variant = "default",
  size = "default",
  className = "",
  useModal = false,
  onSave,
}: LibraryItemButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSave = async (item: any) => {
    if (onSave) {
      await onSave(item)
    } else {
      console.log("Item saved:", item)
      // Default implementation would go here
    }
    setDialogOpen(false)
  }

  if (useModal) {
    return (
      <>
        <Button variant={variant} size={size} className={className} onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Library Item
        </Button>

        <LibraryItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />
      </>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} asChild>
      <Link href="/library/item">
        <Plus className="mr-2 h-4 w-4" />
        Add Library Item
      </Link>
    </Button>
  )
}
