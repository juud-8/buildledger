import { describe, it, expect } from 'vitest'
import { 
  hasPermission, 
  isWithinLimit, 
  getUsageLimit, 
  getRolePermissions,
  canPerformAction,
  ROLES, 
  FEATURES,
  LIMITS
} from './rbac'

describe('RBAC Utils', () => {
  describe('hasPermission', () => {
    it('returns false for null/undefined role', () => {
      expect(hasPermission(null, FEATURES.VIEW_PROJECTS)).toBe(false)
      expect(hasPermission(undefined, FEATURES.VIEW_PROJECTS)).toBe(false)
    })

    it('returns false for null/undefined feature', () => {
      expect(hasPermission(ROLES.PRO, null)).toBe(false)
      expect(hasPermission(ROLES.PRO, undefined)).toBe(false)
    })

    it('returns correct permissions for Starter plan', () => {
      expect(hasPermission(ROLES.STARTER, FEATURES.VIEW_PROJECTS)).toBe(true)
      expect(hasPermission(ROLES.STARTER, FEATURES.CREATE_EDIT_PROJECTS)).toBe(false)
      expect(hasPermission(ROLES.STARTER, FEATURES.VIEW_ANALYTICS)).toBe(false)
    })

    it('returns correct permissions for Pro plan', () => {
      expect(hasPermission(ROLES.PRO, FEATURES.VIEW_PROJECTS)).toBe(true)
      expect(hasPermission(ROLES.PRO, FEATURES.CREATE_EDIT_PROJECTS)).toBe(true)
      expect(hasPermission(ROLES.PRO, FEATURES.VIEW_ANALYTICS)).toBe(true)
      expect(hasPermission(ROLES.PRO, FEATURES.ADVANCED_ANALYTICS)).toBe(false)
    })

    it('returns true for all features for Enterprise plan', () => {
      expect(hasPermission(ROLES.ENTERPRISE, FEATURES.VIEW_PROJECTS)).toBe(true)
      expect(hasPermission(ROLES.ENTERPRISE, FEATURES.ADVANCED_ANALYTICS)).toBe(true)
      expect(hasPermission(ROLES.ENTERPRISE, FEATURES.API_ACCESS)).toBe(true)
    })

    it('returns true for all features for Admin role', () => {
      expect(hasPermission(ROLES.ADMIN, FEATURES.ADMIN_PANEL)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, FEATURES.SYSTEM_SETTINGS)).toBe(true)
      expect(hasPermission(ROLES.ADMIN, FEATURES.VIEW_PROJECTS)).toBe(true)
    })
  })

  describe('isWithinLimit', () => {
    it('returns true for null/undefined inputs', () => {
      expect(isWithinLimit(null, 'clients', 5)).toBe(true)
      expect(isWithinLimit(ROLES.STARTER, null, 5)).toBe(true)
    })

    it('returns true when under limit', () => {
      expect(isWithinLimit(ROLES.STARTER, 'clients', 5)).toBe(true)
      expect(isWithinLimit(ROLES.PRO, 'clients', 50)).toBe(true)
    })

    it('returns false when at or over limit', () => {
      expect(isWithinLimit(ROLES.STARTER, 'clients', 10)).toBe(false)
      expect(isWithinLimit(ROLES.STARTER, 'clients', 15)).toBe(false)
    })

    it('returns true for unlimited plans', () => {
      expect(isWithinLimit(ROLES.ENTERPRISE, 'clients', 10000)).toBe(true)
      expect(isWithinLimit(ROLES.ENTERPRISE, 'projects', 1000)).toBe(true)
    })
  })

  describe('getUsageLimit', () => {
    it('returns correct limits for each plan', () => {
      expect(getUsageLimit(ROLES.STARTER, 'clients')).toBe(10)
      expect(getUsageLimit(ROLES.PRO, 'clients')).toBe(100)
      expect(getUsageLimit(ROLES.ENTERPRISE, 'clients')).toBe(Infinity)
    })

    it('returns 0 for unknown role or limit type', () => {
      expect(getUsageLimit('UNKNOWN', 'clients')).toBe(0)
      expect(getUsageLimit(ROLES.STARTER, 'unknown')).toBe(0)
    })
  })

  describe('getRolePermissions', () => {
    it('returns empty array for null/undefined role', () => {
      expect(getRolePermissions(null)).toEqual([])
      expect(getRolePermissions(undefined)).toEqual([])
    })

    it('returns specific permissions for non-full-access roles', () => {
      const starterPermissions = getRolePermissions(ROLES.STARTER)
      expect(starterPermissions).toContain(FEATURES.VIEW_PROJECTS)
      expect(starterPermissions).not.toContain(FEATURES.CREATE_EDIT_PROJECTS)
    })

    it('returns all features for full access roles', () => {
      const enterprisePermissions = getRolePermissions(ROLES.ENTERPRISE)
      const allFeatures = Object.values(FEATURES)
      
      // Should include all features
      allFeatures.forEach(feature => {
        expect(enterprisePermissions).toContain(feature)
      })
    })
  })

  describe('canPerformAction', () => {
    it('denies action when permission is missing', () => {
      const result = canPerformAction(ROLES.STARTER, FEATURES.CREATE_EDIT_PROJECTS)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('insufficient_permissions')
    })

    it('denies action when usage limit is exceeded', () => {
      const result = canPerformAction(
        ROLES.STARTER, 
        FEATURES.CREATE_EDIT_CLIENTS, 
        'clients', 
        10
      )
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('usage_limit_exceeded')
      expect(result.limit).toBe(10)
      expect(result.currentUsage).toBe(10)
    })

    it('allows action when permission exists and within limits', () => {
      const result = canPerformAction(
        ROLES.PRO, 
        FEATURES.CREATE_EDIT_CLIENTS, 
        'clients', 
        50
      )
      expect(result.allowed).toBe(true)
    })

    it('allows action when permission exists and no limit specified', () => {
      const result = canPerformAction(ROLES.PRO, FEATURES.VIEW_ANALYTICS)
      expect(result.allowed).toBe(true)
    })

    it('allows unlimited actions for Enterprise plan', () => {
      const result = canPerformAction(
        ROLES.ENTERPRISE, 
        FEATURES.CREATE_EDIT_CLIENTS, 
        'clients', 
        10000
      )
      expect(result.allowed).toBe(true)
    })
  })

  describe('Plan hierarchy verification', () => {
    it('has correct feature escalation from Starter to Pro', () => {
      // Starter features should be included in Pro
      const starterFeatures = getRolePermissions(ROLES.STARTER)
      
      starterFeatures.forEach(feature => {
        if (feature !== FEATURES.FULL_ACCESS) {
          expect(hasPermission(ROLES.PRO, feature)).toBe(true)
        }
      })
    })

    it('has reasonable usage limits progression', () => {
      expect(LIMITS[ROLES.STARTER].clients).toBeLessThan(LIMITS[ROLES.PRO].clients)
      expect(LIMITS[ROLES.PRO].clients).toBeLessThan(LIMITS[ROLES.ENTERPRISE].clients)
      
      expect(LIMITS[ROLES.STARTER].projects).toBeLessThan(LIMITS[ROLES.PRO].projects)
      expect(LIMITS[ROLES.PRO].projects).toBeLessThan(LIMITS[ROLES.ENTERPRISE].projects)
    })
  })
})