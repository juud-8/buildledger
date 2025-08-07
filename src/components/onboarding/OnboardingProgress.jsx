import React from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';

const OnboardingProgress = ({ className = '' }) => {
  const {
    steps,
    isOnboardingComplete,
    getCompletionPercentage,
    getNextIncompleteStep,
    skipOnboarding
  } = useOnboarding();
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      key: 'companyInfo',
      title: 'Add Company Info',
      description: 'Set up your company profile and business details',
      icon: 'Building2',
      route: '/settings',
      completed: steps.companyInfo
    },
    {
      key: 'firstClient',
      title: 'Add First Client',
      description: 'Create your first client to get started',
      icon: 'Users',
      route: '/clients',
      completed: steps.firstClient
    },
    {
      key: 'firstItem',
      title: 'Add First Item',
      description: 'Add materials and services to your catalog',
      icon: 'Package',
      route: '/items',
      completed: steps.firstItem
    },
    {
      key: 'firstProject',
      title: 'Create Project or Quote',
      description: 'Start your first project or create a quote',
      icon: 'FileText',
      route: '/projects',
      completed: steps.firstProject
    }
  ];

  const completionPercentage = getCompletionPercentage();
  const nextStep = getNextIncompleteStep();

  if (isOnboardingComplete) {
    return null;
  }

  const handleStepClick = (step) => {
    navigate(step.route);
  };

  const handleContinue = () => {
    const nextStepData = onboardingSteps.find(step => step.key === nextStep);
    if (nextStepData) {
      navigate(nextStepData.route);
    }
  };

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-construction/5 border-primary/20 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Welcome to BuildLedger!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete these steps to get the most out of your experience
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={skipOnboarding}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Setup
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps Checklist */}
        <div className="space-y-3 mb-6">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                step.completed
                  ? 'bg-success/5 border-success/20 hover:border-success/30'
                  : step.key === nextStep
                  ? 'bg-primary/5 border-primary/20 hover:border-primary/30 ring-1 ring-primary/10'
                  : 'bg-card border-border hover:border-border-hover'
              }`}
              onClick={() => handleStepClick(step)}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-success text-success-foreground'
                  : step.key === nextStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.completed ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <Icon name={step.icon} size={16} />
                )}
              </div>
              
              <div className="flex-1 ml-3">
                <h4 className={`text-sm font-medium ${
                  step.completed ? 'text-success' : 'text-foreground'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>

              {step.key === nextStep && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Next
                  </span>
                </div>
              )}

              {step.completed && (
                <div className="flex-shrink-0 ml-2">
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {nextStep && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Let's continue with: <span className="font-medium text-foreground">
                {onboardingSteps.find(step => step.key === nextStep)?.title}
              </span>
            </p>
            <Button
              onClick={handleContinue}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OnboardingProgress;