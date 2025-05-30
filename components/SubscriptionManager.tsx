"use client"; // This directive must be at the top - do not remove

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { clientSubscriptionService, type UsageMetric, type SubscriptionPlan } from '@/lib/services/client/subscription-service';
import type { Subscription } from '@/types/database';

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      setIsLoading(true);
      try {
        const sub = await clientSubscriptionService.getSubscription();
        setSubscription(sub);
        
        if (sub && sub.stripe_subscription_id) {
          const metrics = await clientSubscriptionService.getUsageMetrics(sub.stripe_subscription_id);
          setUsageMetrics(metrics);
        }

        const plans = await clientSubscriptionService.getSubscriptionPlans();
        setSubscriptionPlans(plans);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'past_due':
        return 'text-yellow-500';
      case 'canceled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleManageBilling = async () => {
    try {
      const { url } = await clientSubscriptionService.createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading subscription details...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">No active subscription found.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Subscription Status
              {getStatusIcon(subscription.status)}
            </CardTitle>
            <CardDescription>
              Your current subscription plan and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Plan</div>
                <div className="text-2xl font-bold">{subscription.plan_name}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className={`text-lg font-semibold ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Current Period Ends</div>
                <div className="text-lg">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              </div>
              <Button onClick={handleManageBilling}>
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
            <CardDescription>
              Track your current usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {usageMetrics.map((metric) => (
                <div key={metric.feature} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{metric.feature}</span>
                    <span>{metric.usage_count} used</span>
                  </div>
                  <Progress value={(metric.usage_count / 100) * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageBilling}>
              Open Billing Portal
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 