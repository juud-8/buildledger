import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../../components/ui/Card';

const ProjectCard = ({ project }) => {
  const progressColor = (() => {
    if (project?.progress >= 80) return 'success';
    if (project?.progress >= 50) return 'primary';
    if (project?.progress >= 25) return 'warning';
    return 'error';
  })();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link
              to={`/project-details?id=${project?.id}`}
              className="block group"
            >
              <CardTitle className="group-hover:text-primary transition-colors truncate">
                {project?.name}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1">{project?.client}</CardDescription>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${project?.status}/10 text-${project?.status}`}>
            {project?.status?.charAt(0)?.toUpperCase() + project?.status?.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-foreground">{project?.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all bg-${progressColor}`}
              style={{ width: `${project?.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Start: </span>
            <span className="text-foreground">{formatDate(project?.startDate)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">End: </span>
            <span className="text-foreground">{formatDate(project?.endDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(project?.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Actual</p>
            <p className={`text-sm font-semibold ${project?.actualCost > project?.budget ? 'text-error' : 'text-success'}`}>
              {formatCurrency(project?.actualCost)}
            </p>
          </div>
        </div>

        {project?.nextMilestone && (
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {project?.nextMilestone?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {formatDate(project?.nextMilestone?.dueDate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            iconName="Eye"
            iconPosition="left"
            className="text-xs"
            onClick={() => window.location.href = `/project-details?id=${project?.id}`}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Camera"
            iconPosition="left"
            className="text-xs"
          >
            Photos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            className="text-xs"
          >
            Update
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Receipt"
            iconPosition="left"
            className="text-xs"
          >
            Invoice
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;