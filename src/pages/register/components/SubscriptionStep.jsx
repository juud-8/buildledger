import React from 'react';
import Icon from '../../../components/AppIcon';

import { Checkbox } from '../../../components/ui/Checkbox';

const SubscriptionStep = ({ formData, setFormData, errors, setErrors }) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      period: 'month',
      description: 'Perfect for small contractors getting started',
      features: [
        'Up to 10 projects per month',
        'Basic invoicing & quotes',
        'Client management',
        'Photo documentation',
        'Email support',
        'Mobile app access'
      ],
      popular: false,
      color: 'border-border'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      period: 'month',
      description: 'Ideal for growing construction businesses',
      features: [
        'Unlimited projects',
        'Advanced invoicing & quotes',
        'Progress billing',
        'Subcontractor management',
        'Digital signatures',
        'Project timeline tracking',
        'Weather delay documentation',
        'Priority support',
        'Advanced reporting'
      ],
      popular: true,
      color: 'border-primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      period: 'month',
      description: 'For large construction companies',
      features: [
        'Everything in Professional',
        'Multi-user access control',
        'Custom integrations',
        'Advanced analytics',
        'White-label options',
        'Dedicated account manager',
        'Custom training',
        'API access',
        'Priority phone support'
      ],
      popular: false,
      color: 'border-construction-orange'
    }
  ];

  const handlePlanSelect = (planId) => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
    
    if (errors?.selectedPlan) {
      setErrors(prev => ({ ...prev, selectedPlan: '' }));
    }
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
    
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your construction business needs
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`relative bg-card border-2 rounded-xl p-6 cursor-pointer construction-transition hover:construction-depth-3 ${
              formData?.selectedPlan === plan?.id ? plan?.color : 'border-border'
            } ${plan?.popular ? 'ring-2 ring-primary ring-opacity-20' : ''}`}
            onClick={() => handlePlanSelect(plan?.id)}
          >
            {plan?.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{plan?.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-foreground">${plan?.price}</span>
                <span className="text-muted-foreground">/{plan?.period}</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan?.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan?.features?.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center construction-transition ${
                formData?.selectedPlan === plan?.id 
                  ? 'border-primary bg-primary' :'border-border'
              }`}>
                {formData?.selectedPlan === plan?.id && (
                  <Icon name="Check" size={12} color="white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {errors?.selectedPlan && (
        <p className="text-error text-sm text-center">{errors?.selectedPlan}</p>
      )}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">14-Day Free Trial</p>
            <p>Start with any plan and get full access for 14 days. No credit card required. Cancel anytime during the trial period.</p>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-4 border-t border-border">
        <Checkbox
          label="I agree to the Terms of Service and Privacy Policy"
          checked={formData?.agreeToTerms || false}
          onChange={(e) => handleCheckboxChange('agreeToTerms', e?.target?.checked)}
          error={errors?.agreeToTerms}
          required
        />

        <Checkbox
          label="I would like to receive product updates and construction industry insights via email"
          checked={formData?.subscribeToUpdates || false}
          onChange={(e) => handleCheckboxChange('subscribeToUpdates', e?.target?.checked)}
        />
      </div>
    </div>
  );
};

export default SubscriptionStep;