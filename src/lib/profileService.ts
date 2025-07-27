import { supabase } from './supabaseClient'
import { Profile, PlanFeatures, ApiResponse } from './types'

/**
 * Profile Management Service
 * Handles user profile operations including logo upload/management
 * 
 * This service provides comprehensive profile management with:
 * - User profile CRUD operations
 * - Logo upload/management with validation
 * - Subscription plan management
 * - Error handling and validation
 * - Performance optimization with caching
 */

export interface ProfileUpdateData {
  name?: string
  company_name?: string
  plan_tier?: 'free' | 'pro' | 'business'
}

export interface LogoUploadResult {
  success: boolean
  url?: string
  error?: string
  filename?: string
}

export interface ProfileValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Profile cache for performance optimization
 */
const profileCache = new Map<string, { profile: Profile; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Clear profile cache for a specific user
 */
const clearProfileCache = (userId: string) => {
  profileCache.delete(userId)
}

/**
 * Get cached profile if available and not expired
 */
const getCachedProfile = (userId: string): Profile | null => {
  const cached = profileCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.profile
  }
  return null
}

/**
 * Cache profile data
 */
const cacheProfile = (userId: string, profile: Profile) => {
  profileCache.set(userId, { profile, timestamp: Date.now() })
}

/**
 * Validate profile data
 */
export const validateProfile = (profile: Partial<Profile>): ProfileValidationResult => {
  const errors: string[] = []

  // Validate name
  if (profile.name !== undefined && profile.name.trim().length > 100) {
    errors.push('Name must be less than 100 characters')
  }

  // Validate company name
  if (profile.company_name !== undefined && profile.company_name.trim().length > 100) {
    errors.push('Company name must be less than 100 characters')
  }

  // Validate plan tier
  if (profile.plan_tier !== undefined && !['free', 'pro', 'business'].includes(profile.plan_tier)) {
    errors.push('Invalid plan tier')
  }

  // Validate logo URL format
  if (profile.logo_url !== undefined && profile.logo_url) {
    try {
      new URL(profile.logo_url)
    } catch {
      errors.push('Invalid logo URL format')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get current user's profile with caching
 * @param userId - The user ID
 * @param forceRefresh - Force refresh from database
 * @returns Profile data with error handling
 */
export async function getUserProfile(
  userId: string, 
  forceRefresh: boolean = false
): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = getCachedProfile(userId)
      if (cached) {
        return { profile: cached, error: null }
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error)
      return { profile: null, error: error.message }
    }

    const profile = data || null
    
    // Cache the result
    if (profile) {
      cacheProfile(userId, profile)
    }

    return { profile, error: null }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return { profile: null, error: 'Failed to fetch profile' }
  }
}

/**
 * Update user profile with validation
 * @param userId - The user ID
 * @param updates - Profile updates
 * @returns Update result with error handling
 */
export async function updateUserProfile(
  userId: string, 
  updates: ProfileUpdateData
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Validate update data
    const validation = validateProfile(updates)
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Validation failed: ${validation.errors.join(', ')}` 
      }
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    )

    if (Object.keys(cleanUpdates).length === 0) {
      return { success: false, error: 'No valid updates provided' }
    }

    const { error } = await supabase
      .from('profiles')
      .update(cleanUpdates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    // Clear cache to force refresh
    clearProfileCache(userId)

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

/**
 * Upload logo to Supabase Storage with comprehensive validation
 * @param userId - The user ID
 * @param file - The file to upload
 * @param filename - Optional custom filename
 * @returns Upload result with error handling
 */
export async function uploadLogo(
  userId: string, 
  file: File, 
  filename?: string
): Promise<LogoUploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or SVG image.' 
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'File too large. Please upload an image smaller than 5MB.' 
      }
    }

    // Validate filename
    if (filename && !/^[a-zA-Z0-9._-]+$/.test(filename)) {
      return {
        success: false,
        error: 'Invalid filename. Use only letters, numbers, dots, underscores, and hyphens.'
      }
    }

    // Generate filename if not provided
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const finalFilename = filename || `logo.${fileExtension}`
    const filePath = `${userId}/${finalFilename}`

    // Delete existing logo first
    await deleteLogo(userId)

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing files
      })

    if (uploadError) {
      console.error('Error uploading logo:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to get logo URL' }
    }

    // Update profile with logo URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ logo_url: urlData.publicUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile with logo URL:', updateError)
      // Clean up uploaded file
      await supabase.storage.from('logos').remove([filePath])
      return { success: false, error: 'Logo uploaded but failed to update profile' }
    }

    // Clear cache
    clearProfileCache(userId)

    return { 
      success: true, 
      url: urlData.publicUrl,
      filename: finalFilename
    }
  } catch (error) {
    console.error('Unexpected error uploading logo:', error)
    return { success: false, error: 'Failed to upload logo' }
  }
}

/**
 * Delete logo from storage and update profile
 * @param userId - The user ID
 * @returns Delete result with error handling
 */
export async function deleteLogo(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get current profile to find logo URL
    const { profile, error: profileError } = await getUserProfile(userId)
    
    if (profileError || !profile?.logo_url) {
      return { success: false, error: 'No logo found to delete' }
    }

    // Extract file path from URL
    const url = new URL(profile.logo_url)
    const pathParts = url.pathname.split('/logos/')
    if (pathParts.length < 2) {
      return { success: false, error: 'Invalid logo URL format' }
    }
    
    const filePath = pathParts[1]

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('logos')
      .remove([filePath])

    if (deleteError) {
      console.error('Error deleting logo from storage:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Update profile to remove logo URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ logo_url: null })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile after logo deletion:', updateError)
      return { success: false, error: 'Logo deleted but failed to update profile' }
    }

    // Clear cache
    clearProfileCache(userId)

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error deleting logo:', error)
    return { success: false, error: 'Failed to delete logo' }
  }
}

/**
 * Get logo URL with error handling and caching
 * @param userId - The user ID
 * @param filename - The filename (default: 'logo')
 * @returns Logo URL or null if not found
 */
export async function getLogoUrl(userId: string, filename: string = 'logo'): Promise<string | null> {
  try {
    // Use the database function for better error handling
    const { data, error } = await supabase
      .rpc('get_logo_url', { 
        user_id: userId, 
        filename: filename 
      })

    if (error) {
      console.error('Error getting logo URL:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error getting logo URL:', error)
    return null
  }
}

/**
 * Check if user has a valid subscription plan
 * @param planTier - The plan tier to validate
 * @returns True if valid plan tier
 */
export function hasValidPlan(planTier: string): boolean {
  return ['free', 'pro', 'business'].includes(planTier)
}

/**
 * Get plan features based on tier
 * @param planTier - The plan tier
 * @returns Plan features object
 */
export function getPlanFeatures(planTier: 'free' | 'pro' | 'business'): PlanFeatures {
  const features: Record<string, PlanFeatures> = {
    free: {
      max_clients: 5,
      max_invoices_per_month: 10,
      max_quotes_per_month: 10,
      custom_branding: false,
      priority_support: false,
      advanced_analytics: false
    },
    pro: {
      max_clients: 50,
      max_invoices_per_month: 100,
      max_quotes_per_month: 100,
      custom_branding: true,
      priority_support: true,
      advanced_analytics: false
    },
    business: {
      max_clients: -1, // unlimited
      max_invoices_per_month: -1, // unlimited
      max_quotes_per_month: -1, // unlimited
      custom_branding: true,
      priority_support: true,
      advanced_analytics: true
    }
  }

  return features[planTier] || features.free
}

/**
 * Check if user can perform an action based on their plan
 * @param planTier - The user's plan tier
 * @param action - The action to check
 * @param currentCount - Current count of the resource
 * @returns True if action is allowed
 */
export function canPerformAction(
  planTier: 'free' | 'pro' | 'business',
  action: 'create_client' | 'create_invoice' | 'create_quote' | 'upload_logo',
  currentCount: number = 0
): boolean {
  const features = getPlanFeatures(planTier)

  switch (action) {
    case 'create_client':
      return features.max_clients === -1 || currentCount < features.max_clients
    case 'create_invoice':
      return features.max_invoices_per_month === -1 || currentCount < features.max_invoices_per_month
    case 'create_quote':
      return features.max_quotes_per_month === -1 || currentCount < features.max_quotes_per_month
    case 'upload_logo':
      return features.custom_branding
    default:
      return false
  }
}

/**
 * Create initial profile for new user (called by trigger)
 * @param userId - The user ID
 * @param userData - User data from auth
 * @returns Creation result with error handling
 */
export async function createUserProfile(
  userId: string, 
  userData: { name?: string; email?: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Validate user data
    if (!userId) {
      return { success: false, error: 'User ID is required' }
    }

    const profileData = {
      id: userId,
      name: userData.name || userData.email || 'User',
      plan_tier: 'free' as const
    }

    // Validate profile data
    const validation = validateProfile(profileData)
    if (!validation.valid) {
      return { 
        success: false, 
        error: `Validation failed: ${validation.errors.join(', ')}` 
      }
    }

    const { error } = await supabase
      .from('profiles')
      .insert(profileData)

    if (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }

    // Cache the new profile
    cacheProfile(userId, profileData as Profile)

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return { success: false, error: 'Failed to create profile' }
  }
}

/**
 * Get user statistics for dashboard
 * @param userId - The user ID
 * @returns User statistics
 */
export async function getUserStats(userId: string): Promise<ApiResponse<{
  totalClients: number
  totalInvoices: number
  totalQuotes: number
  totalRevenue: number
  overdueInvoices: number
}>> {
  try {
    // Get counts from database
    const [clientsResult, invoicesResult, quotesResult] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('invoices').select('id, total, status, due_date', { count: 'exact' }).eq('user_id', userId),
      supabase.from('quotes').select('id', { count: 'exact' }).eq('user_id', userId)
    ])

    if (clientsResult.error) throw clientsResult.error
    if (invoicesResult.error) throw invoicesResult.error
    if (quotesResult.error) throw quotesResult.error

    // Calculate statistics
    const totalRevenue = (invoicesResult.data || [])
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0)

    const overdueInvoices = (invoicesResult.data || [])
      .filter(invoice => {
        if (invoice.status === 'paid' || !invoice.due_date) return false
        const dueDate = new Date(invoice.due_date)
        const today = new Date()
        return dueDate < today
      }).length

    return {
      success: true,
      data: {
        totalClients: clientsResult.count || 0,
        totalInvoices: invoicesResult.count || 0,
        totalQuotes: quotesResult.count || 0,
        totalRevenue,
        overdueInvoices
      }
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user statistics'
    }
  }
}

/**
 * Clear all profile caches (useful for testing or maintenance)
 */
export function clearAllProfileCaches(): void {
  profileCache.clear()
} 