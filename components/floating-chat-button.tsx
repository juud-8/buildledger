"use client"

import { useState } from "react"
import { MessageSquareText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatbot } from "@/components/ai-chatbot"
import { motion, AnimatePresence } from "framer-motion"

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={`h-12 w-12 rounded-full shadow-lg ${isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquareText className="h-5 w-5" />}
        </Button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] shadow-xl rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-[500px] bg-card border border-border rounded-lg overflow-hidden">
              <AIChatbot isFloating={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
