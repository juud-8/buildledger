import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

// Mock auth context for testing
const MockAuthProvider = ({ children, mockUser = null, mockUserProfile = null, loading = false }) => {
  const mockValue = {
    user: mockUser,
    userProfile: mockUserProfile,
    loading,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
    forceClearAuth: vi.fn(),
    updateActivity: vi.fn(),
    extendSession: vi.fn(),
    sessionWarning: false,
    lastActivity: Date.now()
  }

  return (
    <div data-testid="mock-auth-provider">
      {React.cloneElement(children, { authContext: mockValue })}
    </div>
  )
}

// Custom render function that includes providers
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    mockUser = null,
    mockUserProfile = null,
    loading = false,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <MockAuthProvider 
          mockUser={mockUser}
          mockUserProfile={mockUserProfile}
          loading={loading}
        >
          {children}
        </MockAuthProvider>
      </MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing library
export * from '@testing-library/react'

// Mock user objects for testing
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
  created_at: '2023-01-01T00:00:00Z'
}

export const mockUserProfile = {
  id: 'user-123',
  full_name: 'Test User',
  email: 'test@example.com',
  company_id: 'company-123',
  subscription_plan: 'Pro',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockCompany = {
  id: 'company-123',
  name: 'Test Company',
  created_at: '2023-01-01T00:00:00Z'
}

export const mockClient = {
  id: 'client-123',
  name: 'Test Client',
  email: 'client@example.com',
  company_id: 'company-123',
  client_type: 'residential',
  created_at: '2023-01-01T00:00:00Z'
}

export const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'Test project description',
  client_id: 'client-123',
  company_id: 'company-123',
  status: 'active',
  created_at: '2023-01-01T00:00:00Z'
}

export const mockQuote = {
  id: 'quote-123',
  quote_number: 'QT-001',
  client_id: 'client-123',
  company_id: 'company-123',
  total_amount: 1000.00,
  status: 'draft',
  created_at: '2023-01-01T00:00:00Z'
}

export const mockInvoice = {
  id: 'invoice-123',
  invoice_number: 'INV-001',
  client_id: 'client-123',
  company_id: 'company-123',
  total_amount: 1000.00,
  status: 'draft',
  created_at: '2023-01-01T00:00:00Z'
}