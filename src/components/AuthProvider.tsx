'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/lib/types'
import { getUserProfile } from '@/lib/profileService'

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  profileLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Function to load user profile
  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      const { profile: userProfile, error } = await getUserProfile(userId)
      if (error) {
        console.error('Error loading profile:', error)
      } else {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Function to refresh profile (for use after updates)
  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null) // Clear profile on sign out
  }

  useEffect(() => {
    // Check current session on load
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user || null
      const userData = sessionUser ? { id: sessionUser.id, email: sessionUser.email! } : null
      setUser(userData)
      
      if (sessionUser?.id) {
        await loadProfile(sessionUser.id)
      }
      
      setLoading(false)
    }

    fetchSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user || null
        const userData = sessionUser ? { id: sessionUser.id, email: sessionUser.email! } : null
        setUser(userData)
        
        if (sessionUser?.id) {
          // Load profile for new user
          await loadProfile(sessionUser.id)
        } else {
          // Clear profile when user signs out
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Cleanup: unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      profileLoading, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)