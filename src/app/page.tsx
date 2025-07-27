'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SplashScreen } from '@/components/SplashScreen'
import { Hero } from '@/components/public/landing/Hero'
import { Features } from '@/components/public/landing/Features'
import { HowItWorks } from '@/components/public/landing/HowItWorks'
import { Testimonials } from '@/components/public/landing/Testimonials'

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(true)
  
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
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
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
        
        <Hero />
        <HowItWorks />
        <Features />
        
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
        
        <Testimonials />
        
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