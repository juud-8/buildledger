'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Zap, 
  Shield, 
  Check, 
  Star,
  ArrowRight,
  Clock,
  TrendingUp,
  Award,
  Bot,
  CreditCard,
  Smartphone,
  Mail,
  BarChart3,
  Settings,
  Globe,
  UserCheck,
  MessageSquare,
  Calendar,
  Palette,
  Lock
} from 'lucide-react';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: FileText,
      title: "Professional Invoicing",
      description: "Create stunning, branded invoices that get paid 3x faster with automated follow-ups and payment reminders.",
      benefits: [
        "Custom branding with your logo and colors",
        "Automated payment reminders",
        "Professional PDF generation",
        "Multiple invoice templates"
      ],
      plans: ["Pro", "Business"]
    },
    {
      icon: Users,
      title: "Smart Client Management",
      description: "Keep track of all your clients, their project history, and communication in one organized dashboard.",
      benefits: [
        "Unlimited client storage",
        "Project history tracking",
        "Contact management",
        "Communication logs"
      ],
      plans: ["Free", "Pro", "Business"]
    },
    {
      icon: DollarSign,
      title: "Instant Payment Processing",
      description: "Get paid immediately with Stripe integration, ACH transfers, and mobile payment options.",
      benefits: [
        "Stripe payment integration",
        "ACH bank transfers",
        "Mobile payment options",
        "Instant payment notifications"
      ],
      plans: ["Pro", "Business"]
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automate recurring invoices, payment reminders, and client communications to save hours daily.",
      benefits: [
        "Recurring invoice automation",
        "Payment reminder sequences",
        "Automated follow-ups",
        "Workflow automation"
      ],
      plans: ["Pro", "Business"]
    }
  ];

  const advancedFeatures = [
    {
      icon: MessageSquare,
      title: "Client Portal",
      description: "Give your clients a branded portal to view invoices, make payments, and track project progress.",
      plans: ["Business"]
    },
    {
      icon: Bot,
      title: "AI Assistant", 
      description: "Get smart insights like 'Fix this quote' and 'Summarize revenue' to grow your business faster.",
      plans: ["Business"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track revenue trends, payment patterns, and business growth with detailed insights.",
      plans: ["Business"]
    },
    {
      icon: UserCheck,
      title: "Team Management",
      description: "Add up to 3 team members with role-based access and collaboration features.",
      plans: ["Business"]
    },
    {
      icon: Globe,
      title: "Custom Domain",
      description: "Use your own domain for client portals and create a fully branded experience.",
      plans: ["Business"]
    },
    {
      icon: Settings,
      title: "API Access",
      description: "Connect BuildLedger with your existing tools using our powerful REST API.",
      plans: ["Business"]
    }
  ];

  const integrations = [
    {
      name: "Stripe",
      description: "Accept credit cards and bank transfers",
      icon: CreditCard
    },
    {
      name: "Email",
      description: "Automated email notifications and reminders",
      icon: Mail
    },
    {
      name: "Mobile",
      description: "Mobile-responsive interface for on-the-go access",
      icon: Smartphone
    },
    {
      name: "Calendar",
      description: "Schedule follow-ups and payment reminders",
      icon: Calendar
    }
  ];

  const securityFeatures = [
    "256-bit SSL encryption",
    "SOC 2 Type II compliance",
    "Regular security audits",
    "GDPR compliance",
    "Daily encrypted backups",
    "Two-factor authentication"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                Complete Feature Overview
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Everything You Need to
                <span className="text-blue-600 block">Get Paid Faster</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                BuildLedger combines professional invoicing, client management, and payment processing 
                into one powerful platform built specifically for contractors.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Core Features
            </h2>
            <p className="text-xl text-slate-600">
              The essential tools every contractor needs to run their business efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {feature.plans.map((plan) => (
                          <Badge 
                            key={plan} 
                            variant="outline" 
                            className={`text-xs ${
                              plan === 'Free' ? 'border-slate-300 text-slate-600' :
                              plan === 'Pro' ? 'border-blue-300 text-blue-600' : 
                              'border-purple-300 text-purple-600'
                            }`}
                          >
                            {plan}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-slate-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Advanced Business Features
            </h2>
            <p className="text-xl text-slate-600">
              Powerful tools for scaling contractors who want to grow their business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          Business
                        </Badge>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Built-in Integrations
            </h2>
            <p className="text-xl text-slate-600">
              Connect with the tools you already use
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
                      <Icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{integration.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Bank-Level Security
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Your data and your clients' information are protected with enterprise-grade security
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-slate-800 rounded-lg p-4">
                  <Lock className="w-5 h-5 text-green-400" />
                  <span className="text-slate-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-400">99.9%</div>
                  <div className="text-slate-300">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">SOC 2</div>
                  <div className="text-slate-300">Compliance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">24/7</div>
                  <div className="text-slate-300">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join 10,000+ contractors who have streamlined their invoicing and increased their profits with BuildLedger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/signup">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/pricing">
                  View Pricing Plans
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-blue-100 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>5-minute setup</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>30-day guarantee</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>No contracts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}