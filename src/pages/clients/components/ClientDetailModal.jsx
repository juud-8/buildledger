import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import ClientMessaging from '../../../components/messaging/ClientMessaging';

const ClientDetailModal = ({ client, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !client) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'projects', label: 'Projects', icon: 'Building2' },
    { id: 'financial', label: 'Financial', icon: 'DollarSign' },
    { id: 'communication', label: 'Communication', icon: 'MessageCircle' },
    { id: 'documents', label: 'Documents', icon: 'FileText' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const mockProjects = [
    {
      id: 1,
      name: "Kitchen Renovation",
      status: "In Progress",
      startDate: "2024-01-15",
      value: 45000,
      completion: 65
    },
    {
      id: 2,
      name: "Bathroom Remodel",
      status: "Completed",
      startDate: "2023-09-10",
      value: 28000,
      completion: 100
    },
    {
      id: 3,
      name: "Deck Construction",
      status: "Planning",
      startDate: "2024-03-01",
      value: 15000,
      completion: 0
    }
  ];

  const mockCommunications = [
    {
      id: 1,
      type: "email",
      subject: "Project Update - Kitchen Renovation",
      date: "2024-01-20",
      status: "sent"
    },
    {
      id: 2,
      type: "call",
      subject: "Discussion about timeline changes",
      date: "2024-01-18",
      duration: "15 min"
    },
    {
      id: 3,
      type: "meeting",
      subject: "Site visit and progress review",
      date: "2024-01-15",
      location: "Client site"
    }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={16} className="text-muted-foreground" />
              <span className="text-sm">{client?.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={16} className="text-muted-foreground" />
              <span className="text-sm">{client?.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="MapPin" size={16} className="text-muted-foreground" />
              <span className="text-sm">{client?.location}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Icon name="Calendar" size={16} className="text-muted-foreground" />
              <span className="text-sm">Client since {formatDate(client?.clientSince)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={16} className="text-muted-foreground" />
              <span className="text-sm">Last contact: {formatDate(client?.lastContact)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Quick Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-foreground">{client?.totalProjects}</div>
            <div className="text-xs text-muted-foreground">Total Projects</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-foreground">{client?.activeProjects}</div>
            <div className="text-xs text-muted-foreground">Active Projects</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-foreground">{formatCurrency(client?.totalValue)}</div>
            <div className="text-xs text-muted-foreground">Total Value</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-success">4.8/5</div>
            <div className="text-xs text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Project History</h4>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
          New Project
        </Button>
      </div>
      
      <div className="space-y-3">
        {mockProjects?.map((project) => (
          <div key={project?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-foreground">{project?.name}</h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project?.status === 'Completed' ? 'bg-success/10 text-success' :
                project?.status === 'In Progress'? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
              }`}>
                {project?.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Started: {formatDate(project?.startDate)}</span>
              <span>{formatCurrency(project?.value)}</span>
            </div>
            {project?.completion > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${project?.completion}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-success/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-success">{formatCurrency(client?.totalValue)}</div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </div>
        <div className="bg-accent/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-accent">{formatCurrency(45000)}</div>
          <div className="text-sm text-muted-foreground">Outstanding</div>
        </div>
        <div className="bg-warning/10 p-4 rounded-lg">
          <div className="text-2xl font-bold text-warning">15 days</div>
          <div className="text-sm text-muted-foreground">Avg Payment Time</div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-4">Payment History</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Invoice #INV-2024-001</div>
              <div className="text-sm text-muted-foreground">Kitchen Renovation - Progress Payment</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground">{formatCurrency(15000)}</div>
              <div className="text-sm text-success">Paid on 01/15/2024</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Invoice #INV-2023-045</div>
              <div className="text-sm text-muted-foreground">Bathroom Remodel - Final Payment</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground">{formatCurrency(8000)}</div>
              <div className="text-sm text-success">Paid on 11/20/2023</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunicationTab = () => (
    <ClientMessaging client={client} onClose={onClose} />
  );

  const renderDocumentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Documents</h4>
        <Button variant="outline" size="sm" iconName="Upload" iconPosition="left">
          Upload Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Icon name="FileText" size={20} className="text-primary" />
            <div>
              <div className="font-medium text-foreground">Contract Agreement</div>
              <div className="text-sm text-muted-foreground">PDF • 2.4 MB</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Uploaded on 01/10/2024</div>
        </div>
        
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Icon name="Image" size={20} className="text-primary" />
            <div>
              <div className="font-medium text-foreground">Site Photos</div>
              <div className="text-sm text-muted-foreground">ZIP • 15.2 MB</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Uploaded on 01/08/2024</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-card border border-border rounded-lg construction-shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="User" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{client?.name}</h2>
              <p className="text-sm text-muted-foreground">{client?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 construction-transition ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'communication' && renderCommunicationTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="default" iconName="Edit" iconPosition="left">
            Edit Client
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;