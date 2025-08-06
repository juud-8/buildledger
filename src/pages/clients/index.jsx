import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ClientFilters from './components/ClientFilters';
import ClientCard from './components/ClientCard';
import ClientToolbar from './components/ClientToolbar';
import ClientDetailModal from './components/ClientDetailModal';
import CreateClientModal from './components/CreateClientModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { clientsService } from '../../services/clientsService';
import { useAuth } from '../../contexts/AuthContext';
import { showInfoToast, showErrorToast } from '../../utils/toastHelper';

const ClientsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await clientsService.getClients();
        setClients(data || []);
        setFilteredClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients. Please try again.');
        // Use mock data as fallback for demo purposes
        const mockClients = [
          {
            id: 1,
            name: "Johnson Family",
            email: "mike.johnson@email.com",
            phone: "(555) 123-4567",
            address: { street: "123 Oak Street", city: "Springfield", state: "IL", zip: "62701" },
            client_type: "residential",
            is_active: true,
            payment_terms: "net30",
            created_at: "2022-03-15",
          },
          {
            id: 2,
            name: "Springfield Commercial LLC",
            email: "contact@springfieldcommercial.com",
            phone: "(555) 987-6543",
            address: { street: "456 Business Park Dr", city: "Springfield", state: "IL", zip: "62702" },
            client_type: "commercial",
            is_active: true,
            payment_terms: "net45",
            created_at: "2023-08-20",
          }
        ];
        setClients(mockClients);
        setFilteredClients(mockClients);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [user, refreshKey]);

  // Filter clients based on search and filters
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
        client?.phone?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        client?.company_name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(client => {
          switch (category) {
            case 'clientType':
              return values?.includes(client?.client_type);
            case 'status':
              if (values?.includes('active')) return client?.is_active === true;
              if (values?.includes('inactive')) return client?.is_active === false;
              return true;
            case 'paymentTerms':
              return values?.includes(client?.payment_terms);
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

  const handleEditClient = (clientId) => {
    const client = clients?.find(c => c?.id === clientId);
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await clientsService.deleteClient(clientId);
      // Refresh the clients list
      setRefreshKey(prev => prev + 1);
      // Show success message (you might want to use a toast notification here)
      console.log('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      showErrorToast('Failed to delete client. Please try again.');
    }
  };

  const handleCreateQuote = (clientId) => {
    navigate('/quotes', { state: { clientId, action: 'create' } });
  };

  const handleStartProject = (clientId) => {
    const client = clients?.find(c => c?.id === clientId);
    navigate('/projects', { state: { clientId, clientName: client?.name, action: 'create' } });
  };

  const handleContactClient = (client) => {
    // Open email client
    if (client?.email) {
      window.location.href = `mailto:${client.email}?subject=Hello ${client.name}`;
    } else if (client?.phone) {
      window.location.href = `tel:${client.phone}`;
    } else {
      showInfoToast('No contact information available for this client.');
    }
  };

  const handleAddClient = () => {
    setIsCreateModalOpen(true);
  };

  const handleClientCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh the clients list
    setRefreshKey(prev => prev + 1);
  };

  const handleClientUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedClient(null);
    // Refresh the clients list
    setRefreshKey(prev => prev + 1);
  };

  const handleBulkEmail = () => {
    if (selectedClients.length === 0) {
      showInfoToast('Please select at least one client to email.');
      return;
    }
    
    const selectedEmails = selectedClients
      .map(id => clients.find(c => c.id === id))
      .filter(c => c?.email)
      .map(c => c.email);
    
    if (selectedEmails.length === 0) {
      showInfoToast('Selected clients do not have email addresses.');
      return;
    }
    
    // Open email client with multiple recipients
    window.location.href = `mailto:${selectedEmails.join(',')}?subject=Important Update from BuildLedger`;
  };

  const handleExport = (format) => {
    // Prepare data for export
    const exportData = filteredClients.map(client => ({
      Name: client.name,
      Email: client.email,
      Phone: client.phone,
      Company: client.company_name || '',
      Type: client.client_type,
      Status: client.is_active ? 'Active' : 'Inactive',
      'Payment Terms': client.payment_terms,
      Address: client.address ? 
        `${client.address.street || ''} ${client.address.city || ''} ${client.address.state || ''} ${client.address.zip || ''}`.trim() : '',
      'Created Date': new Date(client.created_at).toLocaleDateString()
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // For PDF export, would need to implement with jsPDF library
      showInfoToast('PDF export functionality coming soon!', '📄');
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Lock" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please log in to view your clients</p>
              <Button
                variant="default"
                onClick={() => navigate('/login')}
                iconName="LogIn"
                iconPosition="left"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  onClick={() => handleExport('csv')}
                >
                  Export CSV
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}

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
                onSelectAll={handleSelectAll}
              />

              {/* Results */}
              {filteredClients?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No clients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(activeFilters)?.length > 0
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first client"
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
                        isSelected={selectedClients.includes(client?.id)}
                        onSelect={() => handleSelectClient(client?.id)}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditClient}
                        onDelete={handleDeleteClient}
                        onCreateQuote={handleCreateQuote}
                        onStartProject={handleStartProject}
                        onContactClient={() => handleContactClient(client)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientDetailModal
        client={selectedClient}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClient(null);
        }}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />
      
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleClientCreated}
      />
      
      {/* You can create an EditClientModal component similar to CreateClientModal */}
      {isEditModalOpen && selectedClient && (
        <CreateClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          onSuccess={handleClientUpdated}
          editMode={true}
          initialData={selectedClient}
        />
      )}
    </div>
  );
};

export default ClientsPage;