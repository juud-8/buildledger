import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProjectFilters from './components/ProjectFilters';
import ProjectToolbar from './components/ProjectToolbar';
import ProjectGrid from './components/ProjectGrid';
import CreateProjectModal from './components/CreateProjectModal';
import OnboardingStep from '../../components/onboarding/OnboardingStep';

import Button from '../../components/ui/Button';
import { useOnboarding } from '../../contexts/OnboardingContext';

const Projects = () => {
  const navigate = useNavigate();
  const { currentStep, completeStep } = useOnboarding();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    dateRange: {
      from: '',
      to: ''
    },
    projectTypes: []
  });

  // Mock project data
  const mockProjects = [
    {
      id: 'proj-001',
      name: 'Modern Family Home Construction',
      client: 'Johnson Family',
      status: 'active',
      progress: 65,
      budget: 450000,
      actualCost: 298000,
      startDate: '2024-01-15',
      endDate: '2024-08-30',
      type: 'residential',
      nextMilestone: {
        name: 'Electrical Installation',
        dueDate: '2024-08-15'
      }
    },
    {
      id: 'proj-002',
      name: 'Office Building Renovation',
      client: 'Smith Enterprises',
      status: 'active',
      progress: 42,
      budget: 750000,
      actualCost: 315000,
      startDate: '2024-02-01',
      endDate: '2024-10-15',
      type: 'commercial',
      nextMilestone: {
        name: 'HVAC System Installation',
        dueDate: '2024-08-20'
      }
    },
    {
      id: 'proj-003',
      name: 'Kitchen Remodel Project',
      client: 'Brown Construction',
      status: 'completed',
      progress: 100,
      budget: 85000,
      actualCost: 82500,
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      type: 'renovation',
      nextMilestone: null
    },
    {
      id: 'proj-004',
      name: 'Luxury Apartment Complex',
      client: 'Davis Properties',
      status: 'planning',
      progress: 15,
      budget: 2500000,
      actualCost: 125000,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      type: 'commercial',
      nextMilestone: {
        name: 'Foundation Permits',
        dueDate: '2024-08-25'
      }
    },
    {
      id: 'proj-005',
      name: 'Backyard Landscaping',
      client: 'Wilson Homes',
      status: 'on-hold',
      progress: 25,
      budget: 35000,
      actualCost: 8750,
      startDate: '2024-04-15',
      endDate: '2024-09-15',
      type: 'landscaping',
      nextMilestone: {
        name: 'Weather Assessment',
        dueDate: '2024-08-10'
      }
    },
    {
      id: 'proj-006',
      name: 'Warehouse Construction',
      client: 'Johnson Family',
      status: 'active',
      progress: 78,
      budget: 1200000,
      actualCost: 936000,
      startDate: '2024-01-01',
      endDate: '2024-09-30',
      type: 'commercial',
      nextMilestone: {
        name: 'Final Inspections',
        dueDate: '2024-09-15'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    if (currentStep === 'firstProject' && projects.length === 0) {
      setIsCreateModalOpen(true);
    }
  }, [currentStep, projects.length]);

  useEffect(() => {
    // Apply filters
    let filtered = [...projects];

    // Status filter
    if (filters?.status !== 'all') {
      filtered = filtered?.filter(project => project?.status === filters?.status);
    }

    // Client filter
    if (filters?.client !== 'all') {
      filtered = filtered?.filter(project => 
        project?.client?.toLowerCase()?.replace(/\s+/g, '-') === filters?.client
      );
    }

    // Date range filter
    if (filters?.dateRange?.from) {
      filtered = filtered?.filter(project => 
        new Date(project.startDate) >= new Date(filters.dateRange.from)
      );
    }
    if (filters?.dateRange?.to) {
      filtered = filtered?.filter(project => 
        new Date(project.endDate) <= new Date(filters.dateRange.to)
      );
    }

    // Project type filter
    if (filters?.projectTypes?.length > 0) {
      filtered = filtered?.filter(project => 
        filters?.projectTypes?.includes(project?.type)
      );
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a?.name?.localeCompare(b?.name);
        case 'date':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'budget':
          return b?.budget - a?.budget;
        case 'status':
          return a?.status?.localeCompare(b?.status);
        case 'progress':
          return b?.progress - a?.progress;
        case 'client':
          return a?.client?.localeCompare(b?.client);
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  }, [projects, filters, sortBy]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      client: 'all',
      dateRange: { from: '', to: '' },
      projectTypes: []
    });
  };

  const handleBulkAction = (action, projectIds) => {
    console.log(`Bulk action: ${action} on projects:`, projectIds);
    // Implement bulk actions here
    switch (action) {
      case 'update-status':
        // Open status update modal
        break;
      case 'export':
        // Export selected projects
        break;
      case 'archive':
        // Archive projects
        break;
      case 'delete':
        // Delete projects
        break;
      default:
        break;
    }
  };

  const handleNewProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleProjectCreated = (newProject) => {
    // Add the new project to the list
    setProjects(prev => [newProject, ...prev]);
    setFilteredProjects(prev => [newProject, ...prev]);
    
    // Complete onboarding step if this is the first project
    if (currentStep === 'firstProject') {
      completeStep('firstProject');
    }
  };

  const content = (
    <>
      <Helmet>
        <title>Projects - BuildLedger</title>
        <meta name="description" content="Manage your construction projects with comprehensive tracking, timelines, and progress monitoring." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Breadcrumb />
        
        <main className="pt-4 pb-8">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
                  <p className="text-muted-foreground">
                    Manage and track your construction projects from start to finish
                  </p>
                </div>
                <div className="hidden lg:block">
                  <Button
                    variant="default"
                    onClick={handleNewProject}
                    iconName="Plus"
                    iconPosition="left"
                    className="bg-primary hover:bg-primary/90"
                  >
                    New Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-3">
                <ProjectFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Projects Content */}
              <div className="lg:col-span-9">
                {/* Toolbar */}
                <ProjectToolbar
                  selectedProjects={selectedProjects}
                  onBulkAction={handleBulkAction}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onNewProject={handleNewProject}
                />

                {/* Projects Grid/List */}
                <ProjectGrid
                  projects={filteredProjects}
                  selectedProjects={selectedProjects}
                  onProjectSelect={setSelectedProjects}
                  viewMode={viewMode}
                />

                {/* Results Summary */}
                {filteredProjects?.length > 0 && (
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Showing {filteredProjects?.length} of {projects?.length} projects
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </>
  );

  return currentStep === 'firstProject' ? (
    <OnboardingStep stepKey="firstProject">
      {content}
    </OnboardingStep>
  ) : content;
};

export default Projects;