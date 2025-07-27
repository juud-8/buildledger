'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Shield, 
  Zap,
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Play,
  Quote
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SplashScreen } from '@/components/SplashScreen'
import { fadeInUp, staggerContainer, staggerItem, floatAnimation } from '@/lib/animations'

// Feature card component
function FeatureCard({ icon: Icon, title, description, delay = 0 }: any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

// Testimonial component
function TestimonialCard({ quote, author, role, company, delay = 0 }: any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
    >
      <Quote className="w-8 h-8 text-blue-600/20 mb-4" />
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{role} at {company}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true)
  const [heroRef, heroInView] = useInView({ triggerOnce: true })
  
  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">BuildLedger</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
                <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</Link>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                <Button href="/signup" size="sm">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="md:hidden">
                <Button href="/signup" size="sm">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              {/* Trust badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Trusted by 10,000+ contractors nationwide
              </motion.div>
              
              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              >
                Get Paid Faster.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Build Smarter.
                </span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                The all-in-one financial command center for contractors. Create quotes in seconds, 
                send professional invoices, and get paid 3x faster with automated payment reminders.
              </motion.p>
              
              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Button href="/signup" size="xl" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Start Free Trial
                </Button>
                <Button variant="secondary" size="xl" icon={<Play className="w-5 h-5" />}>
                  Watch Demo (2 min)
                </Button>
              </motion.div>
              
              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 text-sm text-gray-600"
              >
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2">4.9/5 from 2,847 reviews</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Bank-level security</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Hero image/demo */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl opacity-75">Dashboard Preview</p>
                  </div>
                </div>
                
                {/* Floating UI elements */}
                <motion.div
                  {...floatAnimation}
                  className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Payment Received: $5,420</span>
                  </div>
                </motion.div>
                
                <motion.div
                  {...floatAnimation}
                  transition={{ delay: 0.5, duration: 3 }}
                  className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Invoice Sent Successfully</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                Everything you need to run your business
              </motion.h2>
              <motion.p
                variants={staggerItem}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Stop juggling spreadsheets and paper invoices. BuildLedger gives you professional tools that save 10+ hours per week.
              </motion.p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={FileText}
                title="Smart Quotes"
                description="Create professional quotes in under 60 seconds. Convert to invoices with one click."
                delay={0.1}
              />
              <FeatureCard
                icon={DollarSign}
                title="Instant Payments"
                description="Accept credit cards, ACH, and bank transfers. Get paid 3x faster with automated reminders."
                delay={0.2}
              />
              <FeatureCard
                icon={Users}
                title="Client Portal"
                description="Give clients a professional portal to view quotes, pay invoices, and message you directly."
                delay={0.3}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Revenue Analytics"
                description="Track your growth with real-time dashboards. Know your most profitable clients and services."
                delay={0.4}
              />
              <FeatureCard
                icon={Zap}
                title="AI Assistant"
                description="Get smart suggestions to improve quotes, follow up on overdue invoices, and grow revenue."
                delay={0.5}
              />
              <FeatureCard
                icon={Shield}
                title="Bank-Level Security"
                description="Your data is encrypted and backed up daily. SOC 2 compliant with 99.9% uptime."
                delay={0.6}
              />
            </div>
          </div>
        </section>
        
        {/* ROI Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
              <h2 className="text-4xl font-bold mb-4">
                The average contractor saves $2,400/month with BuildLedger
              </h2>
              <p className="text-xl mb-8 opacity-90">
                That's 10+ hours saved per week, 85% faster payments, and zero paperwork headaches.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-5xl font-bold mb-2">3x</div>
                  <div className="text-lg opacity-90">Faster payments</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">85%</div>
                  <div className="text-lg opacity-90">Less time on admin</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">$2.4k</div>
                  <div className="text-lg opacity-90">Saved per month</div>
                </div>
              </div>
              <Button href="/signup" size="xl" variant="secondary">
                Calculate Your ROI <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Contractors love BuildLedger
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of contractors who've transformed their business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="BuildLedger transformed how I run my business. I'm getting paid 3 weeks faster and spending 80% less time on paperwork."
                author="Mike Rodriguez"
                role="Owner"
                company="Rodriguez Construction"
                delay={0.1}
              />
              <TestimonialCard
                quote="The client portal is a game-changer. My clients love being able to pay online and track project progress in real-time."
                author="Sarah Chen"
                role="General Contractor"
                company="Chen & Associates"
                delay={0.2}
              />
              <TestimonialCard
                quote="I've tried 5 different invoicing tools. BuildLedger is the only one built specifically for contractors like me."
                author="James Thompson"
                role="Electrical Contractor"
                company="Thompson Electric"
                delay={0.3}
              />
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to get paid faster?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join 10,000+ contractors who trust BuildLedger. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/signup" size="xl" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                Start 14-Day Free Trial
              </Button>
              <Button variant="ghost" size="xl" href="/pricing">
                View Pricing
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-600" />
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-white p-2 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold">BuildLedger</span>
                </div>
                <p className="text-gray-400">
                  Financial command center for modern contractors.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; 2024 BuildLedger. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}