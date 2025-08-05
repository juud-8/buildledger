import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecuritySettings = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    loginNotifications: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    ipWhitelist: false,
    auditLogging: true
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "MacBook Pro - Chrome",
      location: "Austin, TX",
      ipAddress: "192.168.1.100",
      lastActive: "2024-08-04 11:30 AM",
      current: true
    },
    {
      id: 2,
      device: "iPhone 15 - Safari",
      location: "Austin, TX",
      ipAddress: "192.168.1.101",
      lastActive: "2024-08-04 09:15 AM",
      current: false
    },
    {
      id: 3,
      device: "iPad Pro - Safari",
      location: "Dallas, TX",
      ipAddress: "10.0.0.50",
      lastActive: "2024-08-03 02:45 PM",
      current: false
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      action: "User Login",
      user: "john@buildledger.com",
      timestamp: "2024-08-04 11:30 AM",
      ipAddress: "192.168.1.100",
      status: "success"
    },
    {
      id: 2,
      action: "Invoice Created",
      user: "sarah@buildledger.com",
      timestamp: "2024-08-04 10:15 AM",
      ipAddress: "192.168.1.102",
      status: "success"
    },
    {
      id: 3,
      action: "Failed Login Attempt",
      user: "unknown@domain.com",
      timestamp: "2024-08-04 08:30 AM",
      ipAddress: "203.0.113.1",
      status: "failed"
    },
    {
      id: 4,
      action: "Settings Modified",
      user: "john@buildledger.com",
      timestamp: "2024-08-03 04:20 PM",
      ipAddress: "192.168.1.100",
      status: "success"
    }
  ]);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSecuritySettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTerminateSession = (sessionId) => {
    setSessions(sessions?.filter(session => session?.id !== sessionId));
  };

  const handleChangePassword = () => {
    // Password change logic here
    setShowChangePassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const getStatusBadgeColor = (status) => {
    return status === "success" ?"bg-success text-success-foreground" :"bg-error text-error-foreground";
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account security and access controls
          </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Password & Authentication */}
        <div>
          <h4 className="text-base font-medium text-foreground mb-4">Password & Authentication</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-foreground">Password</h5>
                <p className="text-sm text-muted-foreground">Last changed 45 days ago</p>
              </div>
              <Button
                variant="outline"
                iconName="Key"
                iconPosition="left"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h5 className="text-sm font-medium text-foreground">Two-Factor Authentication</h5>
                <p className="text-sm text-muted-foreground">
                  {securitySettings?.twoFactorEnabled ? "Enabled via authenticator app" : "Not enabled"}
                </p>
              </div>
              <Button
                variant={securitySettings?.twoFactorEnabled ? "outline" : "default"}
                iconName={securitySettings?.twoFactorEnabled ? "Settings" : "Shield"}
                iconPosition="left"
                onClick={() => handleSecuritySettingChange('twoFactorEnabled', !securitySettings?.twoFactorEnabled)}
              >
                {securitySettings?.twoFactorEnabled ? "Configure" : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Security Preferences</h4>
          <div className="space-y-4">
            <Checkbox
              label="Login Notifications"
              description="Receive email notifications for new login attempts"
              checked={securitySettings?.loginNotifications}
              onChange={(e) => handleSecuritySettingChange('loginNotifications', e?.target?.checked)}
            />

            <Checkbox
              label="IP Address Whitelist"
              description="Only allow access from approved IP addresses"
              checked={securitySettings?.ipWhitelist}
              onChange={(e) => handleSecuritySettingChange('ipWhitelist', e?.target?.checked)}
            />

            <Checkbox
              label="Audit Logging"
              description="Keep detailed logs of all account activities"
              checked={securitySettings?.auditLogging}
              onChange={(e) => handleSecuritySettingChange('auditLogging', e?.target?.checked)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Session Timeout (minutes)"
                type="number"
                value={securitySettings?.sessionTimeout}
                onChange={(e) => handleSecuritySettingChange('sessionTimeout', e?.target?.value)}
                description="Auto-logout after inactivity"
              />

              <Input
                label="Password Expiry (days)"
                type="number"
                value={securitySettings?.passwordExpiry}
                onChange={(e) => handleSecuritySettingChange('passwordExpiry', e?.target?.value)}
                description="Force password change interval"
              />
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Active Sessions</h4>
          <div className="space-y-3">
            {sessions?.map((session) => (
              <div key={session?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={session?.device?.includes('iPhone') || session?.device?.includes('iPad') ? "Smartphone" : "Monitor"} size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-medium text-foreground">{session?.device}</h5>
                      {session?.current && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-success text-success-foreground">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{session?.location} • {session?.ipAddress}</p>
                    <p className="text-xs text-muted-foreground">Last active: {session?.lastActive}</p>
                  </div>
                </div>
                {!session?.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="LogOut"
                    onClick={() => handleTerminateSession(session?.id)}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-foreground">Recent Activity</h4>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export Log
            </Button>
          </div>
          <div className="space-y-2">
            {auditLogs?.map((log) => (
              <div key={log?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(log?.status)}`}>
                    {log?.status}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{log?.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log?.user} • {log?.ipAddress} • {log?.timestamp}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="MoreVertical"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Data & Privacy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="Download" size={20} className="text-muted-foreground" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Export Data</h5>
                  <p className="text-xs text-muted-foreground">Download all your account data</p>
                </div>
              </div>
              <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
                Request Export
              </Button>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Icon name="Trash2" size={20} className="text-error" />
                <div>
                  <h5 className="text-sm font-medium text-foreground">Delete Account</h5>
                  <p className="text-xs text-muted-foreground">Permanently delete your account</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" iconName="Trash2" iconPosition="left">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowChangePassword(false)}
                />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e?.target?.value})}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e?.target?.value})}
                description="Must be at least 8 characters with numbers and symbols"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e?.target?.value})}
                required
              />
            </div>
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName="Key"
                iconPosition="left"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;