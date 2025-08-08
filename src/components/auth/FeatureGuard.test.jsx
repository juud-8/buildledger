import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, mockUser, mockUserProfile } from '../../test/utils'
import FeatureGuard, { useFeatureAccess } from './FeatureGuard'
import { FEATURES } from '../../utils/rbac'

// Test component that uses the hook
const TestComponent = ({ feature }) => {
  const hasAccess = useFeatureAccess(feature)
  return <div>{hasAccess ? 'Has Access' : 'No Access'}</div>
}

describe('FeatureGuard', () => {
  it('hides content when user has no profile', () => {
    renderWithProviders(
      <FeatureGuard feature={FEATURES.VIEW_ANALYTICS}>
        <div>Analytics Content</div>
      </FeatureGuard>,
      { mockUser }
    )

    expect(screen.queryByText('Analytics Content')).not.toBeInTheDocument()
  })

  it('hides content when user lacks required feature', () => {
    renderWithProviders(
      <FeatureGuard feature={FEATURES.ADVANCED_ANALYTICS}>
        <div>Advanced Analytics</div>
      </FeatureGuard>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Starter' } 
      }
    )

    expect(screen.queryByText('Advanced Analytics')).not.toBeInTheDocument()
  })

  it('shows content when user has required feature', () => {
    renderWithProviders(
      <FeatureGuard feature={FEATURES.VIEW_ANALYTICS}>
        <div>Analytics Content</div>
      </FeatureGuard>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Pro' } 
      }
    )

    expect(screen.getByText('Analytics Content')).toBeInTheDocument()
  })

  it('shows fallback content when access is denied', () => {
    renderWithProviders(
      <FeatureGuard 
        feature={FEATURES.ADVANCED_ANALYTICS}
        fallback={<div>Upgrade Required</div>}
      >
        <div>Advanced Analytics</div>
      </FeatureGuard>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Starter' } 
      }
    )

    expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
    expect(screen.queryByText('Advanced Analytics')).not.toBeInTheDocument()
  })

  it('shows upgrade prompt when showUpgradePrompt is true', () => {
    renderWithProviders(
      <FeatureGuard 
        feature={FEATURES.ADVANCED_ANALYTICS}
        requiredPlan="Enterprise"
        showUpgradePrompt={true}
      >
        <div>Advanced Analytics</div>
      </FeatureGuard>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Pro' } 
      }
    )

    expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
    expect(screen.getByText(/This feature requires a Enterprise plan/)).toBeInTheDocument()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('allows Enterprise users access to all features', () => {
    renderWithProviders(
      <FeatureGuard feature={FEATURES.ADVANCED_ANALYTICS}>
        <div>Advanced Analytics</div>
      </FeatureGuard>,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Enterprise' } 
      }
    )

    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
  })
})

describe('useFeatureAccess hook', () => {
  it('returns false when user has no profile', () => {
    renderWithProviders(
      <TestComponent feature={FEATURES.VIEW_ANALYTICS} />,
      { mockUser }
    )

    expect(screen.getByText('No Access')).toBeInTheDocument()
  })

  it('returns false when user lacks feature', () => {
    renderWithProviders(
      <TestComponent feature={FEATURES.ADVANCED_ANALYTICS} />,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Starter' } 
      }
    )

    expect(screen.getByText('No Access')).toBeInTheDocument()
  })

  it('returns true when user has feature', () => {
    renderWithProviders(
      <TestComponent feature={FEATURES.VIEW_ANALYTICS} />,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Pro' } 
      }
    )

    expect(screen.getByText('Has Access')).toBeInTheDocument()
  })

  it('returns true for Enterprise users on all features', () => {
    renderWithProviders(
      <TestComponent feature={FEATURES.ADVANCED_ANALYTICS} />,
      { 
        mockUser, 
        mockUserProfile: { ...mockUserProfile, subscription_plan: 'Enterprise' } 
      }
    )

    expect(screen.getByText('Has Access')).toBeInTheDocument()
  })
})