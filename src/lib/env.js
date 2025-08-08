// Environment variable validation and configuration
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // AI services now handled via secure server proxy - no keys exposed to client
  
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Environment flags
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  USE_PRODUCTION_AI: import.meta.env.VITE_USE_PRODUCTION_AI === 'true',
};

// AI keys are no longer exposed to frontend - all AI requests go through secure server proxy
export function getAIKey(service, fallbackToLegacy = true) {
  console.warn('getAIKey() is deprecated - AI services now use secure server proxy');
  return null;
}

// Validation function to check required environment variables
export function validateEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (ENV_CONFIG.IS_PRODUCTION) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // AI services now managed securely via server proxy
  if (ENV_CONFIG.DEBUG_MODE) {
    console.log('Environment Configuration:', {
      environment: ENV_CONFIG.ENVIRONMENT,
      apiBaseUrl: ENV_CONFIG.API_BASE_URL,
      aiProxy: 'Server-side proxy configured'
    });
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Call validation on module load
validateEnvironment();