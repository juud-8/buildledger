import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Icon from '../../../components/AppIcon';

const SubcontractorPerformance = ({ dateRange, filters }) => {
  const subcontractorData = [
    {
      name: 'Elite Construction Co',
      projectsCompleted: 8,
      qualityScore: 95,
      timelinessScore: 92,
      costEfficiency: 88,
      totalValue: 185000,
      rating: 4.8,
      specialty: 'Electrical'
    },
    {
      name: 'Metro Builders LLC',
      projectsCompleted: 12,
      qualityScore: 89,
      timelinessScore: 94,
      costEfficiency: 91,
      totalValue: 245000,
      rating: 4.6,
      specialty: 'Plumbing'
    },
    {
      name: 'Precision Contractors',
      projectsCompleted: 6,
      qualityScore: 97,
      timelinessScore: 89,
      costEfficiency: 85,
      totalValue: 142000,
      rating: 4.9,
      specialty: 'HVAC'
    },
    {
      name: 'Urban Development Inc',
      projectsCompleted: 10,
      qualityScore: 84,
      timelinessScore: 87,
      costEfficiency: 93,
      totalValue: 198000,
      rating: 4.3,
      specialty: 'General'
    },
    {
      name: 'Quality Finishers',
      projectsCompleted: 5,
      qualityScore: 98,
      timelinessScore: 91,
      costEfficiency: 82,
      totalValue: 95000,
      rating: 4.7,
      specialty: 'Finishing'
    }
  ];

  const performanceMetrics = subcontractorData?.map(sub => ({
    name: sub?.name?.split(' ')?.[0],
    quality: sub?.qualityScore,
    timeliness: sub?.timelinessScore,
    costEfficiency: sub?.costEfficiency,
    overall: Math.round((sub?.qualityScore + sub?.timelinessScore + sub?.costEfficiency) / 3)
  }));

  const radarData = [
    { subject: 'Quality', fullMark: 100 },
    { subject: 'Timeliness', fullMark: 100 },
    { subject: 'Cost Efficiency', fullMark: 100 },
    { subject: 'Communication', fullMark: 100 },
    { subject: 'Safety', fullMark: 100 },
    { subject: 'Innovation', fullMark: 100 }
  ];

  const getPerformanceColor = (score) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 90) return 'text-blue-600 bg-blue-100';
    if (score >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)]?.map((_, i) => (
          <Icon key={i} name="Star" size={12} className="text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && <Icon name="Star" size={12} className="text-yellow-400 fill-current opacity-50" />}
        {[...Array(emptyStars)]?.map((_, i) => (
          <Icon key={i} name="Star" size={12} className="text-muted-foreground" />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const subcontractor = subcontractorData?.find(s => s?.name?.split(' ')?.[0] === label);
      return (
        <div className="bg-popover border border-border rounded-xl p-4 construction-depth-3">
          <p className="text-sm font-medium text-popover-foreground mb-2">{subcontractor?.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Specialty: <span className="font-medium text-foreground">{subcontractor?.specialty}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Projects: <span className="font-medium text-foreground">{subcontractor?.projectsCompleted}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Total Value: <span className="font-medium text-foreground">${subcontractor?.totalValue?.toLocaleString()}</span>
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rating:</span>
              {getRatingStars(subcontractor?.rating)}
            </div>
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
          <h3 className="text-lg font-semibold text-foreground">Subcontractor Performance</h3>
          <p className="text-sm text-muted-foreground">Quality, timeliness, and cost efficiency analysis</p>
        </div>
        <Icon name="Users" size={20} className="text-muted-foreground" />
      </div>
      {/* Performance Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="quality" fill="#22c55e" name="Quality Score" />
            <Bar dataKey="timeliness" fill="#3b82f6" name="Timeliness Score" />
            <Bar dataKey="costEfficiency" fill="#f59e0b" name="Cost Efficiency" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Performance Radar - Top Performer */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Elite Construction Co - Performance Profile</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData?.map(item => ({ ...item, value: 95 }))}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Subcontractor Performance Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Subcontractor</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Specialty</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Projects</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Quality</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Timeliness</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Cost Eff.</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {subcontractorData?.map((sub, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-2 text-foreground font-medium">
                  <div>
                    <p className="font-medium">{sub?.name?.split(' ')?.slice(0, 2)?.join(' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      ${sub?.totalValue?.toLocaleString()} total
                    </p>
                  </div>
                </td>
                <td className="py-2 text-center text-muted-foreground">
                  {sub?.specialty}
                </td>
                <td className="py-2 text-center text-foreground">
                  {sub?.projectsCompleted}
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(sub?.qualityScore)}`}>
                    {sub?.qualityScore}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(sub?.timelinessScore)}`}>
                    {sub?.timelinessScore}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(sub?.costEfficiency)}`}>
                    {sub?.costEfficiency}%
                  </span>
                </td>
                <td className="py-2 text-center">
                  {getRatingStars(sub?.rating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">23</p>
          <p className="text-xs text-muted-foreground">Active Subcontractors</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">92.6%</p>
          <p className="text-xs text-muted-foreground">Avg Quality Score</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">4.7</p>
          <p className="text-xs text-muted-foreground">Average Rating</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">$865k</p>
          <p className="text-xs text-muted-foreground">Total Contract Value</p>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorPerformance;