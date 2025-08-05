import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
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
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
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
      const { data, error } = await authService.signIn(email, password);
      if (error) {
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
      return data;
    } catch (error) {
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
    const { error } = await authService.signOut();
    if (error) throw error;
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

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    forceClearAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}