import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ItemFilters from './components/ItemFilters';
import ItemCard from './components/ItemCard';
import ItemToolbar from './components/ItemToolbar';
import BarcodeScanner from '../../components/barcode/BarcodeScanner';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import OnboardingStep from '../../components/onboarding/OnboardingStep';
import { useBarcodeScanning } from '../../hooks/useBarcodeScanning';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { showInfoToast } from '../../utils/toastHelper';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { itemsService } from '../../services/itemsService';

const ItemsPage = () => {
  const navigate = useNavigate();
  const { currentStep, completeStep } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  
  const { searchItemByBarcode, isBarcodeSupported, isLoading: isBarcodeLoading } = useBarcodeScanning();

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dbItems = await itemsService.getItems();
        if (!mounted) return;
        const uiItems = (dbItems || []).map(it => ({
          id: it.id,
          name: it.name,
          category: it.category,
          description: it.description || '',
          unit: it.unit || 'each',
          costPrice: Number(it.cost || 0),
          sellingPrice: Number(it.unit_price || 0),
          markupPercentage: it.profit_margin != null ? Number(it.profit_margin) : undefined,
          taxCategory: it.category === 'labor' ? 'labor' : 'materials',
          sku: it.sku || '',
          barcode: it.barcode || null,
          supplier: it.supplier || '',
          supplierContact: it.supplier_sku || '',
          lastUsed: it.updated_at || it.created_at,
          usageCount: it.usage_count || 0,
          inStock: it.current_stock ? it.current_stock > 0 : true,
          reorderLevel: it.reorder_level || null,
          currentStock: it.current_stock || null,
          seasonalPricing: null,
        }));
        setItems(uiItems);
        setFilteredItems(uiItems);
      } catch (e) {
        console.error('Failed to load items', e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, activeFilters, items]);

  useEffect(() => {
    if (currentStep === 'firstItem' && items.length === 0) {
      // Show welcome message or automatically trigger add item flow
    }
  }, [currentStep, items.length]);

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
    navigate('/items/add');
    
    // Complete onboarding step if this is the first item
    if (currentStep === 'firstItem') {
      completeStep('firstItem');
    }
  };

  const handleEditItem = (itemId) => {
    navigate(`/items/edit/${itemId}`);
  };

  const handleDuplicateItem = (itemId) => {
    navigate(`/items/add?duplicate=${itemId}`);
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

  // Barcode scanning handlers
  const handleOpenScanner = () => {
    if (!isBarcodeSupported()) {
      showInfoToast('Barcode scanning requires a mobile device with camera access');
      return;
    }
    setIsScannerOpen(true);
  };

  const handleBarcodeDetected = async (barcode) => {
    console.log('Barcode detected:', barcode);
    
    // Search for existing item with this barcode
    const foundItem = await searchItemByBarcode(barcode);
    
    if (foundItem) {
      // Item found - highlight it in the list
      setScannedItem(foundItem);
      setSearchQuery(barcode); // This will filter the list to show the scanned item
    } else {
      // Item not found - could navigate to add new item with barcode pre-filled
      showInfoToast(`Item not found with barcode: ${barcode}. You can add it as a new item.`);
      // Optional: navigate to add item page with barcode pre-filled
      // navigate(`/items/add?barcode=${barcode}`);
    }
    
    setIsScannerOpen(false);
  };

  const handleScannerClose = () => {
    setIsScannerOpen(false);
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

  const content = (
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
              <div className="flex items-center space-x-2">
                {/* Mobile Barcode Scanner Button */}
                {isBarcodeSupported() && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleOpenScanner}
                    className="lg:hidden"
                    disabled={isBarcodeLoading}
                  >
                    <Icon name="ScanLine" size={20} />
                  </Button>
                )}
                
                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center space-x-2">
                  {isBarcodeSupported() && (
                    <Button
                      variant="outline"
                      iconName="ScanLine"
                      iconPosition="left"
                      onClick={handleOpenScanner}
                      disabled={isBarcodeLoading}
                    >
                      Scan Item
                    </Button>
                  )}
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
                
                {/* Mobile Add Item Button */}
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleAddItem}
                  className="lg:hidden"
                >
                  <Icon name="Plus" size={20} />
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
                        isHighlighted={scannedItem && scannedItem.id === item.id}
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

      {/* Mobile Floating Scan Button */}
      {isBarcodeSupported() && (
        <FloatingActionButton
          icon="ScanLine"
          onClick={handleOpenScanner}
          disabled={isBarcodeLoading}
          className="lg:hidden"
          variant="default"
        />
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={handleScannerClose}
        onBarcodeDetected={handleBarcodeDetected}
        onItemNotFound={(barcode) => {
          showInfoToast(`Item not found with barcode: ${barcode}`);
          setIsScannerOpen(false);
        }}
      />
    </div>
  );

  return currentStep === 'firstItem' ? (
    <OnboardingStep stepKey="firstItem">
      {content}
    </OnboardingStep>
  ) : content;
};

export default ItemsPage;