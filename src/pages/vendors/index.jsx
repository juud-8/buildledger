import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VendorFilters from './components/VendorFilters';
import VendorCard from './components/VendorCard';
import VendorToolbar from './components/VendorToolbar';
import VendorDetailModal from './components/VendorDetailModal';
import CreateVendorModal from './components/CreateVendorModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { vendorsService } from '../../services/vendorsService';
import { useAuth } from '../../contexts/AuthContext';
import { showInfoToast, showErrorToast } from '../../utils/toastHelper';

const VendorsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await vendorsService.getVendors();
        setVendors(data || []);
        setFilteredVendors(data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setError('Failed to load vendors. Please try again.');
        // No fallback to mock data - keep empty state
        setVendors([]);
        setFilteredVendors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [user, refreshKey]);

  // Filter vendors based on search and filters
  useEffect(() => {
    filterVendors();
  }, [searchQuery, activeFilters, vendors]);

  const filterVendors = () => {
    let filtered = vendors;

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(vendor =>
        vendor?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vendor?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vendor?.phone?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vendor?.company_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        vendor?.contact_person?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(vendor => {
          switch (category) {
            case 'status':
              if (values?.includes('active')) return vendor?.is_active === true;
              if (values?.includes('inactive')) return vendor?.is_active === false;
              return true;
            case 'paymentTerms':
              return values?.includes(vendor?.payment_terms);
            default:
              return true;
          }
        });
      }
    });

    setFilteredVendors(filtered);
  };

  const handleViewDetails = (vendorId) => {
    const vendor = vendors?.find(v => v?.id === vendorId);
    setSelectedVendor(vendor);
    setIsDetailModalOpen(true);
  };

  const handleEditVendor = (vendorId) => {
    const vendor = vendors?.find(v => v?.id === vendorId);
    setSelectedVendor(vendor);
    setIsEditModalOpen(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      await vendorsService.deleteVendor(vendorId);
      // Refresh the vendors list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting vendor:', error);
      showErrorToast('Failed to delete vendor. Please try again.');
    }
  };

  const handleViewMaterials = (vendorId) => {
    navigate('/materials', { state: { vendorId, action: 'filter' } });
  };

  const handleContactVendor = (vendor) => {
    if (vendor?.email) {
      window.location.href = `mailto:${vendor.email}?subject=Hello ${vendor.name}`;
    } else if (vendor?.phone) {
      window.location.href = `tel:${vendor.phone}`;
    } else {
      showInfoToast('No contact information available for this vendor.');
    }
  };

  const handleAddVendor = () => {
    setIsCreateModalOpen(true);
  };

  const handleVendorCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh the vendors list
    setRefreshKey(prev => prev + 1);
  };

  const handleVendorUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedVendor(null);
    // Refresh the vendors list
    setRefreshKey(prev => prev + 1);
  };

  const handleBulkEmail = () => {
    if (selectedVendors.length === 0) {
      showInfoToast('Please select at least one vendor to email.');
      return;
    }
    
    const selectedEmails = selectedVendors
      .map(id => vendors.find(v => v.id === id))
      .filter(v => v?.email)
      .map(v => v.email);
    
    if (selectedEmails.length === 0) {
      showInfoToast('Selected vendors do not have email addresses.');
      return;
    }
    
    // Open email client with multiple recipients
    window.location.href = `mailto:${selectedEmails.join(',')}?subject=Important Update from BuildLedger`;
  };

  const handleExport = (format) => {
    // Prepare data for export
    const exportData = filteredVendors.map(vendor => ({
      Name: vendor.name,
      Email: vendor.email,
      Phone: vendor.phone,
      Company: vendor.company_name || '',
      Contact: vendor.contact_person || '',
      'Payment Terms': vendor.payment_terms,
      Status: vendor.is_active ? 'Active' : 'Inactive',
      Address: vendor.address ? 
        `${vendor.address.street || ''} ${vendor.address.city || ''} ${vendor.address.state || ''} ${vendor.address.zip || ''}`.trim() : '',
      'Created Date': new Date(vendor.created_at).toLocaleDateString()
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
      a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      showInfoToast('PDF export functionality coming soon!', '📄');
    }
  };

  const handleSelectVendor = (vendorId) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(v => v.id));
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
              <p className="text-muted-foreground mb-4">Please log in to view your vendors</p>
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
              <p className="text-muted-foreground">Loading vendors...</p>
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
                <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your vendor relationships and material suppliers
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
                  onClick={handleAddVendor}
                >
                  Add Vendor
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
              <VendorFilters
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Toolbar */}
              <VendorToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddVendor={handleAddVendor}
                onBulkEmail={handleBulkEmail}
                onExport={handleExport}
                selectedVendors={selectedVendors}
                totalVendors={filteredVendors?.length}
                onSelectAll={handleSelectAll}
              />

              {/* Results */}
              {filteredVendors?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Store" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No vendors found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(activeFilters)?.length > 0
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first vendor"
                    }
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddVendor}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Vendor
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredVendors?.length} of {vendors?.length} vendors
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Grid3X3" />
                      <Button variant="ghost" size="sm" iconName="List" />
                    </div>
                  </div>

                  {/* Vendor Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVendors?.map((vendor) => (
                      <VendorCard
                        key={vendor?.id}
                        vendor={vendor}
                        isSelected={selectedVendors.includes(vendor?.id)}
                        onSelect={() => handleSelectVendor(vendor?.id)}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditVendor}
                        onDelete={handleDeleteVendor}
                        onViewMaterials={handleViewMaterials}
                        onContactVendor={() => handleContactVendor(vendor)}
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
      <VendorDetailModal
        vendor={selectedVendor}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVendor(null);
        }}
        onEdit={handleEditVendor}
        onDelete={handleDeleteVendor}
      />
      
      <CreateVendorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleVendorCreated}
      />
      
      {isEditModalOpen && selectedVendor && (
        <CreateVendorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedVendor(null);
          }}
          onSuccess={handleVendorUpdated}
          editMode={true}
          initialData={selectedVendor}
        />
      )}
    </div>
  );
};

export default VendorsPage;