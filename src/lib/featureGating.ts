/**
 * BuildLedger Feature Gating
 * 
 * This module provides utilities to check feature availability and limits
 * based on the user's subscription plan tier.
 */

import { hasFeature, getFeatureLimit } from './pricing'
import { supabase } from './supabaseClient'

export interface FeatureCheckResult {
  allowed: boolean
  limit?: number
  current?: number
  message?: string
}

/**
 * Check if a user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string, 
  feature: keyof typeof import('./pricing').FEATURE_FLAGS.free
): Promise<FeatureCheckResult> {
  try {
    // Get user's plan tier
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return {
        allowed: false,
        message: 'Unable to verify subscription status'
      }
    }

    const planTier = profile.plan_tier as 'free' | 'pro' | 'business'
    
    // Check if feature is available for this plan
    if (!hasFeature(planTier, feature)) {
      return {
        allowed: false,
        message: `This feature is not available on your current plan. Please upgrade to access ${feature}.`
      }
    }

    // Get the limit for this feature
    const limit = getFeatureLimit(planTier, feature)
    
    // If unlimited (-1), allow access
    if (limit === -1) {
      return { allowed: true }
    }

    // Check current usage
    const current = await getCurrentUsage(userId, feature)
    
    if (current >= limit) {
      return {
        allowed: false,
        limit,
        current,
        message: `You've reached your limit of ${limit} ${feature}. Please upgrade your plan for more.`
      }
    }

    return {
      allowed: true,
      limit,
      current
    }
  } catch (error) {
    console.error('Error checking feature access:', error)
    return {
      allowed: false,
      message: 'Unable to verify feature access'
    }
  }
}

/**
 * Get current usage for a specific feature
 */
async function getCurrentUsage(userId: string, feature: string): Promise<number> {
  try {
    switch (feature) {
      case 'maxClients':
        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
        return clientCount || 0

      case 'maxQuotesPerMonth':
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        
        const { count: quoteCount } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString())
        return quoteCount || 0

      case 'teamMembers':
        // For now, return 0 as team members feature is not implemented
        return 0

      default:
        return 0
    }
  } catch (error) {
    console.error(`Error getting current usage for ${feature}:`, error)
    return 0
  }
}

/**
 * Check if user can create a new client
 */
export async function canCreateClient(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'maxClients')
}

/**
 * Check if user can create a new quote
 */
export async function canCreateQuote(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'maxQuotesPerMonth')
}

/**
 * Check if user can generate PDFs
 */
export async function canGeneratePDF(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'pdfGeneration')
}

/**
 * Check if user can process payments
 */
export async function canProcessPayments(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'paymentProcessing')
}

/**
 * Check if user can access analytics
 */
export async function canAccessAnalytics(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'analytics')
}

/**
 * Check if user can use custom branding
 */
export async function canUseCustomBranding(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'customBranding')
}

/**
 * Check if user can access client portal
 */
export async function canAccessClientPortal(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'clientPortal')
}

/**
 * Check if user can use AI assistant
 */
export async function canUseAIAssistant(userId: string): Promise<FeatureCheckResult> {
  return checkFeatureAccess(userId, 'aiAssistant')
}

/**
 * Get user's current plan tier
 */
export async function getUserPlanTier(userId: string): Promise<'free' | 'pro' | 'business' | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return null
    }

    return profile.plan_tier as 'free' | 'pro' | 'business'
  } catch (error) {
    console.error('Error getting user plan tier:', error)
    return null
  }
}

/**
 * Get upgrade URL for a specific plan
 */
export function getUpgradeUrl(planId: 'pro' | 'business'): string {
  return `/pricing?plan=${planId}`
}

/**
 * Get feature usage summary for dashboard
 */
export async function getFeatureUsageSummary(userId: string) {
  const planTier = await getUserPlanTier(userId)
  if (!planTier) return null

  const features = [
    { key: 'maxClients', label: 'Clients', icon: '👥' },
    { key: 'maxQuotesPerMonth', label: 'Quotes This Month', icon: '📝' },
    { key: 'pdfGeneration', label: 'PDF Generation', icon: '📄' },
    { key: 'paymentProcessing', label: 'Payment Processing', icon: '💳' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
    { key: 'customBranding', label: 'Custom Branding', icon: '🎨' },
    { key: 'clientPortal', label: 'Client Portal', icon: '🌐' },
    { key: 'aiAssistant', label: 'AI Assistant', icon: '🤖' }
  ]

  const usage = await Promise.all(
    features.map(async (feature) => {
      const result = await checkFeatureAccess(userId, feature.key as any)
      return {
        ...feature,
        ...result,
        limit: result.limit === -1 ? 'Unlimited' : result.limit
      }
    })
  )

  return {
    planTier,
    features: usage
  }
} 