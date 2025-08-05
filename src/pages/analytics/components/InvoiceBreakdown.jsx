import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';

const InvoiceBreakdown = ({ dateRange, filters }) => {
  const invoiceStatusData = [
    { name: 'Paid', value: 65, amount: 423750, color: '#22c55e' },
    { name: 'Pending', value: 25, amount: 162500, color: '#f59e0b' },
    { name: 'Overdue', value: 10, amount: 65000, color: '#ef4444' }
  ];

  const monthlyInvoiceData = [
    { month: 'Jan', paid: 45000, pending: 15000, overdue: 8000 },
    { month: 'Feb', paid: 52000, pending: 18000, overdue: 5000 },
    { month: 'Mar', paid: 48000, pending: 12000, overdue: 7000 },
    { month: 'Apr', paid: 61000, pending: 20000, overdue: 9000 },
    { month: 'May', paid: 55000, pending: 16000, overdue: 6000 },
    { month: 'Jun', paid: 67000, pending: 22000, overdue: 8000 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-muted-foreground">{entry?.name}:</span>
              </div>
              <span className="font-medium text-popover-foreground">
                ${entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">{data?.value}% of total</p>
          <p className="text-sm font-medium text-popover-foreground">
            ${data?.amount?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Invoice Status Breakdown</h3>
          <p className="text-sm text-muted-foreground">Payment status distribution</p>
        </div>
        <Icon name="PieChart" size={20} className="text-muted-foreground" />
      </div>

      {/* Pie Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={invoiceStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {invoiceStatusData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status Legend */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {invoiceStatusData?.map((status, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status?.color }}
              />
              <span className="text-sm font-medium text-foreground">{status?.name}</span>
            </div>
            <p className="text-lg font-bold text-foreground">{status?.value}%</p>
            <p className="text-xs text-muted-foreground">
              ${status?.amount?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">Monthly Payment Trends</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyInvoiceData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" fontSize={10} stroke="var(--color-muted-foreground)" />
              <YAxis fontSize={10} stroke="var(--color-muted-foreground)" tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="paid" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Paid" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="Pending" />
              <Bar dataKey="overdue" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Average Collection Time:</span>
            <span className="ml-2 font-medium text-foreground">28 days</span>
          </div>
          <div>
            <span className="text-muted-foreground">Collection Rate:</span>
            <span className="ml-2 font-medium text-green-600">87.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBreakdown;