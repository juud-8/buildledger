import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const ClientPerformance = ({ dateRange, filters }) => {
  const clientData = [
    {
      name: 'ABC Construction Corp',
      revenue: 185000,
      projects: 5,
      paymentReliability: 95,
      avgPaymentDays: 15,
      status: 'excellent'
    },
    {
      name: 'Metro Development LLC',
      revenue: 142000,
      projects: 3,
      paymentReliability: 88,
      avgPaymentDays: 22,
      status: 'good'
    },
    {
      name: 'Urban Builders Inc',
      revenue: 128000,
      projects: 4,
      paymentReliability: 92,
      avgPaymentDays: 18,
      status: 'excellent'
    },
    {
      name: 'Regional Properties',
      revenue: 96000,
      projects: 2,
      paymentReliability: 75,
      avgPaymentDays: 35,
      status: 'average'
    },
    {
      name: 'City Planning Dept',
      revenue: 78000,
      projects: 3,
      paymentReliability: 98,
      avgPaymentDays: 12,
      status: 'excellent'
    }
  ];

  const chartData = clientData?.map(client => ({
    name: client?.name?.split(' ')?.[0],
    revenue: client?.revenue,
    projects: client?.projects,
    reliability: client?.paymentReliability
  }));

  const getStatusColor = (status) => {
    const statusColors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      average: 'text-yellow-600 bg-yellow-100',
      poor: 'text-red-600 bg-red-100'
    };
    return statusColors?.[status] || statusColors?.average;
  };

  const getReliabilityColor = (reliability) => {
    if (reliability >= 90) return 'text-green-600';
    if (reliability >= 80) return 'text-blue-600';
    if (reliability >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const client = clientData?.find(c => c?.name?.split(' ')?.[0] === label);
      return (
        <div className="bg-popover border border-border rounded-xl p-4 construction-depth-3">
          <p className="text-sm font-medium text-popover-foreground mb-2">{client?.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Revenue: <span className="font-medium text-foreground">${client?.revenue?.toLocaleString()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Projects: <span className="font-medium text-foreground">{client?.projects}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Payment Reliability: <span className={`font-medium ${getReliabilityColor(client?.paymentReliability)}`}>
                {client?.paymentReliability}%
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Avg Payment: <span className="font-medium text-foreground">{client?.avgPaymentDays} days</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Client Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">Top clients by revenue and payment reliability</p>
        </div>
        <Icon name="Users" size={20} className="text-muted-foreground" />
      </div>
      {/* Revenue Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Client Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 text-muted-foreground font-medium">Client</th>
              <th className="text-right py-3 text-muted-foreground font-medium">Revenue</th>
              <th className="text-center py-3 text-muted-foreground font-medium">Projects</th>
              <th className="text-center py-3 text-muted-foreground font-medium">Payment Rate</th>
              <th className="text-center py-3 text-muted-foreground font-medium">Avg Days</th>
              <th className="text-center py-3 text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {clientData?.map((client, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 text-foreground font-medium">
                  <div>
                    <p className="font-medium">{client?.name?.split(' ')?.slice(0, 2)?.join(' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {client?.name?.split(' ')?.slice(2)?.join(' ')}
                    </p>
                  </div>
                </td>
                <td className="py-3 text-right text-foreground font-medium">
                  ${client?.revenue?.toLocaleString()}
                </td>
                <td className="py-3 text-center text-foreground">
                  {client?.projects}
                </td>
                <td className={`py-3 text-center font-medium ${getReliabilityColor(client?.paymentReliability)}`}>
                  {client?.paymentReliability}%
                </td>
                <td className="py-3 text-center text-foreground">
                  {client?.avgPaymentDays}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client?.status)}`}>
                    {client?.status?.charAt(0)?.toUpperCase() + client?.status?.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">17</p>
          <p className="text-xs text-muted-foreground">Total Active Clients</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">89.6%</p>
          <p className="text-xs text-muted-foreground">Avg Payment Rate</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">20.4</p>
          <p className="text-xs text-muted-foreground">Avg Payment Days</p>
        </div>
        <div>
          <p className="text-lg font-bold text-primary">$629k</p>
          <p className="text-xs text-muted-foreground">Total Client Revenue</p>
        </div>
      </div>
    </div>
  );
};

export default ClientPerformance;