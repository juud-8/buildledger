import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - TradeTab",
  description: "Login or sign up for TradeTab",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
