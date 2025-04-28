import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Calendar, CreditCard, RefreshCw } from 'lucide-react'

interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'canceled' | 'payment_failed'
  plan_name: string
  stripe_customer_id: string
  stripe_subscription_id: string
  current_period_end: string
  usage: {
    users: number
    storage: number
    api_calls: number
  }
  limits: {
    max_users: number
    max_storage: number
    max_api_calls: number
  }
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSubscription = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching subscription:', error)
      } else {
        setSubscription(data)
      }
      setLoading(false)
    }

    fetchSubscription()
  }, [])

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) return

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'payment_failed':
        return 'bg-red-100 text-red-800'
      case 'canceled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Loading your subscription information...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Manage your subscription and usage</CardDescription>
          </div>
          <Badge className={getStatusColor(subscription?.status || '')}>
            {subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'No Subscription'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Current Plan</span>
                </div>
                <p className="text-lg font-semibold">{subscription.plan_name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  <span>Renewal Date</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Users</span>
                    <span>{subscription.usage.users} / {subscription.limits.max_users}</span>
                  </div>
                  <Progress value={(subscription.usage.users / subscription.limits.max_users) * 100} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>{subscription.usage.storage}GB / {subscription.limits.max_storage}GB</span>
                  </div>
                  <Progress value={(subscription.usage.storage / subscription.limits.max_storage) * 100} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>{subscription.usage.api_calls} / {subscription.limits.max_api_calls}</span>
                  </div>
                  <Progress value={(subscription.usage.api_calls / subscription.limits.max_api_calls) * 100} className="mt-1" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleManageBilling}
                variant="outline"
                className="flex-1"
              >
                Manage Billing
              </Button>
              {subscription.status !== 'active' && (
                <Button 
                  onClick={handleUpgrade}
                  className="flex-1"
                >
                  Upgrade Plan
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-gray-600">No active subscription</p>
            <Button 
              onClick={handleUpgrade}
              className="w-full"
            >
              Subscribe Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 