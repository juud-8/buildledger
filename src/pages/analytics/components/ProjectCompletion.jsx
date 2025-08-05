import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import Icon from '../../../components/AppIcon';

const ProjectCompletion = ({ dateRange, filters }) => {
  const completionData = [
    { 
      project: 'Residential Complex A',
      planned: 240,
      actual: 256,
      variance: 16,
      efficiency: 94,
      type: 'Residential'
    },
    { 
      project: 'Office Building B',
      planned: 360,
      actual: 378,
      variance: 18,
      efficiency: 95,
      type: 'Commercial'
    },
    { 
      project: 'Shopping Center C',
      planned: 420,
      actual: 385,
      variance: -35,
      efficiency: 109,
      type: 'Retail'
    },
    { 
      project: 'Warehouse D',
      planned: 180,
      actual: 165,
      variance: -15,
      efficiency: 109,
      type: 'Industrial'
    },
    { 
      project: 'Retail Store E',
      planned: 120,
      actual: 132,
      variance: 12,
      efficiency: 91,
      type: 'Retail'
    }
  ];

  const chartData = completionData?.map(project => ({
    name: project?.project?.split(' ')?.[0] + ' ' + project?.project?.split(' ')?.[1],
    planned: project?.planned,
    actual: project?.actual,
    efficiency: project?.efficiency
  }));

  const efficiencyScatterData = completionData?.map(project => ({
    x: project?.planned,
    y: project?.actual,
    efficiency: project?.efficiency,
    name: project?.project?.split(' ')?.[0] + ' ' + project?.project?.split(' ')?.[1],
    type: project?.type
  }));

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 105) return 'text-green-600 bg-green-100';
    if (efficiency >= 95) return 'text-blue-600 bg-blue-100';
    if (efficiency >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVarianceColor = (variance) => {
    if (variance <= 0) return 'text-green-600';
    if (variance <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const project = completionData?.find(p => 
        (p?.project?.split(' ')?.[0] + ' ' + p?.project?.split(' ')?.[1]) === label
      );
      return (
        <div className="bg-popover border border-border rounded-lg p-4 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">{project?.project}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Planned: <span className="font-medium text-foreground">{project?.planned} days</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Actual: <span className="font-medium text-foreground">{project?.actual} days</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Variance: <span className={`font-medium ${getVarianceColor(project?.variance)}`}>
                {project?.variance > 0 ? '+' : ''}{project?.variance} days
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Efficiency: <span className="font-medium text-foreground">{project?.efficiency}%</span>
            </p>
          </div>
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
          <p className="text-sm text-muted-foreground">Type: {data?.type}</p>
          <p className="text-sm text-muted-foreground">Planned: {data?.x} days</p>
          <p className="text-sm text-muted-foreground">Actual: {data?.y} days</p>
          <p className="text-sm text-muted-foreground">Efficiency: {data?.efficiency}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Project Completion Analysis</h3>
          <p className="text-sm text-muted-foreground">Timeline performance and efficiency metrics</p>
        </div>
        <Icon name="Clock" size={20} className="text-muted-foreground" />
      </div>
      {/* Completion Time Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="planned" fill="var(--color-muted)" name="Planned Duration" />
            <Bar dataKey="actual" fill="var(--color-primary)" name="Actual Duration" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Efficiency Scatter Plot */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Timeline vs Efficiency</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Planned Days"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Actual Days"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                name="Projects" 
                data={efficiencyScatterData} 
                fill="var(--color-primary)"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Project Performance Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Project</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Type</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Planned</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Actual</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Variance</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {completionData?.map((project, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-2 text-foreground font-medium">
                  {project?.project?.split(' ')?.slice(0, 2)?.join(' ')}
                </td>
                <td className="py-2 text-center text-muted-foreground">
                  {project?.type}
                </td>
                <td className="py-2 text-center text-foreground">
                  {project?.planned} days
                </td>
                <td className="py-2 text-center text-foreground">
                  {project?.actual} days
                </td>
                <td className={`py-2 text-center font-medium ${getVarianceColor(project?.variance)}`}>
                  {project?.variance > 0 ? '+' : ''}{project?.variance} days
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEfficiencyColor(project?.efficiency)}`}>
                    {project?.efficiency}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">99.6%</p>
          <p className="text-xs text-muted-foreground">Avg Efficiency</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">60%</p>
          <p className="text-xs text-muted-foreground">On-Time Projects</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">275</p>
          <p className="text-xs text-muted-foreground">Avg Duration (days)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-600">-0.8</p>
          <p className="text-xs text-muted-foreground">Avg Variance (days)</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCompletion;