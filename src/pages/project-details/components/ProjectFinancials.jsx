import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectFinancials = ({ project }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const budgetData = [
    { category: 'Materials', budgeted: 45000, actual: 42000, remaining: 3000 },
    { category: 'Labor', budgeted: 35000, actual: 38000, remaining: -3000 },
    { category: 'Equipment', budgeted: 15000, actual: 12000, remaining: 3000 },
    { category: 'Permits', budgeted: 5000, actual: 4500, remaining: 500 },
    { category: 'Subcontractors', budgeted: 25000, actual: 22000, remaining: 3000 },
  ];

  const expenseBreakdown = [
    { name: 'Materials', value: 42000, color: '#1E3A8A' },
    { name: 'Labor', value: 38000, color: '#0EA5E9' },
    { name: 'Subcontractors', value: 22000, color: '#059669' },
    { name: 'Equipment', value: 12000, color: '#D97706' },
    { name: 'Permits', value: 4500, color: '#DC2626' },
  ];

  const cashFlowData = [
    { month: 'Jan', income: 25000, expenses: 18000, net: 7000 },
    { month: 'Feb', income: 30000, expenses: 22000, net: 8000 },
    { month: 'Mar', income: 35000, expenses: 28000, net: 7000 },
    { month: 'Apr', income: 40000, expenses: 32000, net: 8000 },
    { month: 'May', income: 20000, expenses: 15000, net: 5000 },
  ];

  const changeOrders = [
    {
      id: 'CO-001',
      description: 'Additional electrical outlets in kitchen',
      amount: 2500,
      status: 'approved',
      date: '2025-01-15',
      approvedBy: 'John Smith'
    },
    {
      id: 'CO-002',
      description: 'Upgrade to premium flooring',
      amount: 4200,
      status: 'pending',
      date: '2025-01-20',
      approvedBy: null
    },
    {
      id: 'CO-003',
      description: 'Weather delay compensation',
      amount: -1500,
      status: 'approved',
      date: '2025-01-25',
      approvedBy: 'Sarah Johnson'
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalBudget = budgetData?.reduce((sum, item) => sum + item?.budgeted, 0);
  const totalSpent = budgetData?.reduce((sum, item) => sum + item?.actual, 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-foreground">${totalBudget?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">${totalSpent?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Icon name="TrendingDown" size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalRemaining)?.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon 
                name={totalRemaining >= 0 ? "TrendingUp" : "AlertTriangle"} 
                size={24} 
                className={totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'} 
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-2xl font-bold text-foreground">{budgetUtilization?.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="PieChart" size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      {/* Budget vs Actual Chart */}
      <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Budget vs Actual Spending</h3>
          <Button variant="outline" size="sm" iconName="Download">
            Export
          </Button>
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="category" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="budgeted" fill="#1E3A8A" name="Budgeted" />
              <Bar dataKey="actual" fill="#0EA5E9" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <h3 className="text-lg font-semibold text-foreground mb-6">Expense Breakdown</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                >
                  {expenseBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <h3 className="text-lg font-semibold text-foreground mb-6">Cash Flow Trend</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#DC2626" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="net" stroke="#1E3A8A" strokeWidth={2} name="Net" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Change Orders */}
      <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Change Orders</h3>
          <Button variant="default" iconName="Plus" iconPosition="left">
            New Change Order
          </Button>
        </div>
        
        {changeOrders?.length > 0 ? (
          <div className="space-y-4">
            {changeOrders?.map((order) => (
              <div key={order?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 construction-transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-foreground">{order?.id}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order?.status)}`}>
                        {order?.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{order?.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Calendar" size={12} />
                        <span>{order?.date}</span>
                      </div>
                      {order?.approvedBy && (
                        <div className="flex items-center space-x-1">
                          <Icon name="User" size={12} />
                          <span>Approved by {order?.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`text-lg font-bold ${
                      order?.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {order?.amount >= 0 ? '+' : ''}${order?.amount?.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button variant="ghost" size="sm" iconName="Eye">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" iconName="Edit">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No Change Orders</h4>
            <p className="text-muted-foreground mb-4">Create change orders to track project modifications</p>
            <Button variant="outline" iconName="Plus" iconPosition="left">
              Create First Change Order
            </Button>
          </div>
        )}
      </div>
      {/* Payment Schedule */}
      <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
        <h3 className="text-lg font-semibold text-foreground mb-6">Payment Schedule</h3>
        <div className="space-y-4">
          {project?.paymentSchedule?.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  payment?.status === 'paid' ? 'bg-green-500' :
                  payment?.status === 'overdue'? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <h4 className="font-medium text-foreground">{payment?.description}</h4>
                  <p className="text-sm text-muted-foreground">Due: {payment?.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">${payment?.amount?.toLocaleString()}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  payment?.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                  payment?.status === 'overdue'? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {payment?.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectFinancials;