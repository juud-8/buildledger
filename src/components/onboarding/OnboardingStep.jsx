import React, { useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const OnboardingStep = ({ stepKey, children }) => {
  const { completeStep, setCurrentStep } = useOnboarding();

  useEffect(() => {
    setCurrentStep(stepKey);
    
    return () => {
      setCurrentStep(null);
    };
  }, [stepKey, setCurrentStep]);

  const handleStepCompletion = () => {
    completeStep(stepKey);
  };

  return (
    <div className="onboarding-step">
      {typeof children === 'function' ? children({ completeStep: handleStepCompletion }) : children}
    </div>
  );
};

export default OnboardingStep;