'use client'

import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { generateInvoiceNumber, formatCurrency } from '@/lib/invoiceUtils'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

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

        const invoices = invoicesResult.data || []
        const recentInvoicesData = recentInvoicesResult.data || []
        const clientsData = clientsResult.data || []

        // Calculate stats
        const thisMonthInvoices = invoices.filter(
          inv => new Date(inv.created_at) >= firstDayOfMonth
        )
        const totalRevenueThisMonth = thisMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)

        const paidInvoices = invoices.filter(inv => inv.status === 'paid')
        const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid')

        const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
        const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0)

        setStats({
          totalRevenueThisMonth,
          paidInvoices: paidInvoices.length,
          unpaidInvoices: unpaidInvoices.length,
          totalPaidAmount,
          totalUnpaidAmount
        })

        // Transform recent invoices data
        const transformedRecentInvoices = recentInvoicesData.map((invoice: { clients?: { name: string }[] }) => ({
          ...invoice,
          clients: invoice.clients?.[0] || null
        }))
        setRecentInvoices(transformedRecentInvoices)

        // Process client history
        const clientHistoryData: ClientHistory[] = clientsData.map((client: { id: string; name: string; invoices?: Array<{ status: string; total: number; created_at: string }> }) => {
          const clientInvoices = client.invoices || []
          const paidClientInvoices = clientInvoices.filter((inv: { status: string }) => inv.status === 'paid')
          const unpaidClientInvoices = clientInvoices.filter((inv: { status: string }) => inv.status !== 'paid')
          
          const lastInvoice = clientInvoices.sort((a: { created_at: string }, b: { created_at: string }) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          return {
            id: client.id,
            name: client.name,
            totalInvoices: clientInvoices.length,
            totalPaid: paidClientInvoices.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0),
            totalUnpaid: unpaidClientInvoices.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0),
            lastInvoiceDate: lastInvoice?.created_at || null
          }
        })

        // Sort by total revenue (paid + unpaid)
        clientHistoryData.sort((a, b) => (b.totalPaid + b.totalUnpaid) - (a.totalPaid + a.totalUnpaid))
        setClientHistory(clientHistoryData)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />
  if (!user) return null

  // Prepare pie chart data
  const pieData = stats ? [
    { name: 'Paid', value: stats.paidInvoices, amount: stats.totalPaidAmount },
    { name: 'Unpaid', value: stats.unpaidInvoices, amount: stats.totalUnpaidAmount }
  ] : []

  const COLORS = ['#10b981', '#ef4444']

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'sent': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'paid') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>

        {statsLoading ? (
          <LoadingSpinner text="Loading dashboard data..." />
        ) : (
          <>
            {/* Revenue and Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue This Month</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalRevenueThisMonth || 0)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Paid</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.totalPaidAmount || 0)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Unpaid</h3>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.totalUnpaidAmount || 0)}
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invoices</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats?.paidInvoices || 0) + (stats?.unpaidInvoices || 0)}
                </p>
              </div>
            </div>

            {/* Pie Chart and Recent Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Overview</h2>
                {pieData.length > 0 && (pieData[0].value > 0 || pieData[1].value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: { payload: { amount: number } }) => [
                          `${value} invoices (${formatCurrency(props.payload.amount)})`,
                          name
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No invoice data available
                  </div>
                )}
              </div>

              {/* Recent Invoices Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h2>
                <div className="overflow-x-auto">
                  {recentInvoices.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentInvoices.slice(0, 5).map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-sm">
                              <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                                {generateInvoiceNumber(invoice)}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {invoice.clients?.name || 'No Client'}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {formatCurrency(invoice.total)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                              {isOverdue(invoice.due_date, invoice.status) && (
                                <span className="text-red-600 text-xs ml-1">(Overdue)</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No invoices yet</p>
                  )}
                </div>
                {recentInvoices.length > 5 && (
                  <Link href="/invoices" className="block text-center text-blue-600 hover:underline mt-4 text-sm">
                    View all invoices →
                  </Link>
                )}
              </div>
            </div>

            {/* Client History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client History</h2>
              <div className="overflow-x-auto">
                {clientHistory.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Paid</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clientHistory.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {client.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">
                            {client.totalInvoices}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                            {formatCurrency(client.totalPaid)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                            {client.totalUnpaid > 0 ? formatCurrency(client.totalUnpaid) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-500">
                            {client.lastInvoiceDate ? formatDate(client.lastInvoiceDate) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">No client history yet</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Link
                href="/invoices/new"
                className="bg-green-600 hover:bg-green-700 text-white text-center py-4 px-6 rounded-lg font-medium transition-colors"
              >
                + Create New Invoice
              </Link>
              <Link
                href="/quotes/new"
                className="bg-blue-600 hover:bg-blue-700 text-white text-center py-4 px-6 rounded-lg font-medium transition-colors"
              >
                + Create New Quote
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}