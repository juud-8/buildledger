"use client"

import { useState } from "react"
import { Bell, Info, AlertCircle, CreditCard, Mail, Calendar, User, FileText, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

type NotificationType = "info" | "alert" | "payment" | "message" | "event" | "user" | "document"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  timestamp: string
  read: boolean
  link?: string
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-400" />
    case "alert":
      return <AlertCircle className="h-4 w-4 text-amber-400" />
    case "payment":
      return <CreditCard className="h-4 w-4 text-emerald-400" />
    case "message":
      return <Mail className="h-4 w-4 text-violet-400" />
    case "event":
      return <Calendar className="h-4 w-4 text-pink-400" />
    case "user":
      return <User className="h-4 w-4 text-cyan-400" />
    case "document":
      return <FileText className="h-4 w-4 text-orange-400" />
    default:
      return <Info className="h-4 w-4 text-blue-400" />
  }
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "payment",
      title: "Payment received",
      description: "Acme Corporation paid invoice #INV-2024-0042",
      timestamp: "2 hours ago",
      read: false,
      link: "/invoices",
    },
    {
      id: "2",
      type: "alert",
      title: "Invoice overdue",
      description: "Invoice #INV-2024-0039 is 7 days overdue",
      timestamp: "5 hours ago",
      read: false,
      link: "/invoices",
    },
    {
      id: "3",
      type: "info",
      title: "Monthly report ready",
      description: "Your April 2024 financial report is ready to view",
      timestamp: "Yesterday",
      read: true,
      link: "/analytics",
    },
    {
      id: "4",
      type: "message",
      title: "New message",
      description: "John Smith: Can we discuss the project timeline?",
      timestamp: "Yesterday",
      read: false,
      link: "/chat",
    },
    {
      id: "5",
      type: "document",
      title: "Quote approved",
      description: "Wayne Industries approved Quote #QT-2024-0018",
      timestamp: "2 days ago",
      read: true,
      link: "/quotes",
    },
  ])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  return (
    <Card className="w-full shadow-lg border-border/50 overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-card">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
              {unreadCount}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs h-8"
          >
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <Bell className="h-10 w-10 mb-2 opacity-20" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <Link
                    href={notification.link || "#"}
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md transition-colors relative block",
                      notification.read ? "hover:bg-muted/50" : "bg-muted/30 hover:bg-muted",
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Icon */}
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                      {getIconForType(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notification.read && "font-medium")}>{notification.title}</p>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary absolute top-4 right-3"></div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t border-border/50 bg-card/80">
        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
          <Link href="/notifications">View all notifications</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
