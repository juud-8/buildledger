import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, mockUser, mockUserProfile } from '../../test/utils'
import PrivateRoute from './PrivateRoute'
import { FEATURES } from '../../utils/rbac'

describe('PrivateRoute', () => {
  it('shows loading state when auth is loading', () => {
    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      { loading: true }
    )

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>
    )

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading when user is authenticated but profile is not loaded', () => {
    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      { mockUser }
    )

    expect(screen.getByText('Loading your profile...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders protected content when user is authenticated and has access', () => {
    renderWithProviders(
      <PrivateRoute>
        <div>Protected Content</div>
      </PrivateRoute>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Pro' } 
      }
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows feature not available when user lacks required feature', () => {
    renderWithProviders(
      <PrivateRoute requiredFeature={FEATURES.ADVANCED_ANALYTICS} requiredPlan="Enterprise">
        <div>Advanced Analytics</div>
      </PrivateRoute>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Starter' } 
      }
    )

    expect(screen.getByText('Feature Not Available')).toBeInTheDocument()
    expect(screen.getByText(/This feature requires a Enterprise plan/)).toBeInTheDocument()
    expect(screen.getByText('Upgrade Your Plan')).toBeInTheDocument()
    expect(screen.queryByText('Advanced Analytics')).not.toBeInTheDocument()
  })

  it('allows access for users with sufficient plan', () => {
    renderWithProviders(
      <PrivateRoute requiredFeature={FEATURES.VIEW_ANALYTICS} requiredPlan="Pro">
        <div>Analytics Dashboard</div>
      </PrivateRoute>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Pro' } 
      }
    )

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  })

  it('allows access for Enterprise users to all features', () => {
    renderWithProviders(
      <PrivateRoute requiredFeature={FEATURES.ADVANCED_ANALYTICS} requiredPlan="Enterprise">
        <div>Advanced Features</div>
      </PrivateRoute>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Enterprise' } 
      }
    )

    expect(screen.getByText('Advanced Features')).toBeInTheDocument()
  })
})