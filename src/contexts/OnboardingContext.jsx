import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OnboardingContext = createContext();

const initialState = {
  isFirstTimeUser: true,
  steps: {
    companyInfo: false,
    firstClient: false,
    firstItem: false,
    firstProject: false
  },
  currentStep: null,
  showWelcomeTour: true,
  isOnboardingComplete: false
};

const onboardingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ONBOARDING_STATE':
      return { ...state, ...action.payload };
    
    case 'COMPLETE_STEP':
      const updatedSteps = { ...state.steps, [action.step]: true };
      const isOnboardingComplete = Object.values(updatedSteps).every(step => step);
      
      return {
        ...state,
        steps: updatedSteps,
        isOnboardingComplete,
        currentStep: isOnboardingComplete ? null : state.currentStep
      };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.step };
    
    case 'HIDE_WELCOME_TOUR':
      return { ...state, showWelcomeTour: false };
    
    case 'RESET_ONBOARDING':
      return { ...initialState };
    
    case 'SKIP_ONBOARDING':
      return {
        ...state,
        isFirstTimeUser: false,
        isOnboardingComplete: true,
        showWelcomeTour: false,
        currentStep: null
      };
    
    default:
      return state;
  }
};

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  useEffect(() => {
    if (user) {
      loadOnboardingState();
    }
  }, [user]);

  const loadOnboardingState = async () => {
    try {
      const savedState = localStorage.getItem(`onboarding_${user.id}`);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'SET_ONBOARDING_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    }
  };

  const saveOnboardingState = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(state));
    }
  };

  useEffect(() => {
    if (user) {
      saveOnboardingState();
    }
  }, [state, user]);

  const completeStep = (step) => {
    dispatch({ type: 'COMPLETE_STEP', step });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: 'SET_CURRENT_STEP', step });
  };

  const hideWelcomeTour = () => {
    dispatch({ type: 'HIDE_WELCOME_TOUR' });
  };

  const skipOnboarding = () => {
    dispatch({ type: 'SKIP_ONBOARDING' });
  };

  const resetOnboarding = () => {
    dispatch({ type: 'RESET_ONBOARDING' });
    if (user) {
      localStorage.removeItem(`onboarding_${user.id}`);
    }
  };

  const getNextIncompleteStep = () => {
    const stepOrder = ['companyInfo', 'firstClient', 'firstItem', 'firstProject'];
    return stepOrder.find(step => !state.steps[step]);
  };

  const getCompletionPercentage = () => {
    const completedSteps = Object.values(state.steps).filter(Boolean).length;
    return Math.round((completedSteps / 4) * 100);
  };

  const value = {
    ...state,
    completeStep,
    setCurrentStep,
    hideWelcomeTour,
    skipOnboarding,
    resetOnboarding,
    getNextIncompleteStep,
    getCompletionPercentage
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};