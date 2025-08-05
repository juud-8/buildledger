import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ItemFilters from './components/ItemFilters';
import ItemCard from './components/ItemCard';
import ItemToolbar from './components/ItemToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ItemsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Mock items data
  const mockItems = [
    {
      id: 1,
      name: "Concrete Foundation Mix",
      category: "Foundation",
      description: "High-strength concrete mix for residential foundations",
      unit: "cubic yard",
      costPrice: 120.00,
      sellingPrice: 180.00,
      markupPercentage: 50,
      taxCategory: "materials",
      sku: "CFM-001",
      barcode: "1234567890123",
      supplier: "Metro Concrete Supply",
      supplierContact: "(555) 123-4567",
      lastUsed: "2024-01-15",
      usageCount: 45,
      inStock: true,
      reorderLevel: 10,
      currentStock: 25,
      seasonalPricing: {
        winter: 200.00,
        summer: 160.00
      }
    },
    {
      id: 2,
      name: "2x10 Pressure Treated Lumber",
      category: "Framing",
      description: "Pressure treated lumber for structural framing",
      unit: "linear foot",
      costPrice: 8.50,
      sellingPrice: 12.75,
      markupPercentage: 50,
      taxCategory: "materials",
      sku: "PTL-210",
      barcode: "2345678901234",
      supplier: "Springfield Lumber",
      supplierContact: "(555) 234-5678",
      lastUsed: "2024-01-18",
      usageCount: 128,
      inStock: true,
      reorderLevel: 50,
      currentStock: 150,
      seasonalPricing: {
        winter: 14.00,
        summer: 11.50
      }
    },
    {
      id: 3,
      name: "Electrical Panel 200A",
      category: "Electrical",
      description: "200 amp main electrical panel with breakers",
      unit: "each",
      costPrice: 350.00,
      sellingPrice: 525.00,
      markupPercentage: 50,
      taxCategory: "materials",
      sku: "EP-200A",
      barcode: "3456789012345",
      supplier: "Electric Supply Co",
      supplierContact: "(555) 345-6789",
      lastUsed: "2024-01-10",
      usageCount: 12,
      inStock: true,
      reorderLevel: 3,
      currentStock: 8,
      seasonalPricing: null
    },
    {
      id: 4,
      name: "PVC Pipe 4 inch",
      category: "Plumbing",
      description: "4-inch PVC drainage pipe",
      unit: "linear foot",
      costPrice: 4.25,
      sellingPrice: 6.38,
      markupPercentage: 50,
      taxCategory: "materials",
      sku: "PVC-4IN",
      barcode: "4567890123456",
      supplier: "Plumbing Plus",
      supplierContact: "(555) 456-7890",
      lastUsed: "2024-01-12",
      usageCount: 89,
      inStock: true,
      reorderLevel: 100,
      currentStock: 300,
      seasonalPricing: null
    },
    {
      id: 5,
      name: "HVAC Ductwork per sq ft",
      category: "HVAC",
      description: "Galvanized steel ductwork installation",
      unit: "square foot",
      costPrice: 12.00,
      sellingPrice: 24.00,
      markupPercentage: 100,
      taxCategory: "materials",
      sku: "HVAC-DUCT",
      barcode: "5678901234567",
      supplier: "Air Flow Systems",
      supplierContact: "(555) 567-8901",
      lastUsed: "2024-01-08",
      usageCount: 67,
      inStock: false,
      reorderLevel: 500,
      currentStock: 0,
      seasonalPricing: {
        winter: 26.00,
        summer: 22.00
      }
    },
    {
      id: 6,
      name: "Asphalt Shingles",
      category: "Roofing",
      description: "30-year architectural shingles",
      unit: "square",
      costPrice: 95.00,
      sellingPrice: 142.50,
      markupPercentage: 50,
      taxCategory: "materials",
      sku: "AS-30YR",
      barcode: "6789012345678",
      supplier: "Roofing Materials Inc",
      supplierContact: "(555) 678-9012",
      lastUsed: "2024-01-20",
      usageCount: 34,
      inStock: true,
      reorderLevel: 20,
      currentStock: 45,
      seasonalPricing: {
        winter: 160.00,
        summer: 125.00
      }
    },
    {
      id: 7,
      name: "Skilled Labor - Electrician",
      category: "Labor",
      description: "Licensed electrician hourly rate",
      unit: "hour",
      costPrice: 45.00,
      sellingPrice: 85.00,
      markupPercentage: 89,
      taxCategory: "labor",
      sku: "LAB-ELEC",
      barcode: null,
      supplier: "Internal",
      supplierContact: null,
      lastUsed: "2024-01-19",
      usageCount: 156,
      inStock: true,
      reorderLevel: null,
      currentStock: null,
      seasonalPricing: null
    },
    {
      id: 8,
      name: "Equipment Rental - Excavator",
      category: "Equipment",
      description: "Mid-size excavator daily rental",
      unit: "day",
      costPrice: 280.00,
      sellingPrice: 420.00,
      markupPercentage: 50,
      taxCategory: "equipment",
      sku: "EQ-EXCAV",
      barcode: null,
      supplier: "Heavy Equipment Rentals",
      supplierContact: "(555) 789-0123",
      lastUsed: "2024-01-14",
      usageCount: 23,
      inStock: true,
      reorderLevel: null,
      currentStock: null,
      seasonalPricing: {
        winter: 380.00,
        summer: 460.00
      }
    }
  ];

  const [items, setItems] = useState(mockItems);
  const [filteredItems, setFilteredItems] = useState(mockItems);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, activeFilters, items]);

  const filterItems = () => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(item =>
        item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        item?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        item?.sku?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        item?.category?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Active filters
    Object.entries(activeFilters)?.forEach(([category, values]) => {
      if (values?.length > 0) {
        filtered = filtered?.filter(item => {
          switch (category) {
            case 'category':
              return values?.includes(item?.category);
            case 'unit':
              return values?.includes(item?.unit);
            case 'priceRange':
              if (values?.includes('under50')) return item?.sellingPrice < 50;
              if (values?.includes('50to200')) return item?.sellingPrice >= 50 && item?.sellingPrice <= 200;
              if (values?.includes('200to500')) return item?.sellingPrice > 200 && item?.sellingPrice <= 500;
              if (values?.includes('over500')) return item?.sellingPrice > 500;
              return true;
            case 'availability':
              if (values?.includes('inStock')) return item?.inStock;
              if (values?.includes('outOfStock')) return !item?.inStock;
              if (values?.includes('lowStock')) return item?.currentStock && item?.currentStock <= item?.reorderLevel;
              return true;
            case 'recentlyUsed':
              if (values?.includes('lastWeek')) {
                const lastWeek = new Date();
                lastWeek?.setDate(lastWeek?.getDate() - 7);
                return new Date(item?.lastUsed) >= lastWeek;
              }
              return true;
            default:
              return true;
          }
        });
      }
    });

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    navigate('/add-edit-item');
  };

  const handleEditItem = (itemId) => {
    navigate(`/add-edit-item?id=${itemId}`);
  };

  const handleDuplicateItem = (itemId) => {
    navigate(`/add-edit-item?duplicate=${itemId}`);
  };

  const handleDeleteItem = (itemId) => {
    setItems(prev => prev?.filter(item => item?.id !== itemId));
  };

  const handleBulkImport = () => {
    // Mock bulk import functionality
    console.log('Bulk importing items');
  };

  const handleBulkExport = (format) => {
    // Mock bulk export functionality
    console.log('Exporting items as:', format);
  };

  const handleAddToFavorites = (itemId) => {
    // Mock add to favorites functionality
    console.log('Adding to favorites:', itemId);
  };

  const handleViewUsageHistory = (itemId) => {
    // Mock view usage history functionality
    console.log('Viewing usage history for:', itemId);
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
              <p className="text-muted-foreground">Loading items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Items - BuildLedger</title>
        <meta name="description" content="Manage construction items, pricing, and inventory for your projects" />
      </Helmet>
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <div className="px-4 lg:px-6 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Items</h1>
                <p className="text-muted-foreground mt-1">
                  Manage construction items, pricing, and inventory
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="outline"
                  iconName="Upload"
                  iconPosition="left"
                  onClick={handleBulkImport}
                >
                  Import Items
                </Button>
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => handleBulkExport('csv')}
                >
                  Export Items
                </Button>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-3">
              <ItemFilters
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Toolbar */}
              <ItemToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddItem={handleAddItem}
                onBulkImport={handleBulkImport}
                onBulkExport={handleBulkExport}
                selectedItems={selectedItems}
                totalItems={filteredItems?.length}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Results */}
              {filteredItems?.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(activeFilters)?.length > 0
                      ? "Try adjusting your search or filters" :"Get started by adding your first construction item"
                    }
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAddItem}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Item
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredItems?.length} of {items?.length} items
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                        size="sm" 
                        iconName="Grid3X3"
                        onClick={() => setViewMode('grid')} 
                      />
                      <Button 
                        variant={viewMode === 'list' ? 'default' : 'ghost'} 
                        size="sm" 
                        iconName="List"
                        onClick={() => setViewMode('list')} 
                      />
                    </div>
                  </div>

                  {/* Items Grid/List */}
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" :"space-y-4"
                  }>
                    {filteredItems?.map((item) => (
                      <ItemCard
                        key={item?.id}
                        item={item}
                        viewMode={viewMode}
                        onEdit={handleEditItem}
                        onDuplicate={handleDuplicateItem}
                        onDelete={handleDeleteItem}
                        onAddToFavorites={handleAddToFavorites}
                        onViewUsageHistory={handleViewUsageHistory}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsPage;