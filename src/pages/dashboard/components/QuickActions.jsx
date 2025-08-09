import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Create Quote',
      description: 'Generate new project quote',
      icon: 'FileText',
      variant: 'default',
      onClick: () => navigate('/quotes')
    },
    {
      id: 2,
      title: 'Add Project',
      description: 'Start new construction project',
      icon: 'Plus',
      variant: 'outline',
      onClick: () => navigate('/projects')
    },
    {
      id: 3,
      title: 'Upload Photos',
      description: 'Add project documentation',
      icon: 'Camera',
      variant: 'outline',
      onClick: () => navigate('/projects?action=upload-photos')
    },
    {
      id: 4,
      title: 'Generate Report',
      description: 'Create business analytics',
      icon: 'BarChart3',
      variant: 'outline',
      onClick: () => navigate('/analytics')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions?.map((action) => (
          <Button
            key={action?.id}
            variant={action?.variant}
            onClick={action?.onClick}
            iconName={action?.icon}
            iconPosition="left"
            className="h-auto p-4 flex-col items-start text-left construction-card-3d rounded-xl construction-transition hover:construction-shadow-lg"
          >
            <div className="w-full">
              <div className="font-medium text-sm mb-1">{action?.title}</div>
              <div className="text-xs text-muted-foreground">{action?.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;