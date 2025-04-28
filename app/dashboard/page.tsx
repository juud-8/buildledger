import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  DollarSign,
  AlertCircle,
  Send,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import Link from "next/link"
import { SubscriptionManager } from "@/components/SubscriptionManager"

interface RevenueData {
  month: string
  revenue: number
}

interface InvoiceStatusData {
  name: string
  value: number
}

// Sample data for charts
const revenueData: RevenueData[] = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
  { month: "Jul", revenue: 7000 },
]

const invoiceStatusData: InvoiceStatusData[] = [
  { name: "Paid", value: 65 },
  { name: "Outstanding", value: 25 },
  { name: "Overdue", value: 10 },
]

const getStatusColor = (entry: InvoiceStatusData): string => {
  switch (entry.name) {
    case "Paid": return "hsl(142, 71%, 45%)"
    case "Outstanding": return "hsl(38, 92%, 50%)"
    case "Overdue": return "hsl(0, 84%, 60%)"
    default: return "hsl(215, 20%, 65%)"
  }
}

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here's an overview of your business metrics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Link href="/invoices" className="block group">
          <Card className="bg-card transition-all duration-200 group-hover:bg-card/80 group-hover:shadow-md group-hover:translate-y-[-2px] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">+12.5%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices?status=paid" className="block group">
          <Card className="bg-card transition-all duration-200 group-hover:bg-card/80 group-hover:shadow-md group-hover:translate-y-[-2px] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,580</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">+18.2%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices?status=outstanding" className="block group">
          <Card className="bg-card transition-all duration-200 group-hover:bg-card/80 group-hover:shadow-md group-hover:translate-y-[-2px] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$8,245</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">-4.5%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/quotes" className="block group">
          <Card className="bg-card transition-all duration-200 group-hover:bg-card/80 group-hover:shadow-md group-hover:translate-y-[-2px] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quotes Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">+7.2%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/quotes?view=analytics" className="block group">
          <Card className="bg-card transition-all duration-200 group-hover:bg-card/80 group-hover:shadow-md group-hover:translate-y-[-2px] cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76%</div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500">+2.3%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Subscription Manager */}
      <SubscriptionManager />

      {/* Chart Containers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-card transition-all duration-200 hover:bg-card/90 hover:shadow-md">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 65%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-md border bg-popover p-2 text-sm shadow-sm">
                            <div className="font-medium">{payload[0].payload.month}</div>
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-primary mr-1" />
                              <span className="font-medium">${payload[0].value}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                  <span>Revenue</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Chart */}
        <Card className="bg-card transition-all duration-200 hover:bg-card/90 hover:shadow-md">
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceStatusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="hsl(215, 20%, 65%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-md border bg-popover p-2 text-sm shadow-sm">
                            <div className="font-medium">{payload[0].payload.name}</div>
                            <div className="flex items-center">
                              <div
                                className={`h-2 w-2 rounded-full mr-1 ${getStatusColor(payload[0].payload)}`}
                              />
                              <span className="font-medium">{payload[0].value}%</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(217, 91%, 60%)"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Paid</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-amber-500" />
                  <span>Outstanding</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                  <span>Overdue</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="bg-card transition-all duration-200 hover:bg-card/90 hover:shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Your recent invoices and quotes will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
