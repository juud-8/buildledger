import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ClientFilters from './components/ClientFilters';
import ClientCard from './components/ClientCard';
import ClientToolbar from './components/ClientToolbar';
import ClientDetailModal from './components/ClientDetailModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ClientsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock clients data
  const mockClients = [
    {
      id: 1,
      name: "Johnson Family",
      email: "mike.johnson@email.com",
      phone: "(555) 123-4567",
      location: "123 Oak Street, Springfield, IL",
      type: "residential",
      isRepeat: true,
      totalValue: 125000,
      activeProjects: 2,
      totalProjects: 5,
      paymentHistory: "excellent",
      lastContact: "2024-01-18",
      clientSince: "2022-03-15",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Springfield Commercial LLC",
      email: "contact@springfieldcommercial.com",
      phone: "(555) 987-6543",
      location: "456 Business Park Dr, Springfield, IL",
      type: "commercial",
      isRepeat: false,
      totalValue: 450000,
      activeProjects: 1,
      totalProjects: 2,
      paymentHistory: "good",
      lastContact: "2024-01-15",
      clientSince: "2023-08-20",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Davis Residence",
      email: "sarah.davis@email.com",
      phone: "(555) 456-7890",
      location: "789 Maple Avenue, Springfield, IL",
      type: "residential",
      isRepeat: true,
      totalValue: 85000,
      activeProjects: 0,
      totalProjects: 3,
      paymentHistory: "excellent",
      lastContact: "2024-01-12",
      clientSince: "2021-11-10",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Metro Office Complex",
      email: "facilities@metrooffice.com",
      phone: "(555) 321-0987",
      location: "321 Downtown Plaza, Springfield, IL",
      type: "commercial",
      isRepeat: true,
      totalValue: 750000,
      activeProjects: 3,
      totalProjects: 8,
      paymentHistory: "good",
      lastContact: "2024-01-20",
      clientSince: "2020-05-18",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Wilson Family",
      email: "tom.wilson@email.com",
      phone: "(555) 654-3210",
      location: "654 Pine Street, Springfield, IL",
      type: "residential",
      isRepeat: false,
      totalValue: 65000,
      activeProjects: 1,
      totalProjects: 1,
      paymentHistory: "fair",
      lastContact: "2024-01-10",
      clientSince: "2024-01-05",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Green Valley Shopping Center",
      email: "management@greenvalley.com",
      phone: "(555) 789-0123",
      location: "987 Valley Road, Springfield, IL",
      type: "commercial",
      isRepeat: false,
      totalValue: 320000,
      activeProjects: 1,
      totalProjects: 1,
      paymentHistory: "good",
      lastContact: "2024-01-16",
      clientSince: "2023-12-01",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const [clients, setClients] = useState(mockClients);
  const [filteredClients, setFilteredClients] = useState(mockClients);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, activeFilters, clients]);

  const filterClients = () => {
    let filtered = clients;

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(client =>
        client?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        client?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        client?.location?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(client => {
          switch (category) {
            case 'clientType':
              return values?.includes(client?.type) || (values?.includes('repeat') && client?.isRepeat);
            case 'projectStatus':
              if (values?.includes('active')) return client?.activeProjects > 0;
              if (values?.includes('completed')) return client?.totalProjects > client?.activeProjects;
              return true;
            case 'paymentHistory':
              return values?.includes(client?.paymentHistory);
            default:
              return true;
          }
        });
      }
    });

    setFilteredClients(filtered);
  };

  const handleViewDetails = (clientId) => {
    const client = clients?.find(c => c?.id === clientId);
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const handleCreateQuote = (clientId) => {
    navigate('/quotes', { state: { clientId } });
  };

  const handleStartProject = (clientId) => {
    navigate('/projects', { state: { clientId } });
  };

  const handleContactClient = (clientId) => {
    // Mock contact functionality
    console.log('Contacting client:', clientId);
  };

  const handleAddClient = () => {
    // For now, show an alert to confirm the button works
    alert('Add Client functionality would open here! 🚧\n\nThis demonstrates the button is working correctly. In production, this would open a client creation form.');
    console.log('Add Client button clicked - functionality confirmed!');
  };

  const handleBulkEmail = () => {
    // Mock bulk email functionality
    console.log('Sending bulk email to:', selectedClients);
  };

  const handleExport = (format) => {
    // Mock export functionality
    console.log('Exporting clients as:', format);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading clients...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <div className="px-4 lg:px-6 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Clients</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your client relationships and project history
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => handleExport('pdf')}
                >
                  Export Report
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleAddClient}
                >
                  Add Client
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-3">
              <ClientFilters
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Toolbar */}
              <ClientToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClient={handleAddClient}
                onBulkEmail={handleBulkEmail}
                onExport={handleExport}
                selectedClients={selectedClients}
                totalClients={filteredClients?.length}
              />

              {/* Results */}
              {filteredClients?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(activeFilters)?.length > 0
                      ? "Try adjusting your search or filters" :"Get started by adding your first client"
                    }
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddClient}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Client
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredClients?.length} of {clients?.length} clients
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Grid3X3" />
                      <Button variant="ghost" size="sm" iconName="List" />
                    </div>
                  </div>

                  {/* Client Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredClients?.map((client) => (
                      <ClientCard
                        key={client?.id}
                        client={client}
                        onViewDetails={handleViewDetails}
                        onCreateQuote={handleCreateQuote}
                        onStartProject={handleStartProject}
                        onContactClient={handleContactClient}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};

export default ClientsPage;