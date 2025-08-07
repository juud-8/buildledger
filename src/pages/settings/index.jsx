import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import CompanyProfile from './components/CompanyProfile';
import UserManagement from './components/UserManagement';
import TaxSettings from './components/TaxSettings';
import TemplateManagement from './components/TemplateManagement';
import IntegrationSettings from './components/IntegrationSettings';
import SecuritySettings from './components/SecuritySettings';
import BillingSubscription from './components/BillingSubscription';
import BrandingSettings from './components/BrandingSettings';
import OnboardingStep from '../../components/onboarding/OnboardingStep';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Settings = () => {
  const { currentStep } = useOnboarding();
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    if (currentStep === 'companyInfo') {
      setActiveTab('company');
    }
  }, [currentStep]);

  const settingsTabs = [
    {
      id: 'company',
      label: 'Company Profile',
      icon: 'Building2',
      description: 'Business information and branding'
    },
    {
      id: 'branding',
      label: 'Logo & Branding',
      icon: 'Palette',
      description: 'Company logos and brand guidelines'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: 'Users',
      description: 'Team members and permissions'
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      icon: 'CreditCard',
      description: 'Plans and payment methods'
    },
    {
      id: 'tax',
      label: 'Tax Settings',
      icon: 'Calculator',
      description: 'Tax rates and compliance'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: 'FileText',
      description: 'Quote and invoice templates'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: 'Link',
      description: 'Third-party connections'
    },
    {
      id: 'security',
      label: 'Security',
      icon: 'Shield',
      description: 'Account security and privacy'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'company':
        return currentStep === 'companyInfo' ? (
          <OnboardingStep stepKey="companyInfo">
            <CompanyProfile />
          </OnboardingStep>
        ) : (
          <CompanyProfile />
        );
      case 'branding':
        return <BrandingSettings />;
      case 'users':
        return <UserManagement />;
      case 'billing':
        return <BillingSubscription />;
      case 'tax':
        return <TaxSettings />;
      case 'templates':
        return <TemplateManagement />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <CompanyProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-80 bg-card border-r border-border min-h-[calc(100vh-64px)] p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your BuildLedger platform
              </p>
            </div>

            <nav className="space-y-2">
              {settingsTabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left construction-transition ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon 
                    name={tab?.icon} 
                    size={20} 
                    className={activeTab === tab?.id ? 'text-primary-foreground' : 'text-muted-foreground'} 
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      activeTab === tab?.id ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {tab?.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      activeTab === tab?.id ? 'text-primary-foreground opacity-90' : 'text-muted-foreground'
                    }`}>
                      {tab?.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md construction-transition">
                  <Icon name="Download" size={16} />
                  <span>Export Data</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md construction-transition">
                  <Icon name="RefreshCw" size={16} />
                  <span>Sync All</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md construction-transition">
                  <Icon name="HelpCircle" size={16} />
                  <span>Get Help</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;