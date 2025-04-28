import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from "@/components/app-layout"
import { AuthProvider } from "@/components/auth-status"
import { AppHeader } from "@/components/app-header"
import { FloatingChatButton } from "@/components/floating-chat-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TradeTab",
  description: "AI-enhanced invoicing platform for contractors",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-1">
                {children}
              </main>
              <FloatingChatButton />
              <footer className="py-6 border-t border-border">
                <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-muted-foreground">© 2024 BuildLedger. All rights reserved.</div>
                  <div className="flex flex-wrap gap-6 text-sm justify-center">
                    <a href="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                      Documentation
                    </a>
                    <a href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                      Guides
                    </a>
                    <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                      About Us
                    </a>
                    <a href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                      Changelog
                    </a>
                    <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                      Privacy
                    </a>
                    <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                      Terms
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
