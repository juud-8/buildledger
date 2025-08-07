import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MaterialFilters from './components/MaterialFilters';
import MaterialCard from './components/MaterialCard';
import MaterialToolbar from './components/MaterialToolbar';
import MaterialDetailModal from './components/MaterialDetailModal';
import CreateMaterialModal from './components/CreateMaterialModal';
import CostTrackingModal from './components/CostTrackingModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { materialsService } from '../../services/materialsService';
import { vendorsService } from '../../services/vendorsService';
import { useAuth } from '../../contexts/AuthContext';
import { showInfoToast, showErrorToast } from '../../utils/toastHelper';

const MaterialsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCostTrackingModalOpen, setIsCostTrackingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle filtering by vendor from navigation state
  useEffect(() => {
    if (location.state?.vendorId && location.state?.action === 'filter') {
      setActiveFilters(prev => ({
        ...prev,
        vendor: [location.state.vendorId]
      }));
    }
  }, [location.state]);

  // Fetch materials and vendors from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both materials and vendors
        const [materialsData, vendorsData] = await Promise.all([
          materialsService.getMaterials(),
          vendorsService.getVendors()
        ]);
        
        setMaterials(materialsData || []);
        setFilteredMaterials(materialsData || []);
        setVendors(vendorsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load materials. Please try again.');
        
        // Use mock data as fallback for demo purposes
        const mockMaterials = [
          {
            id: 1,
            name: "2x4 Lumber - 8ft",
            description: "Standard construction grade lumber",
            category: "materials",
            unit: "each",
            sku: "LUM-2X4-8",
            vendor_sku: "HD-2X4-8",
            unit_cost: 3.50,
            unit_price: 4.25,
            profit_margin: 21.43,
            current_stock: 150,
            minimum_stock: 25,
            reorder_point: 50,
            vendors: { id: 1, name: "Home Depot Pro", company_name: "Home Depot" },
            is_active: true,
            created_at: "2023-01-15",
          },
          {
            id: 2,
            name: "Concrete Mix - 80lb",
            description: "High-strength concrete mix",
            category: "materials",
            unit: "bag",
            sku: "CON-MIX-80",
            vendor_sku: "ABC-CON80",
            unit_cost: 4.75,
            unit_price: 6.50,
            profit_margin: 36.84,
            current_stock: 85,
            minimum_stock: 20,
            reorder_point: 30,
            vendors: { id: 2, name: "ABC Lumber Co", company_name: "ABC Lumber Company" },
            is_active: true,
            created_at: "2023-02-20",
          }
        ];
        setMaterials(mockMaterials);
        setFilteredMaterials(mockMaterials);
        setVendors([
          { id: 1, name: "Home Depot Pro", company_name: "Home Depot" },
          { id: 2, name: "ABC Lumber Co", company_name: "ABC Lumber Company" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, refreshKey]);

  // Filter materials based on search and filters
  useEffect(() => {
    filterMaterials();
  }, [searchQuery, activeFilters, materials]);

  const filterMaterials = () => {
    let filtered = materials;

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(material =>
        material?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        material?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        material?.sku?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        material?.vendor_sku?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        material?.vendors?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(material => {
          switch (category) {
            case 'category':
              return values?.includes(material?.category);
            case 'vendor':
              return values?.includes(material?.vendor_id);
            case 'stock':
              if (values?.includes('low')) {
                return material?.current_stock <= material?.reorder_point;
              }
              if (values?.includes('out')) {
                return material?.current_stock <= 0;
              }
              if (values?.includes('adequate')) {
                return material?.current_stock > material?.reorder_point;
              }
              return true;
            case 'status':
              if (values?.includes('active')) return material?.is_active === true;
              if (values?.includes('inactive')) return material?.is_active === false;
              return true;
            default:
              return true;
          }
        });
      }
    });

    setFilteredMaterials(filtered);
  };

  const handleViewDetails = (materialId) => {
    const material = materials?.find(m => m?.id === materialId);
    setSelectedMaterial(material);
    setIsDetailModalOpen(true);
  };

  const handleEditMaterial = (materialId) => {
    const material = materials?.find(m => m?.id === materialId);
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }

    try {
      await materialsService.deleteMaterial(materialId);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting material:', error);
      showErrorToast('Failed to delete material. Please try again.');
    }
  };

  const handleTrackCost = (materialId) => {
    const material = materials?.find(m => m?.id === materialId);
    setSelectedMaterial(material);
    setIsCostTrackingModalOpen(true);
  };

  const handleAddMaterial = () => {
    setIsCreateModalOpen(true);
  };

  const handleMaterialCreated = () => {
    setIsCreateModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleMaterialUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedMaterial(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleCostTracked = () => {
    setIsCostTrackingModalOpen(false);
    setSelectedMaterial(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = (format) => {
    // Prepare data for export
    const exportData = filteredMaterials.map(material => ({
      Name: material.name,
      Description: material.description || '',
      Category: material.category,
      SKU: material.sku || '',
      'Vendor SKU': material.vendor_sku || '',
      Vendor: material.vendors?.name || '',
      Unit: material.unit,
      'Unit Cost': material.unit_cost,
      'Unit Price': material.unit_price,
      'Profit Margin %': material.profit_margin || '',
      'Current Stock': material.current_stock || 0,
      'Minimum Stock': material.minimum_stock || 0,
      'Reorder Point': material.reorder_point || 0,
      Status: material.is_active ? 'Active' : 'Inactive',
      'Created Date': new Date(material.created_at).toLocaleDateString()
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
      a.download = `materials_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      showInfoToast('PDF export functionality coming soon!', '📄');
    }
  };

  const handleSelectMaterial = (materialId) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      } else {
        return [...prev, materialId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMaterials.length === filteredMaterials.length) {
      setSelectedMaterials([]);
    } else {
      setSelectedMaterials(filteredMaterials.map(m => m.id));
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
              <p className="text-muted-foreground mb-4">Please log in to view your materials</p>
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
              <p className="text-muted-foreground">Loading materials...</p>
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
                <h1 className="text-3xl font-bold text-foreground">Materials</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your construction materials and inventory
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
                  onClick={handleAddMaterial}
                >
                  Add Material
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
              <MaterialFilters
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                vendors={vendors}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Toolbar */}
              <MaterialToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddMaterial={handleAddMaterial}
                onExport={handleExport}
                selectedMaterials={selectedMaterials}
                totalMaterials={filteredMaterials?.length}
                onSelectAll={handleSelectAll}
              />

              {/* Results */}
              {filteredMaterials?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Box" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No materials found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(activeFilters)?.length > 0
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first material"
                    }
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddMaterial}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Material
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredMaterials?.length} of {materials?.length} materials
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" iconName="Grid3X3" />
                      <Button variant="ghost" size="sm" iconName="List" />
                    </div>
                  </div>

                  {/* Materials Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMaterials?.map((material) => (
                      <MaterialCard
                        key={material?.id}
                        material={material}
                        isSelected={selectedMaterials.includes(material?.id)}
                        onSelect={() => handleSelectMaterial(material?.id)}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditMaterial}
                        onDelete={handleDeleteMaterial}
                        onTrackCost={handleTrackCost}
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
      <MaterialDetailModal
        material={selectedMaterial}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMaterial(null);
        }}
        onEdit={handleEditMaterial}
        onDelete={handleDeleteMaterial}
        onTrackCost={handleTrackCost}
      />
      
      <CreateMaterialModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleMaterialCreated}
        vendors={vendors}
      />
      
      {isEditModalOpen && selectedMaterial && (
        <CreateMaterialModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMaterial(null);
          }}
          onSuccess={handleMaterialUpdated}
          editMode={true}
          initialData={selectedMaterial}
          vendors={vendors}
        />
      )}

      <CostTrackingModal
        material={selectedMaterial}
        vendors={vendors}
        isOpen={isCostTrackingModalOpen}
        onClose={() => {
          setIsCostTrackingModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSuccess={handleCostTracked}
      />
    </div>
  );
};

export default MaterialsPage;