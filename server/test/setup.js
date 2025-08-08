import { vi } from 'vitest'

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_key'
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123'
process.env.TWILIO_ACCOUNT_SID = 'ACtest123'
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token'
process.env.TWILIO_WEBHOOK_SECRET = 'twilio_webhook_secret'
process.env.OPENAI_API_KEY = 'sk-test-openai'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'

// Mock fetch globally
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
}

// Mock Winston logger
vi.mock('../utils/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    security: vi.fn()
  }
}))

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  fetch.mockClear()
})