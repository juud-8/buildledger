"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  CreditCard, 
  BarChart2, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react'
import { SubscriptionService } from '@/lib/services/subscription-service'
import { useRouter } from 'next/navigation'

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripe_price_id: string;
  usage_limits: {
    invoices_limit: number;
    storage_limit_mb: number;
    team_members_limit: number;
    api_calls_per_month: number;
  };
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

interface UsageMetric {
  feature: string
  usage_count: number
  limit: number
  last_updated: string
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const router = useRouter()
  const subscriptionService = new SubscriptionService()

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  function isValidSubscription(sub: any): sub is Subscription {
    return sub && 
           typeof sub.id === 'string' && 
           typeof sub.status === 'string' &&
           typeof sub.plan === 'object';
  }

  const loadSubscriptionData = async () => {
    try {
      const sub = await subscriptionService.getCurrentSubscription()
      
      if (!sub || !isValidSubscription(sub)) {
        setSubscription(null)
        setUsageMetrics([])
        const plans = await subscriptionService.getSubscriptionPlans()
        setAvailablePlans(plans)
        return
      }

      // At this point TypeScript knows sub is a valid Subscription
      const [usage, plans] = await Promise.all([
        subscriptionService.getUsageMetrics(sub.id),
        subscriptionService.getSubscriptionPlans()
      ])
      
      setSubscription(sub)
      setUsageMetrics(usage || [])
      setAvailablePlans(plans)
    } catch (error) {
      console.error('Error loading subscription data:', error)
      setSubscription(null)
      setUsageMetrics([])
      setAvailablePlans([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    try {
      const session = await subscriptionService.createCheckoutSession(priceId)
      router.push(session.url)
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  const handleManageBilling = async () => {
    try {
      const session = await subscriptionService.createPortalSession()
      router.push(session.url)
    } catch (error) {
      console.error('Error creating portal session:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'past_due': return 'bg-yellow-500'
      case 'canceled': return 'bg-gray-500'
      default: return 'bg-red-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />
      case 'past_due': return <AlertCircle className="h-4 w-4" />
      case 'canceled': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getUpgradeOptions = () => {
    if (!subscription || !availablePlans.length) return []
    
    const currentPlan = subscription.plan
    return availablePlans
      .filter(plan => 
        plan.interval === currentPlan.interval && 
        plan.price > currentPlan.price
      )
      .sort((a, b) => a.price - b.price)
  }

  const getDowngradeOptions = () => {
    if (!subscription || !availablePlans.length) return []
    
    const currentPlan = subscription.plan
    return availablePlans
      .filter(plan => 
        plan.interval === currentPlan.interval && 
        plan.price < currentPlan.price
      )
      .sort((a, b) => b.price - a.price)
  }

  const checkUsageLimits = (targetPlan: SubscriptionPlan) => {
    if (!usageMetrics.length) return { canDowngrade: true, warnings: [] }

    const warnings: string[] = []
    let canDowngrade = true

    if (targetPlan.usage_limits.invoices_limit !== -1) {
      const invoiceUsage = usageMetrics.find(m => m.feature === 'invoices')
      if (invoiceUsage && invoiceUsage.usage_count > targetPlan.usage_limits.invoices_limit) {
        warnings.push(`You currently have ${invoiceUsage.usage_count} invoices, but the plan only allows ${targetPlan.usage_limits.invoices_limit}`)
        canDowngrade = false
      }
    }

    if (targetPlan.usage_limits.team_members_limit !== -1) {
      const teamUsage = usageMetrics.find(m => m.feature === 'team_members')
      if (teamUsage && teamUsage.usage_count > targetPlan.usage_limits.team_members_limit) {
        warnings.push(`You currently have ${teamUsage.usage_count} team members, but the plan only allows ${targetPlan.usage_limits.team_members_limit}`)
        canDowngrade = false
      }
    }

    return { canDowngrade, warnings }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <CreditCard className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="usage">
              <BarChart2 className="mr-2 h-4 w-4" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Settings className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{subscription.plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${subscription.plan.price}/{subscription.plan.interval}
                    </p>
                  </div>
                  <Badge className={getStatusColor(subscription.status)}>
                    {getStatusIcon(subscription.status)}
                    <span className="ml-1">{subscription.status}</span>
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Current Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                            {new Date(subscription.current_period_end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Plan Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {subscription.plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {subscription.cancel_at_period_end && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Subscription Ending</AlertTitle>
                    <AlertDescription>
                      Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Upgrade/Downgrade Options */}
                <div className="mt-8 space-y-4">
                  {getUpgradeOptions().length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Upgrades</h4>
                      <div className="space-y-2">
                        {getUpgradeOptions().map(plan => (
                          <Card key={plan.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{plan.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  ${plan.price}/{plan.interval}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleUpgrade(plan.stripe_price_id)}
                                className="flex items-center"
                              >
                                <ArrowUpCircle className="mr-2 h-4 w-4" />
                                Upgrade
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {getDowngradeOptions().length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Downgrades</h4>
                      <div className="space-y-2">
                        {getDowngradeOptions().map(plan => {
                          const { canDowngrade, warnings } = checkUsageLimits(plan)
                          return (
                            <Card key={plan.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">{plan.name}</h5>
                                  <p className="text-sm text-muted-foreground">
                                    ${plan.price}/{plan.interval}
                                  </p>
                                  {warnings.length > 0 && (
                                    <div className="mt-2">
                                      {warnings.map((warning, index) => (
                                        <div key={index} className="flex items-center text-sm text-amber-500">
                                          <AlertTriangle className="mr-1 h-4 w-4" />
                                          {warning}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  onClick={() => handleUpgrade(plan.stripe_price_id)}
                                  disabled={!canDowngrade}
                                  variant="outline"
                                  className="flex items-center"
                                >
                                  Downgrade
                                </Button>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No active subscription</p>
                <Button onClick={() => handleUpgrade(availablePlans[0]?.stripe_price_id)}>
                  Get Started
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage">
            <div className="space-y-4">
              {usageMetrics.map((metric) => (
                <Card key={metric.feature}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{metric.feature}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.usage_count} / {metric.limit}</span>
                        <span>{Math.round((metric.usage_count / metric.limit) * 100)}%</span>
                      </div>
                      <Progress value={(metric.usage_count / metric.limit) * 100} />
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(metric.last_updated).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Billing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={handleManageBilling} className="w-full">
                      Manage Billing
                    </Button>
                    {subscription && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleUpgrade(subscription.plan.stripe_price_id)}
                      >
                        Change Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 