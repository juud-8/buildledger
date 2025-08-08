import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { SESSION_CONFIG } from '../utils/rbac';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionWarning, setSessionWarning] = useState(false)
  
  // Refs for intervals to avoid stale closures
  const activityCheckInterval = useRef(null)
  const sessionRefreshInterval = useRef(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser(session.user);
          // Ensure we fetch profile; set a hard timeout fallback to avoid hanging UI
          const profileFetch = fetchUserProfile(session.user.id);
          const timeout = new Promise((resolve) => setTimeout(resolve, 10000));
          await Promise.race([profileFetch, timeout]);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user) {
          console.log('Setting user state for:', session.user.email);
          setUser(session.user);
          // Ensure profile is fetched on auth changes so RBAC reflects role/plan updates
          // Fetch profile with timeout guard to prevent infinite loading
          try {
            const profileFetch = fetchUserProfile(session.user.id);
            const timeout = new Promise((resolve) => setTimeout(resolve, 10000));
            await Promise.race([profileFetch, timeout]);
          } catch (e) {
            console.error('Error fetching profile after auth change:', e);
          }
        } else {
          console.log('Clearing user state - no session');
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { profile, error } = await authService.getUserProfile(userId);
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Starting sign in process...');
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        console.error('AuthContext: Sign in error:', error);
        // Provide user-friendly error messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before logging in.';
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('AuthContext: Sign in successful, user:', data.user?.id);
      
      // The onAuthStateChange listener will handle setting user state
      // Don't set state here to avoid double calls
      
      return data;
    } catch (error) {
      console.error('AuthContext: Sign in exception:', error);
      throw error;
    }
  };

  const signUp = async (email, password, fullName, companyName) => {
    const { data, error } = await authService.signUp(email, password, fullName, companyName);
    if (error) throw error;
    
    // Check if email confirmation is required
    if (data?.user && !data?.session) {
      console.log('Registration successful! Please check your email to confirm your account.');
      // Don't try to auto sign-in since email confirmation is required
      return { ...data, requiresEmailConfirmation: true };
    }
    
    return data;
  };

  const signOut = async () => {
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      
      // Clear localStorage
      localStorage.clear();
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Force clear all auth data (for development/testing)
  const forceClearAuth = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any cached data
      setUser(null);
      setUserProfile(null);
      
      // Clear localStorage (in case there's any cached data)
      localStorage.clear();
      
      console.log('All authentication data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    
    const { profile, error } = await authService.updateUserProfile(user.id, updates);
    if (error) throw error;
    
    setUserProfile(profile);
    return profile;
  };

  // Session management functions
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setSessionWarning(false);
  }, []);

  // Check for session expiry and idle timeout
  const checkSessionHealth = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivity;

    // Check for idle timeout
    if (timeSinceActivity > SESSION_CONFIG.IDLE_TIMEOUT) {
      console.log('Session expired due to inactivity');
      await signOut();
      return;
    }

    // Show warning before idle timeout
    if (timeSinceActivity > SESSION_CONFIG.IDLE_TIMEOUT - SESSION_CONFIG.LOGOUT_WARNING_TIME && !sessionWarning) {
      setSessionWarning(true);
      console.log('Session warning: user will be logged out due to inactivity');
    }

    // Refresh session if needed
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error checking session:', error);
        return;
      }

      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const timeUntilExpiry = expiresAt.getTime() - now;

        // Refresh if within buffer time
        if (timeUntilExpiry < SESSION_CONFIG.REFRESH_BUFFER) {
          console.log('Refreshing session token');
          await supabase.auth.refreshSession();
        }
      }
    } catch (error) {
      console.error('Error during session health check:', error);
    }
  }, [user, lastActivity, sessionWarning, signOut]);

  // Set up activity tracking
  useEffect(() => {
    if (!user) return;

    // Track user activity
    const handleActivity = () => updateActivity();
    
    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up periodic session health checks
    activityCheckInterval.current = setInterval(
      checkSessionHealth,
      SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL
    );

    return () => {
      // Cleanup activity listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clear intervals
      if (activityCheckInterval.current) {
        clearInterval(activityCheckInterval.current);
      }
    };
  }, [user, updateActivity, checkSessionHealth]);

  // Extend session when user dismisses warning
  const extendSession = useCallback(() => {
    updateActivity();
    setSessionWarning(false);
  }, [updateActivity]);

  const value = {
    user,
    userProfile,
    loading,
    lastActivity,
    sessionWarning,
    signIn,
    signUp,
    signOut,
    updateProfile,
    forceClearAuth,
    updateActivity,
    extendSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}