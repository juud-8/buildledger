import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { projectsService } from '../../services/projectsService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProjectOverview from './components/ProjectOverview';
import ProjectTimeline from './components/ProjectTimeline';
import ProjectPhotos from './components/ProjectPhotos';
import ProjectDocuments from './components/ProjectDocuments';
import ProjectFinancials from './components/ProjectFinancials';
import QuickActions from './components/QuickActions';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, FEATURES } from '../../utils/rbac';

const ProjectDetails = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const data = await projectsService.getProject(id);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      // Use mock data as fallback for demo
      setProject(getMockProject());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock project data fallback
  const getMockProject = () => ({
    id: 'PRJ-001',
    name: 'Modern Kitchen Renovation',
    description: 'Complete kitchen renovation including new cabinets, countertops, appliances, and flooring for a contemporary family home.',
    status: 'In Progress',
    priority: 'High',
    progress: 65,
    budget: 125000,
    spent: 81500,
    startDate: '01/15/2025',
    endDate: '03/30/2025',
    location: '1234 Oak Street, Springfield, IL 62701',
    daysRemaining: 45,
    daysActive: 20,
    teamSize: 8,
    completedTasks: 24,
    pendingTasks: 12,
    client: {
      name: 'Sarah & Michael Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      address: '1234 Oak Street, Springfield, IL 62701'
    },
    recentActivity: [
      {
        type: 'milestone',
        description: 'Cabinet installation completed ahead of schedule',
        user: 'Mike Johnson',
        timestamp: '2 hours ago'
      },
      {
        type: 'update',
        description: 'Electrical rough-in inspection passed successfully',
        user: 'Tom Wilson',
        timestamp: '5 hours ago'
      },
      {
        type: 'issue',
        description: 'Delayed delivery of granite countertops - new ETA 01/28',
        user: 'Sarah Davis',
        timestamp: '1 day ago'
      },
      {
        type: 'update',
        description: 'Plumbing rough-in work completed',
        user: 'John Smith',
        timestamp: '2 days ago'
      }
    ],
    timeline: [
      {
        title: 'Project Kickoff',
        description: 'Initial project meeting and site preparation',
        type: 'milestone',
        status: 'completed',
        dueDate: '01/15/2025',
        assignee: 'Mike Johnson',
        duration: '1 day',
        progress: 100,
        dependencies: 'None',
        notes: 'All permits obtained and site access confirmed'
      },
      {
        title: 'Demolition Phase',
        description: 'Remove existing kitchen fixtures and prepare space',
        type: 'milestone',
        status: 'completed',
        dueDate: '01/18/2025',
        assignee: 'Tom Wilson',
        duration: '3 days',
        progress: 100,
        dependencies: 'Project Kickoff',
        notes: 'Completed without issues, minimal structural changes needed'
      },
      {
        title: 'Electrical Rough-in',
        description: 'Install electrical wiring and outlets',
        type: 'milestone',
        status: 'completed',
        dueDate: '01/22/2025',
        assignee: 'Dave Miller',
        duration: '2 days',
        progress: 100,
        dependencies: 'Demolition Phase'
      },
      {
        title: 'Plumbing Installation',
        description: 'Install new plumbing lines and connections',
        type: 'milestone',
        status: 'in progress',
        dueDate: '01/25/2025',
        assignee: 'John Smith',
        duration: '3 days',
        progress: 75,
        dependencies: 'Electrical Rough-in'
      },
      {
        title: 'Electrical Inspection',
        description: 'City electrical inspection',
        type: 'inspection',
        status: 'pending',
        dueDate: '01/26/2025',
        assignee: 'City Inspector',
        duration: '1 day',
        progress: 0,
        dependencies: 'Electrical Rough-in'
      },
      {
        title: 'Drywall Installation',
        description: 'Install and finish drywall',
        type: 'milestone',
        status: 'pending',
        dueDate: '02/01/2025',
        assignee: 'Bob Anderson',
        duration: '4 days',
        progress: 0,
        dependencies: 'Plumbing Installation, Electrical Inspection'
      }
    ],
    weatherDelays: [
      {
        reason: 'Heavy rain prevented exterior work',
        date: '01/20/2025',
        duration: '2 days',
        cost: 1200
      }
    ],
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
        title: 'Before - Original Kitchen',
        description: 'Original kitchen layout before renovation',
        phase: 'before',
        date: '01/15/2025',
        uploadedBy: 'Mike Johnson',
        annotations: [
          { text: 'Note outdated cabinets', author: 'Sarah Johnson', date: '01/15/2025' }
        ]
      },
      {
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=500',
        title: 'Demolition Progress',
        description: 'Kitchen after demolition phase',
        phase: 'during',
        date: '01/18/2025',
        uploadedBy: 'Tom Wilson'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
        title: 'Electrical Rough-in',
        description: 'New electrical wiring installation',
        phase: 'during',
        date: '01/22/2025',
        uploadedBy: 'Dave Miller'
      },
      {
        url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=500',
        title: 'Plumbing Progress',
        description: 'New plumbing lines installed',
        phase: 'during',
        date: '01/24/2025',
        uploadedBy: 'John Smith'
      }
    ],
    documents: [
      {
        name: 'Construction Contract',
        description: 'Main construction agreement with client',
        category: 'contracts',
        fileType: 'pdf',
        size: 2048000,
        status: 'signed',
        createdDate: '01/10/2025',
        uploadedBy: 'Mike Johnson',
        version: '1.2',
        signatures: [
          { signer: 'Sarah Johnson', status: 'signed', signedDate: '01/12/2025' },
          { signer: 'Michael Johnson', status: 'signed', signedDate: '01/12/2025' },
          { signer: 'BuildLedger Inc.', status: 'signed', signedDate: '01/13/2025' }
        ]
      },
      {
        name: 'Building Permit',
        description: 'City building permit for kitchen renovation',
        category: 'permits',
        fileType: 'pdf',
        size: 1024000,
        status: 'approved',
        createdDate: '01/05/2025',
        uploadedBy: 'Sarah Davis'
      },
      {
        name: 'Electrical Permit',
        description: 'Electrical work permit',
        category: 'permits',
        fileType: 'pdf',
        size: 512000,
        status: 'approved',
        createdDate: '01/08/2025',
        uploadedBy: 'Dave Miller'
      },
      {
        name: 'Material Invoice - Cabinets',
        description: 'Invoice for kitchen cabinet purchase',
        category: 'invoices',
        fileType: 'pdf',
        size: 256000,
        status: 'paid',
        createdDate: '01/20/2025',
        uploadedBy: 'Mike Johnson'
      },
      {
        name: 'Appliance Warranties',
        description: 'Warranty documents for new appliances',
        category: 'warranties',
        fileType: 'pdf',
        size: 1536000,
        status: 'active',
        createdDate: '01/22/2025',
        uploadedBy: 'Sarah Davis'
      }
    ],
    paymentSchedule: [
      {
        description: 'Initial Deposit',
        amount: 25000,
        dueDate: '01/10/2025',
        status: 'paid'
      },
      {
        description: 'Demolition & Rough-in',
        amount: 35000,
        dueDate: '01/25/2025',
        status: 'paid'
      },
      {
        description: 'Material & Installation',
        amount: 45000,
        dueDate: '02/15/2025',
        status: 'pending'
      },
      {
        description: 'Final Payment',
        amount: 20000,
        dueDate: '03/30/2025',
        status: 'pending'
      }
    ]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'timeline', label: 'Timeline', icon: 'Calendar' },
    { id: 'photos', label: 'Photos', icon: 'Camera' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'financials', label: 'Financials', icon: 'DollarSign' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectOverview project={project} />;
      case 'timeline':
        return <ProjectTimeline project={project} />;
      case 'photos':
        return <ProjectPhotos project={project} />;
      case 'documents':
        return <ProjectDocuments project={project} />;
      case 'financials':
        return <ProjectFinancials project={project} />;
      default:
        return <ProjectOverview project={project} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Main Content */}
          <div className="flex-1 lg:mr-80">
            <div className="p-4 lg:p-6">
              {/* Project Header */}
              <div className="bg-card border border-border rounded-xl p-6 mb-6 construction-card-3d construction-depth-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{project?.name}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Project ID: {project?.id}</span>
                      <span>•</span>
                      <span>Client: {project?.client?.name}</span>
                      <span>•</span>
                      <span>{project?.progress}% Complete</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" iconName="Share" iconPosition="left">
                      Share
                    </Button>
                    <Button variant="outline" iconName="Download" iconPosition="left">
                      Export
                    </Button>
                    {hasPermission(userProfile?.role, FEATURES.CREATE_EDIT_PROJECTS) && (
                      <Button variant="default" iconName="Edit" iconPosition="left">
                        Edit Project
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-card border border-border rounded-xl mb-6 construction-card-3d construction-depth-3">
                <div className="flex overflow-x-auto">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap construction-transition border-b-2 ${
                        activeTab === tab?.id
                          ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="lg:fixed lg:right-0 lg:top-16 lg:w-80 lg:h-screen lg:overflow-y-auto lg:border-l lg:border-border lg:bg-background">
            <div className="p-4 lg:p-6">
              <QuickActions project={project} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;