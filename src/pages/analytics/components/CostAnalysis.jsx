import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CostAnalysis = ({ dateRange, filters }) => {
  const [analysisType, setAnalysisType] = useState('breakdown');

  const costBreakdownData = [
    { name: 'Materials', value: 45, amount: 297000, color: '#3b82f6' },
    { name: 'Labor', value: 35, amount: 231000, color: '#22c55e' },
    { name: 'Equipment', value: 12, amount: 79200, color: '#f59e0b' },
    { name: 'Subcontractors', value: 8, amount: 52800, color: '#8b5cf6' }
  ];

  const materialVsLaborData = [
    { project: 'Residential A', materials: 180000, labor: 120000, ratio: 1.5 },
    { project: 'Office B', materials: 280000, labor: 220000, ratio: 1.27 },
    { project: 'Shopping C', materials: 350000, labor: 280000, ratio: 1.25 },
    { project: 'Warehouse D', materials: 140000, labor: 95000, ratio: 1.47 },
    { project: 'Retail E', materials: 75000, labor: 65000, ratio: 1.15 }
  ];

  const chartData = materialVsLaborData?.map(project => ({
    name: project?.project?.split(' ')?.[0],
    materials: project?.materials,
    labor: project?.labor,
    ratio: project?.ratio
  }));

  const costTrends = [
    { month: 'Jan', materials: 42000, labor: 28000, equipment: 8000 },
    { month: 'Feb', materials: 48000, labor: 32000, equipment: 9500 },
    { month: 'Mar', materials: 45000, labor: 30000, equipment: 8200 },
    { month: 'Apr', materials: 52000, labor: 35000, equipment: 10500 },
    { month: 'May', materials: 58000, labor: 38000, equipment: 11200 },
    { month: 'Jun', materials: 62000, labor: 42000, equipment: 12800 }
  ];

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">{data?.value}% of total costs</p>
          <p className="text-sm font-medium text-popover-foreground">
            ${data?.amount?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const project = materialVsLaborData?.find(p => p?.project?.split(' ')?.[0] === label);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">{project?.project}</p>
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
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Material/Labor Ratio: <span className="font-medium text-foreground">{project?.ratio?.toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (analysisType === 'breakdown') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={costBreakdownData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {costBreakdownData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (analysisType === 'comparison') {
      return (
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
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="materials" fill="#3b82f6" name="Materials" />
            <Bar dataKey="labor" fill="#22c55e" name="Labor" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={costTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip />
          <Bar dataKey="materials" stackId="a" fill="#3b82f6" name="Materials" />
          <Bar dataKey="labor" stackId="a" fill="#22c55e" name="Labor" />
          <Bar dataKey="equipment" stackId="a" fill="#f59e0b" name="Equipment" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cost Analysis</h3>
          <p className="text-sm text-muted-foreground">Material vs labor cost breakdown and ratios</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={analysisType === 'breakdown' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAnalysisType('breakdown')}
              className="px-3 py-1 text-xs"
            >
              <Icon name="PieChart" size={14} />
            </Button>
            <Button
              variant={analysisType === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAnalysisType('comparison')}
              className="px-3 py-1 text-xs"
            >
              <Icon name="BarChart3" size={14} />
            </Button>
            <Button
              variant={analysisType === 'trends' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setAnalysisType('trends')}
              className="px-3 py-1 text-xs"
            >
              <Icon name="TrendingUp" size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Cost Chart */}
      <div className="h-64 mb-6">
        {renderChart()}
      </div>

      {/* Cost Breakdown Legend (for pie chart) */}
      {analysisType === 'breakdown' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {costBreakdownData?.map((category, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category?.color }}
                />
                <span className="text-sm font-medium text-foreground">{category?.name}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{category?.value}%</p>
              <p className="text-xs text-muted-foreground">
                ${category?.amount?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Material vs Labor Ratios Table */}
      {analysisType === 'comparison' && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Project</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Materials</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Labor</th>
                <th className="text-center py-2 text-muted-foreground font-medium">Ratio (M/L)</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {materialVsLaborData?.map((project, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-2 text-foreground font-medium">
                    {project?.project}
                  </td>
                  <td className="py-2 text-right text-foreground">
                    ${project?.materials?.toLocaleString()}
                  </td>
                  <td className="py-2 text-right text-foreground">
                    ${project?.labor?.toLocaleString()}
                  </td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project?.ratio > 1.4 ? 'text-red-600 bg-red-100' :
                      project?.ratio > 1.2 ? 'text-yellow-600 bg-yellow-100': 'text-green-600 bg-green-100'
                    }`}>
                      {project?.ratio?.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 text-right text-foreground font-medium">
                    ${(project?.materials + project?.labor)?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cost Insights */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Calculator" size={16} className="text-primary" />
          <h4 className="text-sm font-medium text-foreground">Cost Analysis Insights</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">1.33</p>
            <p className="text-xs text-muted-foreground">Avg Material/Labor Ratio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">$660k</p>
            <p className="text-xs text-muted-foreground">Total Project Costs YTD</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">45%</p>
            <p className="text-xs text-muted-foreground">Materials % of Total Cost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysis;