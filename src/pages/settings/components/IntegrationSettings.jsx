import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const IntegrationSettings = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'stripe',
      name: 'Stripe Connect',
      description: 'Accept payments and manage multi-party transactions',
      icon: 'CreditCard',
      connected: true,
      status: 'active',
      lastSync: '2024-08-04 10:30 AM',
      settings: {
        publishableKey: 'pk_test_***************',
        webhookUrl: 'https://buildledger.com/webhooks/stripe'
      }
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync project milestones and deadlines',
      icon: 'Calendar',
      connected: false,
      status: 'disconnected',
      lastSync: null,
      settings: {}
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Automated email notifications for invoices and updates',
      icon: 'Mail',
      connected: true,
      status: 'active',
      lastSync: '2024-08-04 11:15 AM',
      settings: {
        smtpServer: 'smtp.buildledger.com',
        fromEmail: 'noreply@buildledger.com'
      }
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      description: 'Sync financial data with QuickBooks',
      icon: 'Calculator',
      connected: false,
      status: 'disconnected',
      lastSync: null,
      settings: {}
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Cloud storage for project documents and photos',
      icon: 'Cloud',
      connected: true,
      status: 'active',
      lastSync: '2024-08-04 09:45 AM',
      settings: {
        folderPath: '/BuildLedger Projects'
      }
    }
  ]);

  const [emailSettings, setEmailSettings] = useState({
    invoiceReminders: true,
    paymentConfirmations: true,
    projectUpdates: true,
    weeklyReports: false,
    overdueNotifications: true,
    clientPortalNotifications: true
  });

  const [showConnectionModal, setShowConnectionModal] = useState(null);

  const handleConnect = (integrationId) => {
    setIntegrations(integrations?.map(integration => 
      integration?.id === integrationId 
        ? { ...integration, connected: true, status: 'active', lastSync: new Date()?.toLocaleString() }
        : integration
    ));
    setShowConnectionModal(null);
  };

  const handleDisconnect = (integrationId) => {
    setIntegrations(integrations?.map(integration => 
      integration?.id === integrationId 
        ? { ...integration, connected: false, status: 'disconnected', lastSync: null }
        : integration
    ));
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: "bg-success text-success-foreground",
      disconnected: "bg-muted text-muted-foreground",
      error: "bg-error text-error-foreground"
    };
    return colors?.[status] || "bg-muted text-muted-foreground";
  };

  const handleEmailSettingChange = (setting, value) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="bg-card rounded-lg border border-border construction-shadow-sm">
      <div className="p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Integration Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with third-party services to enhance your workflow
          </p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Available Integrations */}
        <div className="space-y-4">
          {integrations?.map((integration) => (
            <div key={integration?.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={integration?.icon} size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-foreground">{integration?.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(integration?.status)}`}>
                        {integration?.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration?.description}</p>
                    {integration?.lastSync && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sync: {integration?.lastSync}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {integration?.connected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Settings"
                        onClick={() => setShowConnectionModal(integration)}
                      >
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration?.id)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      iconName="Link"
                      iconPosition="left"
                      onClick={() => setShowConnectionModal(integration)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Email Notification Settings */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Email Notification Preferences</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                label="Invoice Reminders"
                description="Send automatic reminders for unpaid invoices"
                checked={emailSettings?.invoiceReminders}
                onChange={(e) => handleEmailSettingChange('invoiceReminders', e?.target?.checked)}
              />

              <Checkbox
                label="Payment Confirmations"
                description="Notify when payments are received"
                checked={emailSettings?.paymentConfirmations}
                onChange={(e) => handleEmailSettingChange('paymentConfirmations', e?.target?.checked)}
              />

              <Checkbox
                label="Project Updates"
                description="Send updates when project status changes"
                checked={emailSettings?.projectUpdates}
                onChange={(e) => handleEmailSettingChange('projectUpdates', e?.target?.checked)}
              />

              <Checkbox
                label="Weekly Reports"
                description="Send weekly business summary reports"
                checked={emailSettings?.weeklyReports}
                onChange={(e) => handleEmailSettingChange('weeklyReports', e?.target?.checked)}
              />

              <Checkbox
                label="Overdue Notifications"
                description="Alert when invoices become overdue"
                checked={emailSettings?.overdueNotifications}
                onChange={(e) => handleEmailSettingChange('overdueNotifications', e?.target?.checked)}
              />

              <Checkbox
                label="Client Portal Notifications"
                description="Notify clients about portal updates"
                checked={emailSettings?.clientPortalNotifications}
                onChange={(e) => handleEmailSettingChange('clientPortalNotifications', e?.target?.checked)}
              />
            </div>
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="border-t border-border pt-6">
          <h4 className="text-base font-medium text-foreground mb-4">Webhook Configuration</h4>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Icon name="Webhook" size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Webhook Endpoints</p>
                <p className="text-xs text-muted-foreground">
                  Configure webhooks for real-time data synchronization
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <span className="text-sm font-mono text-foreground">
                  https://buildledger.com/webhooks/stripe
                </span>
                <Button variant="ghost" size="sm" iconName="Copy">
                  Copy
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border">
                <span className="text-sm font-mono text-foreground">
                  https://buildledger.com/webhooks/calendar
                </span>
                <Button variant="ghost" size="sm" iconName="Copy">
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border construction-shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {showConnectionModal?.connected ? 'Configure' : 'Connect'} {showConnectionModal?.name}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  iconName="X"
                  onClick={() => setShowConnectionModal(null)}
                />
              </div>
            </div>
            <div className="p-6 space-y-4">
              {showConnectionModal?.id === 'stripe' && (
                <>
                  <Input
                    label="Publishable Key"
                    type="text"
                    placeholder="pk_live_..."
                    description="Your Stripe publishable key"
                  />
                  <Input
                    label="Secret Key"
                    type="password"
                    placeholder="sk_live_..."
                    description="Your Stripe secret key"
                  />
                </>
              )}
              {showConnectionModal?.id === 'calendar' && (
                <div className="text-center py-4">
                  <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Google to authorize calendar access
                  </p>
                </div>
              )}
              {showConnectionModal?.id === 'email' && (
                <>
                  <Input
                    label="SMTP Server"
                    type="text"
                    placeholder="smtp.gmail.com"
                    description="Your email server address"
                  />
                  <Input
                    label="Port"
                    type="number"
                    placeholder="587"
                    description="SMTP port number"
                  />
                  <Input
                    label="Username"
                    type="email"
                    placeholder="your-email@domain.com"
                    description="Email account username"
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Your email password"
                    description="Email account password"
                  />
                </>
              )}
            </div>
            <div className="p-6 border-t border-border flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConnectionModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                iconName={showConnectionModal?.connected ? "Save" : "Link"}
                iconPosition="left"
                onClick={() => handleConnect(showConnectionModal?.id)}
              >
                {showConnectionModal?.connected ? 'Save Changes' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;