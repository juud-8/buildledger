import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SESSION_CONFIG } from '../../utils/rbac';

const SessionWarning = () => {
  const { sessionWarning, extendSession, signOut, lastActivity } = useAuth();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!sessionWarning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilLogout = SESSION_CONFIG.IDLE_TIMEOUT - timeSinceActivity;
      
      if (timeUntilLogout <= 0) {
        clearInterval(interval);
        return;
      }
      
      setCountdown(Math.ceil(timeUntilLogout / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionWarning, lastActivity]);

  if (!sessionWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700">
            You will be automatically logged out due to inactivity in:
          </p>
          <div className="mt-2 text-2xl font-bold text-orange-600 text-center">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={extendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Stay Logged In
          </button>
          <button
            onClick={signOut}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Log Out Now
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          Click anywhere or press any key to extend your session
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;