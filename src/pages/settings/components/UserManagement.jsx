import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "",
    name: ""
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');

        if (error) {
          throw error;
        }
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roleOptions = [
    { value: "owner", label: "Owner/Manager", description: "Full system access and billing management" },
    { value: "project-manager", label: "Project Manager", description: "Manage projects, quotes, and invoices" },
    { value: "field-supervisor", label: "Field Supervisor", description: "Update project progress and photos" },
    { value: "subcontractor", label: "Subcontractor", description: "Limited access to assigned projects" }
  ];

  const getRoleBadgeColor = (role) => {
    const colors = {
      owner: "bg-primary text-primary-foreground",
      "project-manager": "bg-accent text-accent-foreground",
      "field-supervisor": "bg-warning text-warning-foreground",
      subcontractor: "bg-secondary text-secondary-foreground"
    };
    return colors?.[role] || "bg-muted text-muted-foreground";
  };

  const getStatusBadgeColor = (status) => {
    return status === "active" ?"bg-success text-success-foreground" :"bg-muted text-muted-foreground";
  };

  const handleInviteUser = () => {
    // Add invite logic here
    setShowInviteModal(false);
    setInviteData({ email: "", role: "", name: "" });
  };

  const handleRemoveUser = (userId) => {
    setUsers(users?.filter(user => user?.id !== userId));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(users?.map(user => 
      user?.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team members and their access permissions
            </p>
          </div>
          <Button
            variant="default"
            iconName="UserPlus"
            iconPosition="left"
            onClick={() => setShowInviteModal(true)}
          >
            Invite User
          </Button>
        </div>
      </div>
      <div className="p-6">
        {/* Users List */}
        <div className="space-y-4">
          {users?.map((user) => (
            <div key={user?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-foreground">{user?.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user?.status)}`}>
                      {user?.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="p-6">
        {loading && <p>Loading users...</p>}
        {error && <p className="text-error">{error}</p>}
        {users && !loading && (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={user.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${user.full_name}`}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{user.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Select
                  options={roleOptions}
                  value={user?.role}
                  onChange={(value) => handleRoleChange(user?.id, value)}
                  className="w-48"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="MoreVertical"
                  onClick={() => {}}
                />
                {user?.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName="Trash2"
                    onClick={() => handleRemoveUser(user?.id)}
                    className="text-error hover:text-error"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role Permissions */}
        <div className="mt-8 border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Role Permissions</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roleOptions?.map((role) => (
              <div key={role?.value} className="p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name="Shield" size={16} className="text-muted-foreground" />
                  <h5 className="text-sm font-medium text-foreground">{role?.label}</h5>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{role?.description}</p>
                
                <div className="space-y-2">
                  {role?.value === "owner" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Full system access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Billing management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">User management</span>
                      </div>
                    </>
                  )}
                  {role?.value === "project-manager" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Project management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Quote & invoice creation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="X" size={12} className="text-error" />
                        <span className="text-xs text-muted-foreground">Billing settings</span>
                      </div>
                    </>
                  )}
                  {role?.value === "field-supervisor" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Progress updates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Photo uploads</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="X" size={12} className="text-error" />
                        <span className="text-xs text-muted-foreground">Financial data</span>
                      </div>
                    </>
                  )}
                  {role?.value === "subcontractor" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Icon name="Check" size={12} className="text-success" />
                        <span className="text-xs text-muted-foreground">Assigned projects only</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="X" size={12} className="text-error" />
                        <span className="text-xs text-muted-foreground">Client information</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon name="X" size={12} className="text-error" />
                        <span className="text-xs text-muted-foreground">Financial data</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Invite Team Member</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowInviteModal(false)}
                />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={inviteData?.name}
                onChange={(e) => setInviteData({...inviteData, name: e?.target?.value})}
                placeholder="Enter full name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={inviteData?.email}
                onChange={(e) => setInviteData({...inviteData, email: e?.target?.value})}
                placeholder="Enter email address"
                required
              />
              <Select
                label="Role"
                options={roleOptions}
                value={inviteData?.role}
                onChange={(value) => setInviteData({...inviteData, role: value})}
                placeholder="Select role"
                required
              />
            </div>
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Send"
                iconPosition="left"
                onClick={handleInviteUser}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;