'use client'

import { useAuth } from '@/components/AuthProvider'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { generateInvoiceNumber, formatCurrency } from '@/lib/invoiceUtils'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar
} from 'lucide-react'

interface DashboardStats {
  totalRevenueThisMonth: number
  paidInvoices: number
  unpaidInvoices: number
  totalPaidAmount: number
  totalUnpaidAmount: number
}

interface RecentInvoice {
  id: string
  created_at: string
  due_date: string | null
  total: number
  status: string
  clients?: { name: string }
}

interface ClientHistory {
  id: string
  name: string
  totalInvoices: number
  totalPaid: number
  totalUnpaid: number
  lastInvoiceDate: string | null
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([])
  const [clientHistory, setClientHistory] = useState<ClientHistory[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return

      try {
        // Get the first day of current month
        const firstDayOfMonth = new Date()
        firstDayOfMonth.setDate(1)
        firstDayOfMonth.setHours(0, 0, 0, 0)

        // Load all data in parallel
        const [invoicesResult, recentInvoicesResult, clientsResult] = await Promise.all([
          // Get all invoices for stats
          supabase
            .from('invoices')
            .select('total, status, created_at')
            .eq('user_id', user.id),
          
          // Get recent invoices with client info
          supabase
            .from('invoices')
            .select(`
              id,
              created_at,
              due_date,
              total,
              status,
              clients ( name )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          
          // Get all clients for history
          supabase
            .from('clients')
            .select(`
              id,
              name,
              invoices (
                id,
                total,
                status,
                created_at
              )
            `)
            .eq('user_id', user.id)
        ])

        if (invoicesResult.error) throw invoicesResult.error
        if (recentInvoicesResult.error) throw recentInvoicesResult.error
        if (clientsResult.error) throw clientsResult.error

        const invoices = invoicesResult.data || []
        const recentInvoicesData = recentInvoicesResult.data || []
        const clients = clientsResult.data || []

        // Calculate stats
        const currentMonthInvoices = invoices.filter(invoice => 
          new Date(invoice.created_at) >= firstDayOfMonth
        )

        const totalRevenueThisMonth = currentMonthInvoices.reduce((sum, invoice) => 
          invoice.status === 'paid' ? sum + invoice.total : sum, 0
        )

        const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length
        const unpaidInvoices = invoices.filter(invoice => invoice.status !== 'paid').length
        const totalPaidAmount = invoices
          .filter(invoice => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + invoice.total, 0)
        const totalUnpaidAmount = invoices
          .filter(invoice => invoice.status !== 'paid')
          .reduce((sum, invoice) => sum + invoice.total, 0)

        setStats({
          totalRevenueThisMonth,
          paidInvoices,
          unpaidInvoices,
          totalPaidAmount,
          totalUnpaidAmount
        })

        setRecentInvoices(recentInvoicesData)

        // Process client history
        const clientHistoryData = clients.map(client => {
          const clientInvoices = client.invoices || []
          const totalInvoices = clientInvoices.length
          const totalPaid = clientInvoices
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + invoice.total, 0)
          const totalUnpaid = clientInvoices
            .filter(invoice => invoice.status !== 'paid')
            .reduce((sum, invoice) => sum + invoice.total, 0)
          const lastInvoiceDate = clientInvoices.length > 0 
            ? clientInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null

          return {
            id: client.id,
            name: client.name,
            totalInvoices,
            totalPaid,
            totalUnpaid,
            lastInvoiceDate
          }
        }).sort((a, b) => b.totalPaid - a.totalPaid)

        setClientHistory(clientHistoryData)
        setStatsLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setStatsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'paid') return false
    return new Date(dueDate) < new Date()
  }

  if (loading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const chartData = [
    { name: 'Paid', value: stats?.totalPaidAmount || 0, color: '#10b981' },
    { name: 'Unpaid', value: stats?.totalUnpaidAmount || 0, color: '#f59e0b' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's what's happening with your business.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/invoices/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </Link>
            <Link href="/clients/new">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenueThisMonth || 0)}</div>
              <p className="text-xs text-muted-foreground">
                This month's total revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.paidInvoices + stats?.unpaidInvoices || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.paidInvoices || 0} paid, {stats?.unpaidInvoices || 0} unpaid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalUnpaidAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total unpaid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientHistory.length}</div>
              <p className="text-xs text-muted-foreground">
                Total clients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No invoices yet</p>
                ) : (
                  recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <p className="font-medium">{invoice.clients?.name || 'Unknown Client'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(invoice.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                {recentInvoices.length > 0 && (
                  <div className="pt-4">
                    <Link href="/invoices">
                      <Button variant="outline" className="w-full">
                        View All Invoices
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No clients yet</p>
              ) : (
                clientHistory.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.totalInvoices} invoices
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(client.totalPaid)}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.lastInvoiceDate ? formatDate(client.lastInvoiceDate) : 'No invoices'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {clientHistory.length > 0 && (
                <div className="pt-4">
                  <Link href="/clients">
                    <Button variant="outline" className="w-full">
                      View All Clients
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}