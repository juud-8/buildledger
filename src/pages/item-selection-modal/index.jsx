import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import RecentlyUsedItems from './components/RecentlyUsedItems';
import ItemCard from './components/ItemCard';
import QuantityAdjuster from './components/QuantityAdjuster';

const ItemSelectionModal = ({ 
  isOpen, 
  onClose, 
  onItemsSelected, 
  selectedItems = [],
  mode = 'quote' // 'quote' or 'invoice'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [cartItems, setCartItems] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'usage', 'category'

  // Mock data for construction items
  const allItems = [
    {
      id: 1,
      name: 'Concrete Mix - Premium',
      category: 'foundation',
      categoryIcon: 'Building',
      unitPrice: 125.50,
      unit: 'per cubic yard',
      stockStatus: 'in-stock',
      supplier: 'BuildMart Supply',
      sku: 'CM-PREM-001',
      taxCategory: 'materials',
      markup: 15,
      description: 'High-strength concrete mix for foundations and structural applications',
      recentlyUsed: true,
      usageFrequency: 85,
      seasonalPricing: false
    },
    {
      id: 2,
      name: 'Rebar #4 - 20ft',
      category: 'foundation',
      categoryIcon: 'Building',
      unitPrice: 45.75,
      unit: 'per piece',
      stockStatus: 'low-stock',
      supplier: 'Steel Supply Co',
      sku: 'RB-4-20',
      taxCategory: 'materials',
      markup: 20,
      description: 'Grade 60 rebar for concrete reinforcement',
      recentlyUsed: false,
      usageFrequency: 65,
      seasonalPricing: false
    },
    {
      id: 3,
      name: '2x4 Lumber - Treated',
      category: 'framing',
      categoryIcon: 'Home',
      unitPrice: 8.95,
      unit: 'per piece',
      stockStatus: 'in-stock',
      supplier: 'Lumber Depot',
      sku: 'LM-2X4-TR',
      taxCategory: 'materials',
      markup: 25,
      description: 'Pressure-treated lumber for framing applications',
      recentlyUsed: true,
      usageFrequency: 92,
      seasonalPricing: true
    },
    {
      id: 4,
      name: 'Electrical Wire 12AWG',
      category: 'electrical',
      categoryIcon: 'Zap',
      unitPrice: 2.35,
      unit: 'per foot',
      stockStatus: 'in-stock',
      supplier: 'ElectroMax',
      sku: 'EW-12AWG',
      taxCategory: 'materials',
      markup: 30,
      description: 'THHN/THWN copper wire for residential wiring',
      recentlyUsed: false,
      usageFrequency: 45,
      seasonalPricing: false
    },
    {
      id: 5,
      name: 'PVC Pipe 4 inch',
      category: 'plumbing',
      categoryIcon: 'Wrench',
      unitPrice: 12.50,
      unit: 'per foot',
      stockStatus: 'in-stock',
      supplier: 'PlumbPro Supply',
      sku: 'PVC-4IN',
      taxCategory: 'materials',
      markup: 22,
      description: 'Schedule 40 PVC pipe for drainage applications',
      recentlyUsed: true,
      usageFrequency: 78,
      seasonalPricing: false
    },
    {
      id: 6,
      name: 'Skilled Labor - Electrician',
      category: 'labor',
      categoryIcon: 'Users',
      unitPrice: 75.00,
      unit: 'per hour',
      stockStatus: 'available',
      supplier: 'Internal',
      sku: 'LAB-ELEC',
      taxCategory: 'labor',
      markup: 0,
      description: 'Licensed electrician for electrical installations',
      recentlyUsed: true,
      usageFrequency: 88,
      seasonalPricing: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid3X3' },
    { id: 'foundation', name: 'Foundation', icon: 'Building' },
    { id: 'framing', name: 'Framing', icon: 'Home' },
    { id: 'electrical', name: 'Electrical', icon: 'Zap' },
    { id: 'plumbing', name: 'Plumbing', icon: 'Wrench' },
    { id: 'labor', name: 'Labor', icon: 'Users' },
    { id: 'equipment', name: 'Equipment', icon: 'Truck' }
  ];

  const suppliers = [
    { id: 'all', name: 'All Suppliers' },
    { id: 'buildmart', name: 'BuildMart Supply' },
    { id: 'steel-supply', name: 'Steel Supply Co' },
    { id: 'lumber-depot', name: 'Lumber Depot' },
    { id: 'electromax', name: 'ElectroMax' },
    { id: 'plumbpro', name: 'PlumbPro Supply' }
  ];

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered?.filter(item =>
        item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        item?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        item?.sku?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(item => item?.category === selectedCategory);
    }

    // Price range filter
    if (priceRange?.min) {
      filtered = filtered?.filter(item => item?.unitPrice >= parseFloat(priceRange?.min));
    }
    if (priceRange?.max) {
      filtered = filtered?.filter(item => item?.unitPrice <= parseFloat(priceRange?.max));
    }

    // Supplier filter
    if (selectedSupplier !== 'all') {
      filtered = filtered?.filter(item => 
        item?.supplier?.toLowerCase()?.includes(selectedSupplier?.toLowerCase())
      );
    }

    // Sort items
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a?.unitPrice - b?.unitPrice;
        case 'usage':
          return b?.usageFrequency - a?.usageFrequency;
        case 'category':
          return a?.category?.localeCompare(b?.category);
        case 'name':
        default:
          return a?.name?.localeCompare(b?.name);
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, priceRange, selectedSupplier, sortBy]);

  // Recently used items
  const recentlyUsedItems = allItems?.filter(item => item?.recentlyUsed);

  // Handle item selection
  const handleItemSelect = (item, quantity = 1) => {
    setCartItems(prev => ({
      ...prev,
      [item?.id]: {
        ...item,
        quantity: (prev?.[item?.id]?.quantity || 0) + quantity,
        totalPrice: ((prev?.[item?.id]?.quantity || 0) + quantity) * item?.unitPrice * (1 + item?.markup / 100)
      }
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      const { [itemId]: removed, ...rest } = cartItems;
      setCartItems(rest);
    } else {
      setCartItems(prev => {
        const item = prev?.[itemId] || allItems?.find(i => i?.id === itemId);
        return {
          ...prev,
          [itemId]: {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item?.unitPrice * (1 + item?.markup / 100)
          }
        };
      });
    }
  };

  // Calculate cart total
  const cartTotal = Object?.values(cartItems)?.reduce((total, item) => total + item?.totalPrice, 0);
  const cartCount = Object?.keys(cartItems)?.length;

  // Handle add to quote/invoice
  const handleAddItems = () => {
    const itemsToAdd = Object?.values(cartItems)?.map(item => ({
      id: item?.id,
      name: item?.name,
      description: item?.description,
      quantity: item?.quantity,
      unitPrice: item?.unitPrice,
      unit: item?.unit,
      taxCategory: item?.taxCategory,
      markup: item?.markup,
      totalPrice: item?.totalPrice,
      sku: item?.sku,
      supplier: item?.supplier
    }));

    onItemsSelected(itemsToAdd);
    onClose();
    
    // Reset cart
    setCartItems({});
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSelectedSupplier('all');
    setSortBy('name');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-card border border-border rounded-lg construction-shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Select Items</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add items to your {mode === 'quote' ? 'quote' : 'invoice'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              iconName={viewMode === 'grid' ? 'List' : 'Grid3X3'}
            />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-border bg-muted/30">
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search items by name, description, or SKU..."
            />

            {/* Recently Used Items */}
            {recentlyUsedItems?.length > 0 && (
              <RecentlyUsedItems
                items={recentlyUsedItems}
                onItemSelect={handleItemSelect}
                cartItems={cartItems}
              />
            )}

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={priceRange?.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e?.target?.value }))}
                  className="w-24 h-9"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={priceRange?.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e?.target?.value }))}
                  className="w-24 h-9"
                />
              </div>

              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e?.target?.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                {suppliers?.map(supplier => (
                  <option key={supplier?.id} value={supplier?.id}>
                    {supplier?.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="usage">Sort by Usage</option>
                <option value="category">Sort by Category</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                iconName="X"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Items Grid/List */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] p-6">
          {filteredItems?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' :'space-y-3'
            }`}>
              {filteredItems?.map(item => (
                <ItemCard
                  key={item?.id}
                  item={item}
                  viewMode={viewMode}
                  onItemSelect={handleItemSelect}
                  isInCart={cartItems?.[item?.id]}
                  cartQuantity={cartItems?.[item?.id]?.quantity || 0}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shopping Cart Summary */}
        {cartCount > 0 && (
          <div className="border-t border-border bg-muted/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Cart Summary ({cartCount} items)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCartItems({})}
                iconName="Trash2"
              >
                Clear Cart
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 max-h-32 overflow-y-auto">
              {Object?.values(cartItems)?.map(item => (
                <div key={item?.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{item?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item?.unitPrice?.toFixed(2)} × {item?.quantity} = ${item?.totalPrice?.toFixed(2)}
                    </p>
                  </div>
                  <QuantityAdjuster
                    quantity={item?.quantity}
                    onQuantityChange={(newQuantity) => handleQuantityChange(item?.id, newQuantity)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Total: ${cartTotal?.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Includes markup and pricing adjustments
                </p>
              </div>
              <Button
                onClick={handleAddItems}
                iconName="Plus"
                iconPosition="left"
                size="lg"
              >
                Add to {mode === 'quote' ? 'Quote' : 'Invoice'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {filteredItems?.length} items found
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {cartCount === 0 && (
              <Button variant="outline" disabled>
                No items selected
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemSelectionModal;