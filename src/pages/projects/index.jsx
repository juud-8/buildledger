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
    status: 'all', // planning | in_progress | on_hold | completed | cancelled
    client: 'all',
    dateRange: {
      from: '',
      to: ''
    },
    projectTypes: []
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dbProjects = await (await import('../../services/projectsService')).projectsService.getProjects();
        if (!mounted) return;
        const uiProjects = (dbProjects || []).map(p => ({
          id: p.id,
          name: p.name,
          client: p.client?.name || '—',
          status: p.status, // planning | in_progress | on_hold | completed | cancelled
          progress: p.completion_percentage || 0,
          budget: Number(p.budget_amount || 0),
          actualCost: Number(p.actual_cost || 0),
          startDate: p.start_date || '',
          endDate: p.end_date || '',
          type: 'general',
          nextMilestone: null,
        }));
        setProjects(uiProjects);
        setFilteredProjects(uiProjects);
      } catch (e) {
        console.error('Failed to load projects', e);
      }
    })();
    return () => { mounted = false; };
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

    // Project type filter (placeholder - no type in schema)
    if (filters?.projectTypes?.length > 0) {
      filtered = filtered?.filter(project => filters?.projectTypes?.includes(project?.type));
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