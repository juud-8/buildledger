"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LibraryItemDialog } from "@/components/library/library-item-dialog"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingActionButtonProps {
  showLibraryItemOption?: boolean
  onLibraryItemSave?: (item: any) => Promise<void>
}

export function FloatingActionButton({ showLibraryItemOption = true, onLibraryItemSave }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSave = async (item: any) => {
    if (onLibraryItemSave) {
      await onLibraryItemSave(item)
    } else {
      console.log("Item saved:", item)
      // Default implementation would go here
    }
    setDialogOpen(false)
    setIsOpen(false)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Sub buttons that appear when FAB is clicked */}
        <AnimatePresence>
          {isOpen && showLibraryItemOption && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="mb-2 flex items-center gap-2"
            >
              <span className="rounded-md bg-background px-2 py-1 text-sm shadow-md border border-border">
                Add Library Item
              </span>
              <Button
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => {
                  setDialogOpen(true)
                  setIsOpen(false)
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main floating action button */}
        <Button
          size="icon"
          className={`h-14 w-14 rounded-full shadow-lg ${isOpen ? "bg-destructive hover:bg-destructive/90" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>

      {/* Library Item Dialog */}
      <LibraryItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} />
    </>
  )
}
