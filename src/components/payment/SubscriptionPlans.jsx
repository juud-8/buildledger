import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';
import { stripeService } from '../../services/stripeService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const PlanCard = ({ plan, isSelected, onSelect, loading }) => {
  const { name, price, features } = plan;

  return (
    <div 
      className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={() => !loading && onSelect(plan)}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Icon name="Check" size={14} className="text-white" />
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-foreground">${price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Icon name="Check" size={16} className="text-success mr-3 flex-shrink-0" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(plan);
        }}
        disabled={loading}
        className="w-full"
        variant={isSelected ? 'default' : 'outline'}
      >
        {loading ? 'Processing...' : isSelected ? 'Selected' : 'Select Plan'}
      </Button>
    </div>
  );
};

const SubscriptionPlans = ({ onSuccess, onCancel }) => {
  const { user, userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = stripeService.getSubscriptionPlans();

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Create or get customer
      let customerId = userProfile?.stripe_customer_id;
      
      if (!customerId) {
        const customerResult = await stripeService.createCustomer(
          user.id,
          user.email,
          userProfile?.full_name || user.email
        );
        customerId = customerResult.customerId;
      }

      // Create subscription
      const subscriptionResult = await stripeService.createSubscription(
        customerId,
        selectedPlan.id
      );

      if (subscriptionResult.success) {
        onSuccess && onSuccess(subscriptionResult);
      } else {
        setError('Failed to create subscription. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating your subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your construction business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <PlanCard
            key={key}
            plan={plan}
            isSelected={selectedPlan?.id === plan.id}
            onSelect={handlePlanSelect}
            loading={loading}
          />
        ))}
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <Icon name="AlertTriangle" size={16} className="text-error mr-2" />
            <span className="text-error">{error}</span>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Selected Plan: {selectedPlan.name}</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground">Monthly billing</p>
              <p className="text-sm text-muted-foreground">
                You can cancel or change your plan at any time
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">${selectedPlan.price}/month</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubscribe}
          disabled={!selectedPlan || loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Secure payment powered by Stripe
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Icon name="Shield" size={12} className="mr-1" />
              PCI Compliant
            </div>
            <div className="flex items-center">
              <Icon name="Lock" size={12} className="mr-1" />
              SSL Encrypted
            </div>
            <div className="flex items-center">
              <Icon name="CreditCard" size={12} className="mr-1" />
              Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans; 