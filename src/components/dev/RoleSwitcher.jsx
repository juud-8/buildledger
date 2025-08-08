import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RoleSwitcher = () => {
  const { userProfile, updateProfile } = useAuth();

  if (!userProfile) return null;

  // Only show for true admins
  const normalizedRole = String(userProfile.role || '').toLowerCase();
  const isAdmin = ['admin', 'super_admin'].includes(normalizedRole);
  if (!isAdmin) return null;

  const currentPlan = String(userProfile.subscription_plan || '').toLowerCase();
  const currentRole = String(userProfile.role || 'member');

  const handlePlanChange = async (e) => {
    const newPlan = e.target.value; // 'starter' | 'professional' | 'enterprise'
    try {
      await updateProfile({ subscription_plan: newPlan });
    } catch (error) {
      console.error('Failed to switch plan:', error);
    }
  };

  const handleSystemRoleChange = async (e) => {
    const newRole = e.target.value; // 'member' | 'super_admin'
    try {
      await updateProfile({ role: newRole });
    } catch (error) {
      console.error('Failed to switch system role:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border p-4 rounded-lg shadow-lg z-50 space-y-3">
      <h4 className="font-bold">Dev Switchers</h4>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">Subscription Plan</label>
        <select
          value={currentPlan || 'starter'}
          onChange={handlePlanChange}
          className="bg-input border border-border rounded-md p-2 w-48"
        >
          <option value="starter">Starter</option>
          <option value="professional">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">System Role</label>
        <select
          value={currentRole}
          onChange={handleSystemRoleChange}
          className="bg-input border border-border rounded-md p-2 w-48"
        >
          <option value="member">Member</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
    </div>
  );
};

export default RoleSwitcher;
