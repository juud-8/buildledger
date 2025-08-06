import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/rbac';

const RoleSwitcher = () => {
  const { userProfile, updateProfile } = useAuth();

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    try {
      await updateProfile({ role: newRole });
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border p-4 rounded-lg shadow-lg z-50">
      <h4 className="font-bold mb-2">Role Switcher (Dev)</h4>
      <select
        value={userProfile.role}
        onChange={handleRoleChange}
        className="bg-input border border-border rounded-md p-2"
      >
        <option value={ROLES.STARTER}>Starter</option>
        <option value={ROLES.PRO}>Pro</option>
        <option value={ROLES.ENTERPRISE}>Enterprise</option>
      </select>
    </div>
  );
};

export default RoleSwitcher;
