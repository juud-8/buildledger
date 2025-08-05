import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ClearAuthButton = () => {
  const { forceClearAuth, user } = useAuth();

  const handleClearAuth = async () => {
    await forceClearAuth();
    // Reload the page to ensure clean state
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleClearAuth}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Clear Auth Data
        {user && <span className="ml-2">({user.email})</span>}
      </button>
    </div>
  );
};

export default ClearAuthButton; 