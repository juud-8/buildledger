import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, getEffectiveRoleFromProfile } from '../../utils/rbac';

/**
 * FeatureGuard component that conditionally renders content based on user permissions
 * Use this for individual features/buttons within pages rather than entire routes
 */
const FeatureGuard = ({ 
  feature, 
  requiredPlan = null,
  children, 
  fallback = null, 
  showUpgradePrompt = false 
}) => {
  const { userProfile } = useAuth();

  // If no user profile, don't show the feature
  if (!userProfile) {
    return fallback;
  }

  // Determine effective role and check permission
  const effectiveRole = getEffectiveRoleFromProfile(userProfile);
  const hasAccess = hasPermission(effectiveRole, feature);

  if (!hasAccess) {
    if (showUpgradePrompt) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Upgrade Required
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                This feature requires a {requiredPlan || 'higher'} plan subscription.
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => window.location.href = '/pricing'}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  // User has access - render the children
  return children;
};

/**
 * Hook version of FeatureGuard for use in components
 */
export const useFeatureAccess = (feature) => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return false;
  }
  
  return hasPermission(userProfile.subscription_plan, feature);
};

/**
 * Higher-order component version for wrapping entire components
 */
export const withFeatureGuard = (feature, fallbackComponent = null) => {
  return (WrappedComponent) => {
    return (props) => {
      const { userProfile } = useAuth();
      
      if (!userProfile || !hasPermission(userProfile.subscription_plan, feature)) {
        return fallbackComponent || <div>Access denied</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};

export default FeatureGuard;