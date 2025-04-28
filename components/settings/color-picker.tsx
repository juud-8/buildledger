"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const presetColors = [
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#6b7280", // gray
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-10 h-10 p-0 border-2", className)}
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: color }} />
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-24 px-2 py-1 text-sm border border-border rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "w-full h-8 rounded-md border border-border",
                  color === presetColor && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
