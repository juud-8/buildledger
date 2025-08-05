import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up with email and password
  async signUp(email, password, fullName, companyName) {
    try {
      console.log('Starting signUp process...');
      
      // Add timeout to prevent hanging (increased to 60 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 60000)
      );
      
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      });

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }

      console.log('User created successfully:', data.user?.id);
      console.log('User profile will be created automatically via database trigger');

      // If we get here, registration was successful
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      
      // Provide more specific error messages
      if (error.message === 'Request timeout') {
        throw new Error('Registration timed out. Please check your internet connection and try again.');
      } else if (error.message?.includes('upstream connect error')) {
        throw new Error('Connection error. Please try again in a moment.');
      } else {
        throw error;
      }
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        throw error;
      }

      console.log('Sign in successful for user:', data.user?.id);
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { user: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return { profile: null, error };
      }

      return { profile, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { profile: null, error };
    }
  },

  // Check if user profile exists (for debugging trigger)
  async checkUserProfileExists(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, company_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('User profile not found:', error.message);
        return { exists: false, profile: null, error };
      }

      console.log('User profile found:', data);
      return { exists: true, profile: data, error: null };
    } catch (error) {
      console.error('Error checking user profile:', error);
      return { exists: false, profile: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { profile: null, error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}; 