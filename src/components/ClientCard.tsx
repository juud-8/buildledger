"use client"

import { MoreHorizontal, Phone, Mail, MapPin, Calendar, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ClientCardProps {
  client: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    address?: string
    avatar?: string
    status?: string
    totalProjects?: number
    totalRevenue?: number
    lastContact?: string
    paymentStatus?: string
    tags?: string[]
    notes?: string
  }
  onEdit: () => void
  onDelete: () => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200 cursor-pointer" onClick={onEdit}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                {client.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{client.name}</h3>
              <p className="text-sm text-slate-600">{client.company}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {client.status && (
            <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
          )}
          {client.paymentStatus && (
            <Badge className={getPaymentStatusColor(client.paymentStatus)}>{client.paymentStatus}</Badge>
          )}
          {client.tags?.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {client.email && (
            <div className="flex items-center text-sm text-slate-600">
              <Mail className="h-4 w-4 mr-2 text-slate-400" />
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone className="h-4 w-4 mr-2 text-slate-400" />
              {client.phone}
            </div>
          )}
          {client.address && (
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="h-4 w-4 mr-2 text-slate-400" />
              {client.address}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-sm font-medium text-slate-900">{client.totalProjects || 0}</p>
            <p className="text-xs text-slate-500">Projects</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              ${client.totalRevenue?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-slate-500">Revenue</p>
          </div>
        </div>

        {/* Last Contact */}
        {client.lastContact && (
          <div className="flex items-center text-xs text-slate-500 pt-2 border-t">
            <Calendar className="h-3 w-3 mr-1" />
            Last contact: {new Date(client.lastContact).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 