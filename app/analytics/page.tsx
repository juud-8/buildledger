"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns"
import {
  CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChartIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// Mock data for charts
const revenueData = [
  { date: "Jan", revenue: 4500 },
  { date: "Feb", revenue: 5200 },
  { date: "Mar", revenue: 4800 },
  { date: "Apr", revenue: 6000 },
  { date: "May", revenue: 5700 },
  { date: "Jun", revenue: 6500 },
  { date: "Jul", revenue: 7200 },
  { date: "Aug", revenue: 7800 },
  { date: "Sep", revenue: 8500 },
  { date: "Oct", revenue: 9200 },
  { date: "Nov", revenue: 8700 },
  { date: "Dec", revenue: 9500 },
]

const statusData = [
  { name: "Paid", value: 65, color: "#10b981" },
  { name: "Outstanding", value: 25, color: "#f59e0b" },
  { name: "Overdue", value: 10, color: "#ef4444" },
]

const quoteStatusData = [
  { name: "Accepted", value: 72, color: "#10b981" },
  { name: "Pending", value: 18, color: "#3b82f6" },
  { name: "Rejected", value: 10, color: "#ef4444" },
]

const acceptanceRateData = [
  { date: "Jan", rate: 68 },
  { date: "Feb", rate: 72 },
  { date: "Mar", rate: 70 },
  { date: "Apr", rate: 75 },
  { date: "May", rate: 78 },
  { date: "Jun", rate: 80 },
  { date: "Jul", rate: 82 },
  { date: "Aug", rate: 85 },
  { date: "Sep", rate: 83 },
  { date: "Oct", rate: 86 },
  { date: "Nov", rate: 88 },
  { date: "Dec", rate: 90 },
]

const recentPayments = [
  { id: "INV-2024-0042", date: "2024-04-15", client: "Acme Corporation", amount: 2400.0 },
  { id: "INV-2024-0039", date: "2024-04-12", client: "Globex Industries", amount: 1850.5 },
  { id: "INV-2024-0036", date: "2024-04-08", client: "Stark Enterprises", amount: 3200.75 },
  { id: "INV-2024-0033", date: "2024-04-05", client: "Wayne Industries", amount: 4500.0 },
  { id: "INV-2024-0030", date: "2024-04-01", client: "Oscorp", amount: 1950.25 },
]

const topClients = [
  { name: "Acme Corporation", revenue: 12500.0, invoices: 5 },
  { name: "Stark Enterprises", revenue: 9800.75, invoices: 4 },
  { name: "Wayne Industries", revenue: 8500.0, invoices: 3 },
  { name: "Globex Industries", revenue: 7250.5, invoices: 4 },
  { name: "Oscorp", revenue: 5950.25, invoices: 3 },
]

// Time period options
const timePeriods = [
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "thisQuarter", label: "This Quarter" },
  { value: "lastQuarter", label: "Last Quarter" },
  { value: "thisYear", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
]

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("30days")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  // Calculate period description based on selected time period
  const getPeriodDescription = () => {
    switch (timePeriod) {
      case "7days":
        return `${format(subDays(new Date(), 7), "MMM d, yyyy")} - ${format(new Date(), "MMM d, yyyy")}`
      case "30days":
        return `${format(subDays(new Date(), 30), "MMM d, yyyy")} - ${format(new Date(), "MMM d, yyyy")}`
      case "90days":
        return `${format(subDays(new Date(), 90), "MMM d, yyyy")} - ${format(new Date(), "MMM d, yyyy")}`
      case "thisMonth":
        return `${format(startOfMonth(new Date()), "MMM d, yyyy")} - ${format(endOfMonth(new Date()), "MMM d, yyyy")}`
      case "lastMonth":
        const lastMonth = subMonths(new Date(), 1)
        return `${format(startOfMonth(lastMonth), "MMM d, yyyy")} - ${format(endOfMonth(lastMonth), "MMM d, yyyy")}`
      case "thisQuarter":
        return `${format(startOfQuarter(new Date()), "MMM d, yyyy")} - ${format(endOfQuarter(new Date()), "MMM d, yyyy")}`
      case "lastQuarter":
        const lastQuarter = subMonths(new Date(), 3)
        return `${format(startOfQuarter(lastQuarter), "MMM d, yyyy")} - ${format(endOfQuarter(lastQuarter), "MMM d, yyyy")}`
      case "thisYear":
        return `${format(startOfYear(new Date()), "MMM d, yyyy")} - ${format(endOfYear(new Date()), "MMM d, yyyy")}`
      case "lastYear":
        const lastYear = subMonths(new Date(), 12)
        return `${format(startOfYear(lastYear), "MMM d, yyyy")} - ${format(endOfYear(lastYear), "MMM d, yyyy")}`
      case "custom":
        if (dateRange.from && dateRange.to) {
          return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
        }
        return "Custom Range"
      default:
        return "Last 30 Days"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Gain insights into your business performance and financial metrics.</p>
      </div>

      {/* Time Period Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-lg border border-border/50">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">Time Period</h2>
          <p className="text-sm text-muted-foreground">{getPeriodDescription()}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {timePeriod === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(78500)}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+12.5%</span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(2450)}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+5.2%</span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quote Acceptance Rate</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+3.8%</span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(12350)}</div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">-2.3%</span>
              <span className="ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Metrics</TabsTrigger>
          <TabsTrigger value="quotes">Quote Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Analysis Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 65%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Client</CardTitle>
                <CardDescription>Top clients by revenue in the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClients} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke="hsl(217, 32%, 18%)"
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Comparison</CardTitle>
                <CardDescription>Current vs. previous period</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", current: 4500, previous: 3800 },
                      { month: "Feb", current: 5200, previous: 4200 },
                      { month: "Mar", current: 4800, previous: 4500 },
                      { month: "Apr", current: 6000, previous: 5100 },
                      { month: "May", current: 5700, previous: 4900 },
                      { month: "Jun", current: 6500, previous: 5500 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="current"
                      name="Current Period"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      name="Previous Period"
                      stroke="hsl(217, 32%, 40%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>Clients generating the most revenue in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead className="text-right">Average Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client) => (
                    <TableRow key={client.name}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{formatCurrency(client.revenue)}</TableCell>
                      <TableCell>{client.invoices}</TableCell>
                      <TableCell className="text-right">{formatCurrency(client.revenue / client.invoices)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Metrics Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
                <CardDescription>Breakdown of invoices by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Days to Payment</CardTitle>
                <CardDescription>Average time to receive payment after invoice issuance</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", days: 18 },
                      { month: "Feb", days: 16 },
                      { month: "Mar", days: 15 },
                      { month: "Apr", days: 14 },
                      { month: "May", days: 12 },
                      { month: "Jun", days: 10 },
                      { month: "Jul", days: 11 },
                      { month: "Aug", days: 9 },
                      { month: "Sep", days: 8 },
                      { month: "Oct", days: 7 },
                      { month: "Nov", days: 8 },
                      { month: "Dec", days: 7 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value} days`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`${value} days`, "Average"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="days"
                      name="Days to Payment"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payments received in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Performance Tab */}
        <TabsContent value="quotes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quote Status Distribution</CardTitle>
                <CardDescription>Breakdown of quotes by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quoteStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {quoteStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Acceptance Rate Trend</CardTitle>
                <CardDescription>Percentage of quotes accepted over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={acceptanceRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217, 32%, 18%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 65%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="hsl(215, 20%, 65%)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 11%)",
                        borderColor: "hsl(217, 32%, 18%)",
                        color: "hsl(210, 40%, 98%)",
                      }}
                      formatter={(value) => [`${value}%`, "Acceptance Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Acceptance Rate"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quote to Invoice Conversion</CardTitle>
              <CardDescription>Time from quote acceptance to invoice creation</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { client: "Acme Corporation", days: 2 },
                    { client: "Globex Industries", days: 1 },
                    { client: "Stark Enterprises", days: 3 },
                    { client: "Wayne Industries", days: 1 },
                    { client: "Oscorp", days: 4 },
                    { client: "Umbrella Corporation", days: 2 },
                    { client: "LexCorp", days: 1 },
                  ]}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(217, 32%, 18%)" />
                  <XAxis
                    type="number"
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 5]}
                    tickFormatter={(value) => `${value} days`}
                  />
                  <YAxis
                    type="category"
                    dataKey="client"
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 11%)",
                      borderColor: "hsl(217, 32%, 18%)",
                      color: "hsl(210, 40%, 98%)",
                    }}
                    formatter={(value) => [`${value} days`, "Conversion Time"]}
                  />
                  <Bar dataKey="days" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
