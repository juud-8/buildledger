import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProjectProfitability = ({ dateRange, filters, projectsMetrics }) => {
  const [viewType, setViewType] = useState('comparison');

  const defaultProjectData = [
    { 
      name: 'Residential Complex A', 
      budget: 450000, 
      actual: 420000, 
      profit: 30000, 
      margin: 7.1,
      status: 'completed',
      duration: 8
    },
    { 
      name: 'Office Building B', 
      budget: 750000, 
      actual: 780000, 
      profit: -30000, 
      margin: -3.8,
      status: 'completed',
      duration: 12
    },
    { 
      name: 'Shopping Center C', 
      budget: 920000, 
      actual: 850000, 
      profit: 70000, 
      margin: 8.2,
      status: 'active',
      duration: 14
    },
    { 
      name: 'Warehouse D', 
      budget: 320000, 
      actual: 295000, 
      profit: 25000, 
      margin: 8.5,
      status: 'completed',
      duration: 6
    },
    { 
      name: 'Retail Store E', 
      budget: 180000, 
      actual: 175000, 
      profit: 5000, 
      margin: 2.9,
      status: 'active',
      duration: 4
    }
  ];

  // Allow injection of real metrics: expect array of { name, budget, actual, profit, margin }
  const projectData = useMemo(() => (
    Array.isArray(projectsMetrics)
      ? projectsMetrics.map(p => ({
          name: p.name,
          budget: p.totalCost ?? p.budget ?? 0,
          actual: p.totalCost ?? 0,
          profit: p.profit ?? 0,
          margin: typeof p.profitMargin === 'number' ? Number(p.profitMargin.toFixed(1)) : 0,
          status: p.status ?? 'active',
          duration: p.duration ?? 0,
        }))
      : defaultProjectData
  ), [projectsMetrics]);

  const profitabilityData = projectData?.map(project => ({
    name: project?.name?.split(' ')?.[0] + ' ' + project?.name?.split(' ')?.[1],
    budget: project?.budget,
    actual: project?.actual,
    profit: project?.profit,
    margin: project?.margin
  }));

  const scatterData = projectData?.map(project => ({
    x: project?.budget / 1000,
    y: project?.margin,
    name: project?.name?.split(' ')?.[0] + ' ' + project?.name?.split(' ')?.[1],
    status: project?.status
  }));

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

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">Budget: ${(data?.x * 1000)?.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Margin: {data?.y}%</p>
          <p className="text-xs text-muted-foreground capitalize">Status: {data?.status}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (viewType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Budget" 
              unit="k"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Margin" 
              unit="%"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<ScatterTooltip />} />
            <Scatter 
              name="Projects" 
              data={scatterData} 
              fill="var(--color-primary)"
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={profitabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="budget" fill="var(--color-muted)" name="Budget" />
          <Bar dataKey="actual" fill="var(--color-primary)" name="Actual Cost" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Project Profitability Analysis</h3>
          <p className="text-sm text-muted-foreground">Budget vs actual costs and profit margins</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewType === 'comparison' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('comparison')}
              className="px-3 py-1"
            >
              <Icon name="BarChart3" size={16} />
            </Button>
            <Button
              variant={viewType === 'scatter' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('scatter')}
              className="px-3 py-1"
            >
              <Icon name="Scatter3d" size={16} />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-64 mb-6">
        {renderChart()}
      </div>
      {/* Project Performance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Project</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Budget</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Actual</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Profit</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {projectData?.map((project, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-2 text-foreground font-medium">
                  {project?.name?.split(' ')?.slice(0, 2)?.join(' ')}
                </td>
                <td className="py-2 text-right text-foreground">
                  ${project?.budget?.toLocaleString()}
                </td>
                <td className="py-2 text-right text-foreground">
                  ${project?.actual?.toLocaleString()}
                </td>
                <td className={`py-2 text-right font-medium ${
                  project?.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${project?.profit?.toLocaleString()}
                </td>
                <td className={`py-2 text-right font-medium ${
                  project?.margin >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {project?.margin}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">5.4%</p>
          <p className="text-xs text-muted-foreground">Avg Profit Margin</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">80%</p>
          <p className="text-xs text-muted-foreground">Projects on Budget</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">$100k</p>
          <p className="text-xs text-muted-foreground">Total Profit YTD</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectProfitability;