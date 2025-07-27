'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const features = [
    {
      icon: FileText,
      title: "Professional Invoices",
      description: "Create branded invoices that get paid 3x faster with automated follow-ups and payment reminders."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Track client history, communication, and project status all in one organized dashboard."
    },
    {
      icon: DollarSign,
      title: "Instant Payments",
      description: "Get paid immediately with Stripe integration, ACH transfers, and mobile payment options."
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automate recurring invoices, payment reminders, and client communications to save hours daily."
    }
  ];

  const testimonials = [
    {
      name: "Mike Rodriguez",
      company: "Rodriguez Construction",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "BuildLedger increased our payment speed by 60%. Clients love the professional invoices and easy payment options.",
      rating: 5,
      revenue: "$140K saved in late payments"
    },
    {
      name: "Sarah Chen",
      company: "Elite Renovations",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "The client portal is a game-changer. My customers can see project updates and pay instantly. Worth every penny.",
      rating: 5,
      revenue: "3x faster payments"
    },
    {
      name: "David Thompson",
      company: "Thompson Electrical",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      text: "I went from spending 5 hours/week on invoicing to 30 minutes. The ROI is incredible - paid for itself in week 1.",
      rating: 5,
      revenue: "$2,400 time savings/month"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Contractors Trust Us", icon: Users },
    { number: "$50M+", label: "Invoices Processed", icon: DollarSign },
    { number: "60%", label: "Faster Payments", icon: TrendingUp },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Social Proof Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Trusted by 10,000+ contractors</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                  Get Paid <span className="text-blue-600">3x Faster</span> with Professional Invoicing
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Stop chasing payments. BuildLedger automates your entire billing process, from quotes to payments, 
                  so you can focus on what you do best — building.
                </p>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Free Forever Plan</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">30-Day Guarantee</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Setup in 5 Minutes</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                  <Link href="/signup">
                    Start Free Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                  <Link href="#demo">
                    Watch Demo (2 min)
                  </Link>
                </Button>
              </div>

              {/* Risk Reversal */}
              <p className="text-sm text-slate-500">
                No credit card required • 30-day money-back guarantee • Cancel anytime
              </p>
            </div>

            {/* Hero Image/Demo */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-slate-800">Invoice #2024-001</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Kitchen Renovation</span>
                      <span className="font-semibold">$12,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Method</span>
                      <span className="text-blue-600">Stripe • Instant</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Payment Received ✓
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Paid in 24 hours!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                  <div className="text-slate-600 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Everything You Need to Get Paid Faster
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Stop losing money to late payments and manual processes. Our all-in-one platform handles 
              everything from quotes to payment collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Loved by Contractors Everywhere
            </h2>
            <p className="text-xl text-slate-600">
              Join thousands of contractors who have transformed their business with BuildLedger
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-slate-600 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-700 font-semibold text-sm">ROI Impact:</div>
                    <div className="text-green-600 text-sm">{testimonial.revenue}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade when you're ready. No hidden fees, ever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-slate-200 relative">
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Free</h3>
                  <div className="text-4xl font-bold text-slate-900 mt-2">$0<span className="text-lg text-slate-600">/mo</span></div>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>5 clients & 10 quotes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Manual invoices</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Basic support</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan - Most Popular */}
            <Card className="border-2 border-blue-500 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Pro</h3>
                  <div className="text-4xl font-bold text-blue-600 mt-2">
                    $19<span className="text-lg text-slate-600">/mo</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Just $1 coffee per week</p>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Unlimited clients & quotes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Stripe payments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>PDF generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/signup?plan=pro">Try Pro Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="border-2 border-slate-200 relative">
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Business</h3>
                  <div className="text-4xl font-bold text-slate-900 mt-2">
                    $49<span className="text-lg text-slate-600">/mo</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Real ROI for serious contractors</p>
                </div>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Client portal</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>AI assistant</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>3 team members</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup?plan=business">Start Business</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Link href="/pricing" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View detailed pricing comparison
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Get Paid 3x Faster?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join 10,000+ contractors who trust BuildLedger to handle their invoicing. 
              Start free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/signup">
                  Start Your Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto transition-all hover:scale-105">
                <Link href="/pricing">
                  View All Plans
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