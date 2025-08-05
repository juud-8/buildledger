import React from 'react';
import Button from '../../../components/ui/Button';

const NavigationButtons = ({ 
  currentStep, 
  totalSteps, 
  onBack, 
  onNext, 
  onSubmit, 
  isLoading,
  canProceed 
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border">
      <div className="w-full sm:w-auto">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            fullWidth
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Back
          </Button>
        )}
      </div>

      <div className="w-full sm:w-auto">
        {isLastStep ? (
          <Button
            variant="default"
            onClick={onSubmit}
            loading={isLoading}
            disabled={!canProceed}
            fullWidth
            iconName="UserPlus"
            iconPosition="left"
          >
            Create Account
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={onNext}
            disabled={!canProceed || isLoading}
            fullWidth
            iconName="ChevronRight"
            iconPosition="right"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;