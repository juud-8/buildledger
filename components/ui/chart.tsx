import type React from "react"

export const Chart = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>
}

export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <div className="absolute z-10">{children}</div>
}

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-md border bg-popover p-2 text-sm shadow-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
      {children}
    </div>
  )
}

export const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center space-x-2">{children}</div>
}

export const ChartLegendItem = ({ color, label }: { color: string; label: string }) => {
  return (
    <div className="flex items-center">
      <div className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}
