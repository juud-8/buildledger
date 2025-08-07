// Environment variable validation and configuration
export const ENV_CONFIG = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // AI Provider Configuration - Production (for users)
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  OPENAI_API_KEY_PROD: import.meta.env.VITE_OPENAI_API_KEY_PROD,
  OPENAI_API_KEY_DEV: import.meta.env.VITE_OPENAI_API_KEY_DEV,
  
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  GEMINI_API_KEY_PROD: import.meta.env.VITE_GEMINI_API_KEY_PROD,
  GEMINI_API_KEY_DEV: import.meta.env.VITE_GEMINI_API_KEY_DEV,
  
  ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
  ANTHROPIC_API_KEY_PROD: import.meta.env.VITE_ANTHROPIC_API_KEY_PROD,
  ANTHROPIC_API_KEY_DEV: import.meta.env.VITE_ANTHROPIC_API_KEY_DEV,
  
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

// Helper function to get the appropriate AI key based on environment
export function getAIKey(service, fallbackToLegacy = true) {
  const useProductionKeys = ENV_CONFIG.USE_PRODUCTION_AI || ENV_CONFIG.IS_PRODUCTION;
  
  let key = null;
  
  if (service === 'openai') {
    key = useProductionKeys 
      ? (ENV_CONFIG.OPENAI_API_KEY_PROD || ENV_CONFIG.OPENAI_API_KEY)
      : (ENV_CONFIG.OPENAI_API_KEY_DEV || ENV_CONFIG.OPENAI_API_KEY);
  } else if (service === 'gemini') {
    key = useProductionKeys
      ? (ENV_CONFIG.GEMINI_API_KEY_PROD || ENV_CONFIG.GEMINI_API_KEY)
      : (ENV_CONFIG.GEMINI_API_KEY_DEV || ENV_CONFIG.GEMINI_API_KEY);
  } else if (service === 'anthropic') {
    key = useProductionKeys
      ? (ENV_CONFIG.ANTHROPIC_API_KEY_PROD || ENV_CONFIG.ANTHROPIC_API_KEY)
      : (ENV_CONFIG.ANTHROPIC_API_KEY_DEV || ENV_CONFIG.ANTHROPIC_API_KEY);
  }
  
  if (!key && fallbackToLegacy) {
    // Fallback to legacy naming for backward compatibility
    key = ENV_CONFIG[`${service.toUpperCase()}_API_KEY`];
  }
  
  return key;
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
  
  // Log AI key configuration for debugging
  if (ENV_CONFIG.DEBUG_MODE) {
    console.log('AI Key Configuration:', {
      environment: ENV_CONFIG.ENVIRONMENT,
      useProductionAI: ENV_CONFIG.USE_PRODUCTION_AI,
      openai: getAIKey('openai') ? 'CONFIGURED' : 'MISSING',
      gemini: getAIKey('gemini') ? 'CONFIGURED' : 'MISSING',
      anthropic: getAIKey('anthropic') ? 'CONFIGURED' : 'MISSING',
    });
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

// Call validation on module load
validateEnvironment();