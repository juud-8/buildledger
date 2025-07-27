import { supabase } from './supabaseClient'
import { Profile } from './types'

/**
 * Profile Management Service
 * Handles user profile operations including logo upload/management
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
}

/**
 * Get current user's profile
 */
export async function getUserProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error)
      return { profile: null, error: error.message }
    }

    return { profile: data || null, error: null }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return { profile: null, error: 'Failed to fetch profile' }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string, 
  updates: ProfileUpdateData
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

/**
 * Upload logo to Supabase Storage
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

    // Generate filename if not provided
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const finalFilename = filename || `logo.${fileExtension}`
    const filePath = `${userId}/${finalFilename}`

    // Upload file to storage
    const { data, error: uploadError } = await supabase.storage
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
      return { success: false, error: 'Logo uploaded but failed to update profile' }
    }

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Unexpected error uploading logo:', error)
    return { success: false, error: 'Failed to upload logo' }
  }
}

/**
 * Delete logo from storage and update profile
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

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error deleting logo:', error)
    return { success: false, error: 'Failed to delete logo' }
  }
}

/**
 * Get logo URL with error handling
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
 */
export function hasValidPlan(planTier: string): boolean {
  return ['free', 'pro', 'business'].includes(planTier)
}

/**
 * Get plan features based on tier
 */
export function getPlanFeatures(planTier: 'free' | 'pro' | 'business') {
  const features = {
    free: {
      maxClients: 5,
      maxInvoicesPerMonth: 10,
      maxQuotesPerMonth: 10,
      logoUpload: false,
      emailSupport: false,
      customBranding: false
    },
    pro: {
      maxClients: 50,
      maxInvoicesPerMonth: 100,
      maxQuotesPerMonth: 100,
      logoUpload: true,
      emailSupport: true,
      customBranding: true
    },
    business: {
      maxClients: -1, // unlimited
      maxInvoicesPerMonth: -1, // unlimited
      maxQuotesPerMonth: -1, // unlimited
      logoUpload: true,
      emailSupport: true,
      customBranding: true
    }
  }

  return features[planTier] || features.free
}

/**
 * Create initial profile for new user (called by trigger)
 */
export async function createUserProfile(
  userId: string, 
  userData: { name?: string; email?: string }
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: userData.name || userData.email || '',
        plan_tier: 'free'
      })

    if (error) {
      console.error('Error creating profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return { success: false, error: 'Failed to create profile' }
  }
} 