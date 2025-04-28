import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { cookies } from "next/headers"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripe_price_id: string
  usage_limits: {
    invoices_limit: number
    storage_limit_mb: number
    team_members_limit: number
    api_calls_per_month: number
  }
}

export const metadata: Metadata = {
  title: "Pricing - BuildLedger",
  description: "Simple, transparent pricing for businesses of all sizes.",
}

async function getPricingPlans() {
  const subscriptionService = new SubscriptionService()
  return await subscriptionService.getSubscriptionPlans()
}

export default async function PricingPage() {
  const plans = await getPricingPlans() as SubscriptionPlan[]
  const monthlyPlans = plans.filter(plan => plan.interval === 'month')
  const yearlyPlans = plans.filter(plan => plan.interval === 'year')

  return (
    <div className="container relative">
      <div className="mx-auto max-w-[58rem] text-center">
        <h1 className="font-heading text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-6 text-xl text-muted-foreground">
          Choose the perfect plan for your business
        </p>
      </div>

      <div className="grid gap-8 mt-16">
        {/* Monthly Plans */}
        <div className="grid gap-8 lg:grid-cols-3">
          {monthlyPlans.map((plan) => (
            <Card key={plan.id} className="relative flex flex-col p-6">
              {plan.name.includes('Professional') && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                  <Badge variant="default" className="text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-heading text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {plan.usage_limits.invoices_limit === -1 
                        ? "Unlimited invoices & quotes" 
                        : `Up to ${plan.usage_limits.invoices_limit.toLocaleString()} invoices & quotes`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {plan.usage_limits.storage_limit_mb === -1 
                        ? "Unlimited storage" 
                        : `${(plan.usage_limits.storage_limit_mb / 1024).toFixed(1)}GB storage`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {plan.usage_limits.team_members_limit === -1 
                        ? "Unlimited team members" 
                        : `${plan.usage_limits.team_members_limit} team member${plan.usage_limits.team_members_limit > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {plan.usage_limits.api_calls_per_month === -1 
                        ? "Unlimited API calls" 
                        : plan.usage_limits.api_calls_per_month === 0 
                          ? "No API access"
                          : `${plan.usage_limits.api_calls_per_month.toLocaleString()} API calls/month`}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="mt-8 w-full" 
                variant={plan.name.includes('Professional') ? "default" : "outline"}
                data-price-id={plan.stripe_price_id}
              >
                {plan.price === 0 ? "Get Started" : "Subscribe"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Annual Plans */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Annual Plans (Save 15%)</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {yearlyPlans.map((plan) => (
              <Card key={plan.id} className="relative flex flex-col p-6">
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center text-sm">
                      <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {plan.usage_limits.invoices_limit === -1 
                          ? "Unlimited invoices & quotes" 
                          : `Up to ${plan.usage_limits.invoices_limit.toLocaleString()} invoices & quotes`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {plan.usage_limits.storage_limit_mb === -1 
                          ? "Unlimited storage" 
                          : `${(plan.usage_limits.storage_limit_mb / 1024).toFixed(1)}GB storage`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {plan.usage_limits.team_members_limit === -1 
                          ? "Unlimited team members" 
                          : `${plan.usage_limits.team_members_limit} team member${plan.usage_limits.team_members_limit > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {plan.usage_limits.api_calls_per_month === -1 
                          ? "Unlimited API calls" 
                          : plan.usage_limits.api_calls_per_month === 0 
                            ? "No API access"
                            : `${plan.usage_limits.api_calls_per_month.toLocaleString()} API calls/month`}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="mt-8 w-full" 
                  variant={plan.name.includes('Professional') ? "default" : "outline"}
                  data-price-id={plan.stripe_price_id}
                >
                  Subscribe Annually
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6 text-left">
              <h3 className="text-lg font-semibold">What's included in the free plan?</h3>
              <p className="mt-2 text-muted-foreground">
                The free plan includes basic features perfect for solo users or small businesses just getting started. You get up to 100 invoices & quotes, basic branding options, and essential analytics.
              </p>
            </Card>
            <Card className="p-6 text-left">
              <h3 className="text-lg font-semibold">Can I upgrade or downgrade at any time?</h3>
              <p className="mt-2 text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes to your plan will take effect at the start of your next billing cycle.
              </p>
            </Card>
            <Card className="p-6 text-left">
              <h3 className="text-lg font-semibold">What happens if I exceed my plan limits?</h3>
              <p className="mt-2 text-muted-foreground">
                We'll notify you when you're approaching your plan limits. You can upgrade to a higher tier at any time to increase your limits and access more features.
              </p>
            </Card>
            <Card className="p-6 text-left">
              <h3 className="text-lg font-semibold">Do you offer custom plans?</h3>
              <p className="mt-2 text-muted-foreground">
                Yes, we offer custom plans for businesses with specific needs. Contact our sales team to discuss your requirements and get a tailored solution.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 