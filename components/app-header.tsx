"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, User, Settings, LogOut, MessageSquareText, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationPanel } from "@/components/notification-panel"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function AppHeader() {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadNotifications = 3 // This would come from your notification state/context

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* BuildLedger Logo */}
            <div className="h-9 w-9 flex items-center justify-center">
              <Image
                src="/buildledger-logo.png"
                alt="BuildLedger Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold hidden sm:inline-block">BuildLedger</span>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/invoices", label: "Invoices" },
            { href: "/quotes", label: "Quotes" },
            { href: "/analytics", label: "Analytics" },
            { href: "/chat", label: "AI Assistant" },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full mx-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Section - User and Notifications */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96">
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/vibrant-street-market.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left hidden sm:flex">
                  <span className="text-sm font-medium">Jeff Doht</span>
                  <span className="text-xs text-muted-foreground">jeff@tradetab.com</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat" className="cursor-pointer flex w-full">
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  <span>AI Assistant</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
