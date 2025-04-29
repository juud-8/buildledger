"use client";

import type { Subscription } from '@/types/database';

export interface UsageMetric {
  subscription_id: string;
  feature: string;
  usage_count: number;
  last_updated: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
}

export class ClientSubscriptionService {
  async getSubscription(): Promise<Subscription | null> {
    const response = await fetch('/api/subscriptions/status');
    if (!response.ok) {
      if (response.status === 401) return null;
      throw new Error('Failed to fetch subscription');
    }
    return response.json();
  }

  async getUsageMetrics(subscriptionId: string): Promise<UsageMetric[]> {
    const response = await fetch(`/api/subscriptions/${subscriptionId}/usage`);
    if (!response.ok) throw new Error('Failed to fetch usage metrics');
    return response.json();
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await fetch('/api/subscriptions/plans');
    if (!response.ok) throw new Error('Failed to fetch subscription plans');
    return response.json();
  }

  async createPortalSession(): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create portal session');
    return response.json();
  }

  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    return response.json();
  }
}

export const clientSubscriptionService = new ClientSubscriptionService(); 