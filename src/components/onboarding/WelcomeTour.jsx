import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useOnboarding } from '../../contexts/OnboardingContext';

const WelcomeTour = () => {
  const { showWelcomeTour, hideWelcomeTour, isOnboardingComplete } = useOnboarding();
  const [currentTourStep, setCurrentTourStep] = useState(0);

  const tourSteps = [
    {
      title: 'Welcome to BuildLedger!',
      content: 'Your all-in-one construction business management platform. Let\'s take a quick tour to get you started.',
      icon: 'Sparkles',
      highlightSelector: null
    },
    {
      title: 'Project Overview',
      content: 'Track all your active projects, monitor progress, and view key metrics at a glance.',
      icon: 'Building2',
      highlightSelector: '[data-tour="kpi-cards"]'
    },
    {
      title: 'Quick Actions',
      content: 'Access frequently used features like creating projects, adding clients, and generating quotes.',
      icon: 'Zap',
      highlightSelector: '[data-tour="quick-actions"]'
    },
    {
      title: 'Recent Activity',
      content: 'Stay updated with the latest project updates, invoice payments, and team activities.',
      icon: 'Activity',
      highlightSelector: '[data-tour="activity-feed"]'
    },
    {
      title: 'Revenue Analytics',
      content: 'Monitor your business performance with detailed revenue charts and financial insights.',
      icon: 'TrendingUp',
      highlightSelector: '[data-tour="revenue-chart"]'
    }
  ];

  useEffect(() => {
    if (showWelcomeTour) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showWelcomeTour]);

  useEffect(() => {
    if (showWelcomeTour && tourSteps[currentTourStep]?.highlightSelector) {
      const element = document.querySelector(tourSteps[currentTourStep].highlightSelector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-highlight');
      }
    }

    return () => {
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentTourStep, showWelcomeTour]);

  if (!showWelcomeTour || isOnboardingComplete) {
    return null;
  }

  const currentStep = tourSteps[currentTourStep];
  const isLastStep = currentTourStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentTourStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentTourStep(prev => Math.max(0, prev - 1));
  };

  const handleFinish = () => {
    hideWelcomeTour();
  };

  const handleSkip = () => {
    hideWelcomeTour();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-border construction-shadow-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name={currentStep.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Step {currentTourStep + 1} of {tourSteps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-foreground leading-relaxed">
                {currentStep.content}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center space-x-2 mb-6">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentTourStep
                      ? 'bg-primary'
                      : index < currentTourStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {currentTourStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={handlePrevious}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip Tour
                </Button>
                <Button
                  size="sm"
                  iconName={isLastStep ? "Check" : "ArrowRight"}
                  iconPosition="right"
                  onClick={handleNext}
                >
                  {isLastStep ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tour Highlight Styles */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 30;
          background-color: hsl(var(--primary) / 0.05);
          border: 2px solid hsl(var(--primary) / 0.3);
          border-radius: 0.5rem;
          animation: tour-pulse 2s infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px hsl(var(--primary) / 0);
          }
        }
      `}</style>
    </>
  );
};

export default WelcomeTour;