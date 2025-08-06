import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import RecentlyUsedItems from './components/RecentlyUsedItems';
import ItemCard from './components/ItemCard';
import QuantityAdjuster from './components/QuantityAdjuster';
import { supabase } from '../../lib/supabase';

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
  const [allItems, setAllItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  // Load items from database
  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      setItemsError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // Load items from database
      const { data: itemsData, error: itemsError } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      if (itemsError) throw itemsError;

      // Transform database items to match component expectations
      const transformedItems = itemsData?.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || 'general',
        categoryIcon: getCategoryIcon(item.category),
        unitPrice: item.unit_price || 0,
        unit: item.unit || 'each',
        stockStatus: 'in-stock', // Could be enhanced with real stock data
        supplier: item.supplier || 'Unknown',
        sku: item.sku || '',
        taxCategory: item.tax_category || 'materials',
        markup: item.markup_percentage || 0,
        description: item.description || '',
        recentlyUsed: false, // Could be enhanced with usage tracking
        usageFrequency: 50, // Default value
        seasonalPricing: false
      })) || [];

      setAllItems(transformedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      setItemsError('Failed to load items. Please try again.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'foundation': 'Building',
      'framing': 'Home',
      'electrical': 'Zap',
      'plumbing': 'Wrench',
      'labor': 'Users',
      'equipment': 'Truck',
      'materials': 'Package',
      'general': 'Box'
    };
    return categoryIcons[category?.toLowerCase()] || 'Box';
  };

  // Generate categories and suppliers from loaded items
  const categories = useMemo(() => {
    const baseCategories = [{ id: 'all', name: 'All Categories', icon: 'Grid3X3' }];
    const uniqueCategories = [...new Set(allItems.map(item => item.category))];
    
    const categoryMap = {
      'foundation': { name: 'Foundation', icon: 'Building' },
      'framing': { name: 'Framing', icon: 'Home' },
      'electrical': { name: 'Electrical', icon: 'Zap' },
      'plumbing': { name: 'Plumbing', icon: 'Wrench' },
      'labor': { name: 'Labor', icon: 'Users' },
      'equipment': { name: 'Equipment', icon: 'Truck' },
      'materials': { name: 'Materials', icon: 'Package' },
      'general': { name: 'General', icon: 'Box' }
    };
    
    const dynamicCategories = uniqueCategories.map(cat => ({
      id: cat,
      name: categoryMap[cat]?.name || cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: categoryMap[cat]?.icon || 'Box'
    }));
    
    return [...baseCategories, ...dynamicCategories];
  }, [allItems]);

  const suppliers = useMemo(() => {
    const baseSuppliers = [{ id: 'all', name: 'All Suppliers' }];
    const uniqueSuppliers = [...new Set(allItems.map(item => item.supplier))];
    const dynamicSuppliers = uniqueSuppliers.map(supplier => ({
      id: supplier.toLowerCase().replace(/\s+/g, '-'),
      name: supplier
    }));
    
    return [...baseSuppliers, ...dynamicSuppliers];
  }, [allItems]);

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
          {isLoadingItems ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Loading items...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your items</p>
            </div>
          ) : itemsError ? (
            <div className="text-center py-12">
              <Icon name="AlertCircle" size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading items</h3>
              <p className="text-muted-foreground mb-4">{itemsError}</p>
              <Button onClick={loadItems} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredItems?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {allItems.length === 0 
                  ? 'No items available in your database. Add items to get started.' 
                  : 'Try adjusting your search or filter criteria'
                }
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