"use client"

import { useState } from "react"
import { Bell, Info, AlertCircle, CreditCard, Mail, Calendar, User, FileText } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NotificationType = "info" | "alert" | "payment" | "message" | "event" | "user" | "document"

interface Notification {
  id: string
  type: NotificationType
  title: string
  timestamp: string
  read: boolean
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

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "payment",
      title: "Payment received from Acme Corporation",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "alert",
      title: "Invoice #INV-2024-0042 is overdue",
      timestamp: "5 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Your monthly report is ready to view",
      timestamp: "Yesterday",
      read: true,
    },
    {
      id: "4",
      type: "message",
      title: "New message from John Smith",
      timestamp: "Yesterday",
      read: false,
    },
    {
      id: "5",
      type: "document",
      title: "Quote #QT-2024-0018 was approved",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: "6",
      type: "event",
      title: "Reminder: Client meeting tomorrow",
      timestamp: "2 days ago",
      read: true,
    },
    {
      id: "7",
      type: "user",
      title: "Sarah Williams accepted your invitation",
      timestamp: "3 days ago",
      read: true,
    },
    {
      id: "8",
      type: "payment",
      title: "Payment received from Wayne Industries",
      timestamp: "4 days ago",
      read: true,
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
    <div className="w-full max-w-md mx-auto rounded-lg border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
              {unreadCount}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs h-8">
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-md transition-colors relative",
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
                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-primary absolute top-4 right-3"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-card/80">
        <Button variant="outline" size="sm" className="w-full text-xs">
          View all notifications
        </Button>
      </div>
    </div>
  )
}
