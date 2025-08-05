import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import BasicInfoStep from './components/BasicInfoStep';
import BusinessInfoStep from './components/BusinessInfoStep';
import SubscriptionStep from './components/SubscriptionStep';
import ProgressIndicator from './components/ProgressIndicator';
import NavigationButtons from './components/NavigationButtons';
import { supabase } from '../../lib/supabase';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    
    // Step 2: Business Info
    businessType: '',
    licenseNumber: '', // Now optional
    yearsInBusiness: '',
    projectSize: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Step 3: Subscription
    selectedPlan: '',
    agreeToTerms: false
  });

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData?.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    if (!formData?.ownerName?.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData?.businessType) {
      newErrors.businessType = 'Please select your business type';
    }
    
    // License number is now optional - removed validation
    
    if (!formData?.yearsInBusiness) {
      newErrors.yearsInBusiness = 'Please select years in business';
    }
    
    if (!formData?.projectSize) {
      newErrors.projectSize = 'Please select typical project size';
    }
    
    if (!formData?.businessAddress?.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }
    
    if (!formData?.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData?.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData?.zipCode?.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData?.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData?.selectedPlan) {
      newErrors.selectedPlan = 'Please select a subscription plan';
    }
    
    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('formData:', formData);
    console.log('validateStep3 result:', validateStep3());
    
    if (!validateStep3()) {
      console.log('Step 3 validation failed');
      return;
    }
    
    console.log('Starting registration process...');
    setIsLoading(true);
    
    try {
      console.log('Calling signUp with:', {
        email: formData.email,
        password: formData.password,
        fullName: formData.ownerName,
        companyName: formData.businessName
      });
      
      // Use real Supabase authentication
      const result = await signUp(
        formData.email,
        formData.password,
        formData.ownerName,
        formData.businessName
      );
      
      console.log('Registration result:', result);
      
      // Check if email confirmation is required
      if (result?.requiresEmailConfirmation) {
        console.log('Email confirmation required');
        // Show email confirmation message
        setErrors({ 
          submit: 'Registration successful! Please check your email to confirm your account before signing in.' 
        });
        // Don't redirect - let user see the message
      } else {
        console.log('Email confirmation not required, redirecting to dashboard');
        setIsSuccess(true);
        // Email confirmation not required, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Account created successfully! Welcome to BuildLedger.',
              isNewUser: true 
            }
          });
        }, 1500);
      }
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Check if user is actually signed in despite the error
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('User is signed in despite error, redirecting to dashboard');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Account created successfully! Welcome to BuildLedger.',
              isNewUser: true 
            }
          });
        }, 1500);
        return;
      }
      
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      console.log('Registration process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData?.businessName && formData?.ownerName && formData?.email && formData?.password && formData?.phone;
      case 2:
        return formData?.businessType && formData?.yearsInBusiness && 
               formData?.projectSize && formData?.businessAddress && formData?.city && formData?.state && formData?.zipCode;
      case 3:
        return formData?.selectedPlan && formData?.agreeToTerms;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <BusinessInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <SubscriptionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/login" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Icon name="Building2" size={20} color="white" />
              </div>
              <span className="text-xl font-bold text-foreground">BuildLedger</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Already have an account?</span>
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium construction-transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-lg construction-shadow-lg p-6 lg:p-8">
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          <div className="max-w-2xl mx-auto">
            {renderStep()}
            
            {errors?.submit && (
              <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={20} className="text-error" />
                  <p className="text-error text-sm">{errors?.submit}</p>
                </div>
              </div>
            )}
            
            {isSuccess && (
              <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <p className="text-success text-sm">Registration successful! Redirecting to dashboard...</p>
                </div>
              </div>
            )}
            
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              canProceed={canProceed()}
            />
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground construction-transition">
                Terms of Service
              </Link>
              <Link to="#" className="hover:text-foreground construction-transition">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-foreground construction-transition">
                Support
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} BuildLedger. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;