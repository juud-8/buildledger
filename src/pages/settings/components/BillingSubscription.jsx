import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { stripeService } from '../../../services/stripeService';
import { showSuccessToast } from '../../../utils/toastHelper';

const BillingSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentPlan, setCurrentPlan] = useState({
    name: "Starter",
    price: 29,
    billing: "monthly",
    features: [
      "Up to 10 projects",
      "Basic invoicing",
      "Client management",
      "Email support"
    ],
    nextBilling: "2024-02-15T00:00:00Z",
    status: "active"
  });

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "card",
      brand: "visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true
    },
    {
      id: 2,
      type: "card",
      brand: "mastercard",
      last4: "5555",
      expiryMonth: 8,
      expiryYear: 2025,
      isDefault: false
    }
  ]);

  const [billingHistory, setBillingHistory] = useState([
    {
      id: 1,
      date: "2024-08-04",
      description: "Professional Plan - Monthly",
      amount: 49.00,
      status: "paid",
      invoiceUrl: "#"
    },
    {
      id: 2,
      date: "2024-07-04",
      description: "Professional Plan - Monthly",
      amount: 49.00,
      status: "paid",
      invoiceUrl: "#"
    },
    {
      id: 3,
      date: "2024-06-04",
      description: "Professional Plan - Monthly",
      amount: 49.00,
      status: "paid",
      invoiceUrl: "#"
    },
    {
      id: 4,
      date: "2024-05-04",
      description: "Starter Plan - Monthly",
      amount: 19.00,
      status: "paid",
      invoiceUrl: "#"
    }
  ]);

  const [plans] = useState([
    {
      id: "price_1RsaVXKbuTYpVaZ7bQUlqd2E",
      name: "Starter",
      price: 29,
      description: "Perfect for small contractors",
      features: [
        "Up to 10 projects",
        "Basic invoicing",
        "Client management",
        "Email support"
      ]
    },
    {
      id: "price_1RsaVkKbuTYpVaZ7hspcAaFo",
      name: "Professional",
      price: 79,
      description: "Best for growing businesses",
      features: [
        "Up to 50 projects",
        "Advanced invoicing",
        "Analytics dashboard",
        "Priority support",
        "Custom branding"
      ],
      popular: true
    },
    {
      id: "price_1RsaVuKbuTYpVaZ7alwjzlHn",
      name: "Enterprise",
      price: 199,
      description: "For large construction companies",
      features: [
        "Unlimited projects",
        "Advanced analytics",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Team management"
      ]
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    name: ""
  });

  const handleSetDefaultPayment = (paymentId) => {
    setPaymentMethods(paymentMethods?.map(method => ({
      ...method,
      isDefault: method?.id === paymentId
    })));
  };

  const handleRemovePayment = (paymentId) => {
    setPaymentMethods(paymentMethods?.filter(method => method?.id !== paymentId));
  };

  const handleAddPaymentMethod = () => {
    const newMethod = {
      id: Date.now(),
      type: "card",
      brand: "visa",
      last4: newPaymentMethod?.cardNumber?.slice(-4),
      expiryMonth: parseInt(newPaymentMethod?.expiryMonth),
      expiryYear: parseInt(newPaymentMethod?.expiryYear),
      isDefault: paymentMethods?.length === 0
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddPayment(false);
    setNewPaymentMethod({ cardNumber: "", expiryMonth: "", expiryYear: "", cvc: "", name: "" });
  };

  const handleUpgradePlan = async (planId) => {
    // Check if user is authenticated using real auth
    if (!user) {
      setError('Please log in to upgrade your plan.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the plan details
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Create or get customer
      let customerId = null; // We'll create a new customer for the user
      
      if (!customerId) {
        const customerResult = await stripeService.createCustomer(
          user.id,
          user.email,
          user.user_metadata?.full_name || user.email
        );
        customerId = customerResult.customerId;
      }

      // Create subscription
      const subscriptionResult = await stripeService.createSubscription(
        customerId,
        plan.id
      );

      if (subscriptionResult.success) {
        // Update current plan state
        setCurrentPlan({
          name: plan.name,
          price: plan.price,
          billing: "monthly",
          features: plan.features,
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: "active"
        });
        
        setShowChangePlan(false);
        showSuccessToast('Plan upgraded successfully!', '✅');
      } else {
        setError('Failed to upgrade plan. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while upgrading your plan.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      paid: "bg-success text-success-foreground",
      pending: "bg-warning text-warning-foreground",
      failed: "bg-error text-error-foreground"
    };
    return colors?.[status] || "bg-muted text-muted-foreground";
  };

  const getCardIcon = (brand) => {
    return brand === "visa" ? "CreditCard" : "CreditCard";
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1)?.toString()?.padStart(2, '0'),
    label: (i + 1)?.toString()?.padStart(2, '0')
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (new Date()?.getFullYear() + i)?.toString(),
    label: (new Date()?.getFullYear() + i)?.toString()
  }));

  return (
    <div className="bg-card rounded-xl border border-border construction-card-3d construction-depth-3">
      <div className="p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Billing & Subscription</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and billing information
          </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-semibold text-foreground">{currentPlan?.name} Plan</h4>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-success text-success-foreground">
                  {currentPlan?.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                ${currentPlan?.price}
                <span className="text-sm font-normal text-muted-foreground">/{currentPlan?.billing}</span>
              </p>
            </div>
            <Button
              variant="outline"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setShowChangePlan(true)}
            >
              Change Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Plan Features</h5>
              <ul className="space-y-1">
                {currentPlan?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Icon name="Check" size={14} className="text-success" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-foreground mb-2">Billing Information</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next billing date:</span>
                  <span className="text-sm text-foreground">{new Date(currentPlan.nextBilling)?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Billing cycle:</span>
                  <span className="text-sm text-foreground capitalize">{currentPlan?.billing}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-foreground">Payment Methods</h4>
            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              onClick={() => setShowAddPayment(true)}
            >
              Add Payment Method
            </Button>
          </div>

          <div className="space-y-3">
            {paymentMethods?.map((method) => (
              <div key={method?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={getCardIcon(method?.brand)} size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {method?.brand} •••• {method?.last4}
                      </span>
                      {method?.isDefault && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method?.expiryMonth}/{method?.expiryYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!method?.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultPayment(method?.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Trash2"
                    onClick={() => handleRemovePayment(method?.id)}
                    className="text-error hover:text-error"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-foreground">Billing History</h4>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Download All
            </Button>
          </div>

          <div className="space-y-2">
            {billingHistory?.map((invoice) => (
              <div key={invoice?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{invoice?.description}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(invoice?.status)}`}>
                      {invoice?.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.date)?.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-foreground">
                    ${invoice?.amount?.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download"
                    onClick={() => {}}
                  >
                    Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage & Limits */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Current Usage</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Building2" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Active Projects</p>
                  <p className="text-lg font-semibold text-foreground">24</p>
                  <p className="text-xs text-muted-foreground">Unlimited available</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="Users" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Team Members</p>
                  <p className="text-lg font-semibold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">Unlimited available</p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name="HardDrive" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Storage Used</p>
                  <p className="text-lg font-semibold text-foreground">2.4 GB</p>
                  <p className="text-xs text-muted-foreground">100 GB available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Payment Method Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Add Payment Method</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowAddPayment(false)}
                />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Cardholder Name"
                type="text"
                value={newPaymentMethod?.name}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e?.target?.value})}
                placeholder="John Doe"
                required
              />
              <Input
                label="Card Number"
                type="text"
                value={newPaymentMethod?.cardNumber}
                onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cardNumber: e?.target?.value})}
                placeholder="1234 5678 9012 3456"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Month"
                  options={monthOptions}
                  value={newPaymentMethod?.expiryMonth}
                  onChange={(value) => setNewPaymentMethod({...newPaymentMethod, expiryMonth: value})}
                  placeholder="MM"
                  required
                />
                <Select
                  label="Year"
                  options={yearOptions}
                  value={newPaymentMethod?.expiryYear}
                  onChange={(value) => setNewPaymentMethod({...newPaymentMethod, expiryYear: value})}
                  placeholder="YYYY"
                  required
                />
                <Input
                  label="CVC"
                  type="text"
                  value={newPaymentMethod?.cvc}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cvc: e?.target?.value})}
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddPayment(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddPaymentMethod}
              >
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Change Plan Modal */}
      {showChangePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Choose Your Plan</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowChangePlan(false)}
                />
              </div>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                  <div key={plan?.id} className={`p-6 border rounded-lg relative ${plan?.popular ? 'border-primary' : 'border-border'}`}>
                    {plan?.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-foreground">{plan?.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{plan?.description}</p>
                      <div className="text-3xl font-bold text-foreground">
                        ${plan?.price}
                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan?.features?.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Icon name="Check" size={16} className="text-success" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan?.id === "price_1RsaVkKbuTYpVaZ7hspcAaFo" ? "default" : "outline"}
                      fullWidth
                      disabled={plan?.id === "price_1RsaVkKbuTYpVaZ7hspcAaFo" || loading}
                      onClick={() => plan?.id !== "price_1RsaVkKbuTYpVaZ7hspcAaFo" && handleUpgradePlan(plan.id)}
                    >
                      {loading ? "Processing..." : plan?.id === "price_1RsaVkKbuTYpVaZ7hspcAaFo" ? "Current Plan" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSubscription;