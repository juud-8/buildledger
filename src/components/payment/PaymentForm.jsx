import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '../../services/stripeService';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: 'var(--color-foreground)',
      '::placeholder': {
        color: 'var(--color-muted-foreground)',
      },
    },
    invalid: {
      color: 'var(--color-error)',
      iconColor: 'var(--color-error)',
    },
  },
};

const PaymentForm = ({ 
  amount, 
  invoiceId, 
  customerId, 
  onSuccess, 
  onError, 
  onCancel,
  description = 'Payment for invoice'
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setLoading(false);
        return;
      }

      // Process payment
      const result = await stripeService.processInvoicePayment(
        invoiceId,
        paymentMethod.id
      );

      if (result.success) {
        setSucceeded(true);
        onSuccess && onSuccess(result);
      } else {
        setError('Payment failed. Please try again.');
        onError && onError(result);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during payment.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">Your payment has been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Payment Details</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">{description}</span>
            <span className="text-lg font-semibold text-foreground">
              {formatAmount(amount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Card Information
            </label>
            <div className="border border-border rounded-md p-3 bg-background">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-md p-3">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={16} className="text-error mr-2" />
                <span className="text-sm text-error">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ${formatAmount(amount)}`
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Icon name="Shield" size={14} className="mr-1" />
            Secure payment powered by Stripe
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm; 