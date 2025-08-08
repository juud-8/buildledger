import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, FEATURES, getEffectiveRoleFromProfile } from '../../utils/rbac';

/**
 * PrivateRoute component that protects routes requiring authentication
 * and optionally checks for specific permissions/features
 */
const PrivateRoute = ({ children, requiredFeature = null, requiredPlan = null, fallbackPath = '/login' }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // User is authenticated but profile hasn't loaded yet
  // If no specific feature is required, allow pass-through to avoid blocking the app
  if (!userProfile) {
    if (!requiredFeature) {
      return children;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Check if user has required feature permission using effective role
  const effectiveRole = getEffectiveRoleFromProfile(userProfile);
  if (requiredFeature && !hasPermission(effectiveRole, requiredFeature)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Not Available</h3>
          <p className="text-gray-600 mb-4">
            This feature requires a {requiredPlan || 'higher'} plan subscription.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Upgrade Your Plan
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected component
  return children;
};

export default PrivateRoute;