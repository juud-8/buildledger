"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LibraryItemForm } from "@/components/library/library-item-form"

interface LibraryItem {
  id?: string
  description: string
  unit: string
  price: number
}

interface LibraryItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LibraryItem
  onSave: (item: LibraryItem) => Promise<void>
}

export function LibraryItemDialog({ open, onOpenChange, item, onSave }: LibraryItemDialogProps) {
  const isEditing = !!item?.id

  const handleSubmit = async (data: LibraryItem) => {
    await onSave({
      ...data,
      id: item?.id, // Preserve the ID if editing
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Library Item" : "Add Library Item"}</DialogTitle>
        </DialogHeader>
        <LibraryItemForm initialData={item} onSubmit={handleSubmit} onCancel={handleCancel} isEditing={isEditing} />
      </DialogContent>
    </Dialog>
  )
}
