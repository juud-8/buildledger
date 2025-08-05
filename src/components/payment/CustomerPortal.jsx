import React, { useState, useEffect } from 'react';
import { stripeService } from '../../services/stripeService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const CustomerPortal = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    if (userProfile?.stripe_customer_id) {
      loadCustomerData();
    }
  }, [userProfile]);

  const loadCustomerData = async () => {
    if (!userProfile?.stripe_customer_id) return;

    setLoading(true);
    try {
      // Load subscription data
      if (userProfile.subscription_id) {
        const subData = await stripeService.getSubscription(userProfile.subscription_id);
        setSubscription(subData);
      }

      // Load payment methods
      const methods = await stripeService.getPaymentMethods(userProfile.stripe_customer_id);
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error loading customer data:', err);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!userProfile?.stripe_customer_id) return;

    setLoading(true);
    setError(null);

    try {
      const { url } = await stripeService.createCustomerPortalSession(
        userProfile.stripe_customer_id,
        window.location.href
      );
      
      window.location.href = url;
    } catch (err) {
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;

    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await stripeService.cancelSubscription(subscription.id);
      await loadCustomerData(); // Reload data
    } catch (err) {
      setError('Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'canceled':
        return 'text-error';
      case 'past_due':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!userProfile?.stripe_customer_id) {
    return (
      <div className="text-center py-8">
        <Icon name="User" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Billing Account</h3>
        <p className="text-muted-foreground mb-4">
          You don't have a billing account set up yet.
        </p>
        <Button onClick={() => window.location.href = '/subscription'}>
          Subscribe to a Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Billing & Subscription</h2>
        <Button
          onClick={handleManageBilling}
          disabled={loading}
          variant="outline"
        >
          <Icon name="Settings" size={16} className="mr-2" />
          Manage Billing
        </Button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-md p-4">
          <div className="flex items-center">
            <Icon name="AlertTriangle" size={16} className="text-error mr-2" />
            <span className="text-error">{error}</span>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Current Subscription</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading subscription details...
          </div>
        ) : subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{subscription.plan_name}</p>
                <p className="text-sm text-muted-foreground">
                  ${subscription.plan_price}/month
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Period</p>
                <p className="font-medium">
                  {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Billing</p>
                <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                <div className="flex items-center">
                  <Icon name="AlertTriangle" size={16} className="text-warning mr-2" />
                  <span className="text-warning text-sm">
                    Your subscription will be canceled at the end of the current billing period.
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleManageBilling}
                disabled={loading}
                variant="outline"
              >
                Change Plan
              </Button>
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  variant="outline"
                  className="text-error hover:text-error"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">No Active Subscription</h4>
            <p className="text-muted-foreground mb-4">
              You don't have an active subscription.
            </p>
            <Button onClick={() => window.location.href = '/subscription'}>
              Subscribe to a Plan
            </Button>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Methods</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading payment methods...
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex items-center">
                  <Icon name="CreditCard" size={20} className="text-muted-foreground mr-3" />
                  <div>
                    <p className="font-medium text-foreground">
                      {method.card_brand} •••• {method.card_last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.card_exp_month}/{method.card_exp_year}
                    </p>
                  </div>
                </div>
                {method.is_default && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payment methods found.</p>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Billing History</h3>
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            View your complete billing history and download invoices.
          </p>
          <Button onClick={handleManageBilling} disabled={loading}>
            View Billing History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal; 