// Environment variable validation and configuration
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // AI Provider Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Development flags
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

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
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Call validation on module load
validateEnvironment();