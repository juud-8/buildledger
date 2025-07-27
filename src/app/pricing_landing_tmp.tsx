'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  X, 
  Star,
  Shield,
  Zap,
  Crown,
  ArrowRight,
  Users,
  DollarSign,
  FileText,
  Bot
} from 'lucide-react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      annualPrice: 0,
      icon: FileText,
      color: 'slate',
      popular: false,
      features: {
        'Clients & Quotes': '5 clients, 10 quotes',
        'Invoices': 'Manual only',
        'PDF Generation': false,
        'Payment Processing': false,
        'Client Portal': false,
        'Analytics': 'Basic',
        'Branding': false,
        'Team Members': false,
        'API Access': false,
        'Priority Support': false,
        'AI Assistant': false
      },
      cta: 'Start Free',
      href: '/signup'
    },
    {
      name: 'Pro',
      description: 'Best value for growing contractors',
      monthlyPrice: 19,
      annualPrice: 17.10, // 10% discount
      icon: Zap,
      color: 'blue',
      popular: true,
      features: {
        'Clients & Quotes': 'Unlimited',
        'Invoices': 'Stripe Payments',
        'PDF Generation': 'Basic PDFs',
        'Payment Processing': 'Stripe only',
        'Client Portal': false,
        'Analytics': 'Basic',
        'Branding': 'Logo & colors',
        'Team Members': false,
        'API Access': false,
        'Priority Support': true,
        'AI Assistant': false
      },
      cta: 'Try Pro Free',
      href: '/signup?plan=pro',
      savings: 'Just $1 coffee per week'
    },
    {
      name: 'Business',
      description: 'Complete solution for serious contractors',
      monthlyPrice: 49,
      annualPrice: 44.10, // 10% discount
      icon: Crown,
      color: 'purple',
      popular: false,
      features: {
        'Clients & Quotes': 'Unlimited',
        'Invoices': 'Stripe + ACH',
        'PDF Generation': 'Branded PDFs + Email',
        'Payment Processing': 'All methods',
        'Client Portal': 'Full portal',
        'Analytics': 'Revenue insights, AI tips',
        'Branding': 'Full branding + domain',
        'Team Members': '3 users',
        'API Access': true,
        'Priority Support': true,
        'AI Assistant': 'Advanced AI help'
      },
      cta: 'Start Business',
      href: '/signup?plan=business',
      savings: 'Real ROI for $49/mo'
    }
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately and we'll prorate any billing differences."
    },
    {
      question: "Is there really a 30-day money-back guarantee?",
      answer: "Absolutely. If you're not completely satisfied within 30 days, we'll refund your entire payment, no questions asked."
    },
    {
      question: "Do you charge transaction fees?",
      answer: "No! We don't charge any transaction fees. You only pay Stripe's standard processing fees (2.9% + 30¢) when your clients pay you."
    },
    {
      question: "How secure is my data?",
      answer: "Your data is encrypted in transit and at rest using bank-level security. We're SOC 2 compliant and regularly audited for security."
    },
    {
      question: "Can I use my own branding?",
      answer: "Pro plans include logo and color customization. Business plans get full branding control including custom domains and email templates."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards through Stripe. Business plans also support ACH transfers for lower fees on larger payments."
    }
  ];

  const testimonials = [
    {
      name: "Jennifer Walsh",
      company: "Walsh Contracting",
      plan: "Business",
      text: "The Business plan paid for itself in the first week. The client portal alone saves me 10 hours monthly.",
      savings: "$2,400 saved monthly"
    },
    {
      name: "Carlos Martinez",
      company: "Martinez Roofing",
      plan: "Pro",
      text: "Pro plan is perfect for my 2-person team. Professional invoices helped us increase our rates by 15%.",
      savings: "15% rate increase"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Choose the plan that fits your business. Start free, upgrade when ready. 
                All plans include our 30-day money-back guarantee.
              </p>
            </div>

            {/* Annual Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className={`font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual
              </span>
              <Badge className="bg-green-100 text-green-700 ml-2">
                Save 10%
              </Badge>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span>10,000+ contractors trust us</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5 average rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const originalPrice = plan.monthlyPrice;
              
              return (
                <Card
                  key={index}
                  className={`relative border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    plan.popular
                      ? 'border-blue-500 shadow-lg scale-105'
                      : 'border-slate-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1 font-semibold">
                        Most Popular - Save $456/year
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex w-12 h-12 items-center justify-center rounded-xl mb-4 ${
                      plan.color === 'blue' ? 'bg-blue-100' :
                      plan.color === 'purple' ? 'bg-purple-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.color === 'blue' ? 'text-blue-600' :
                        plan.color === 'purple' ? 'text-purple-600' : 'text-slate-600'
                      }`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-600">{plan.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-4xl font-bold text-slate-900">
                          ${price}
                        </span>
                        <span className="text-slate-600">/month</span>
                      </div>
                      
                      {isAnnual && originalPrice > 0 && (
                        <div className="text-sm text-slate-500">
                          <span className="line-through">${originalPrice}/mo</span>
                          <span className="text-green-600 font-medium ml-2">
                            Save ${((originalPrice - price) * 12).toFixed(0)}/year
                          </span>
                        </div>
                      )}
                      
                      {plan.savings && (
                        <p className="text-sm text-slate-500">{plan.savings}</p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(plan.features).map(([feature, value]) => (
                        <div key={feature} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {value === false ? (
                              <X className="w-5 h-5 text-slate-400" />
                            ) : (
                              <Check className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-slate-900">
                              {feature}
                            </span>
                            {typeof value === 'string' && (
                              <div className="text-sm text-slate-600 mt-1">
                                {value}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      asChild 
                      className={`w-full h-12 ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-slate-900 hover:bg-slate-800'
                      } transition-all hover:scale-105`}
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    
                    <p className="text-xs text-slate-500 text-center">
                      {plan.monthlyPrice === 0 ? 'Free forever' : 'Cancel anytime • 30-day guarantee'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Compare All Features
            </h2>
            <p className="text-xl text-slate-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Features</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Free</th>
                    <th className="text-center py-4 px-6 font-semibold text-blue-600 bg-blue-50">Pro</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.keys(plans[0].features).map((feature) => (
                    <tr key={feature} className="hover:bg-slate-50">
                      <td className="py-4 px-6 font-medium text-slate-900">{feature}</td>
                      {plans.map((plan, index) => (
                        <td key={index} className="py-4 px-6 text-center">
                          {plan.features[feature] === false ? (
                            <X className="w-5 h-5 text-slate-400 mx-auto" />
                          ) : plan.features[feature] === true ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-sm text-slate-600">
                              {plan.features[feature]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Real Results from Real Contractors
            </h2>
            <p className="text-xl text-slate-600">
              See how the right plan transformed their business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-medium">
                      {testimonial.plan} Plan
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-slate-700 text-lg leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-slate-600 text-sm">{testimonial.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{testimonial.savings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Start with our free plan today. Upgrade when you're ready to scale. 
              30-day money-back guarantee on all paid plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/signup?plan=pro">
                  Try Pro Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}