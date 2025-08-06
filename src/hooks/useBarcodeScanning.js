import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toastHelper';

export const useBarcodeScanning = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchItemByBarcode = useCallback(async (barcode) => {
    if (!barcode) return null;

    try {
      setIsLoading(true);

      // Get user profile for company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // Search for item by barcode/SKU in the database
      const { data: items, error: itemsError } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .or(`sku.eq.${barcode},barcode.eq.${barcode}`)
        .limit(1);

      if (itemsError) throw itemsError;

      if (items && items.length > 0) {
        const item = items[0];
        
        // Transform database item to match component expectations
        const transformedItem = {
          id: item.id,
          name: item.name,
          category: item.category || 'general',
          unitPrice: item.unit_price || 0,
          unit: item.unit || 'each',
          supplier: item.supplier || 'Unknown',
          sku: item.sku || barcode,
          barcode: item.barcode || barcode,
          taxCategory: item.tax_category || 'materials',
          markup: item.markup_percentage || 0,
          description: item.description || '',
          stockQuantity: item.stock_quantity || 0,
          reorderLevel: item.reorder_level || 0,
          lastUpdated: item.updated_at
        };

        showSuccessToast(`Item found: ${item.name}`, '✅');
        return transformedItem;
      } else {
        showInfoToast(`No item found with barcode: ${barcode}`, '🔍');
        return null;
      }

    } catch (error) {
      console.error('Error searching for item by barcode:', error);
      showErrorToast('Failed to search for item');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItemFromBarcode = useCallback(async (barcode, itemData = {}) => {
    if (!barcode) return null;

    try {
      setIsLoading(true);

      // Get user profile for company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // Create new item with barcode
      const newItemData = {
        company_id: companyId,
        name: itemData.name || `Item ${barcode}`,
        description: itemData.description || '',
        category: itemData.category || 'general',
        unit_price: itemData.unitPrice || 0,
        unit: itemData.unit || 'each',
        supplier: itemData.supplier || '',
        sku: itemData.sku || barcode,
        barcode: barcode,
        tax_category: itemData.taxCategory || 'materials',
        markup_percentage: itemData.markup || 0,
        stock_quantity: itemData.stockQuantity || 0,
        reorder_level: itemData.reorderLevel || 0,
        is_active: true
      };

      const { data: newItem, error: createError } = await supabase
        .from('items_database')
        .insert(newItemData)
        .select()
        .single();

      if (createError) throw createError;

      showSuccessToast(`New item created: ${newItem.name}`, '🎉');
      
      // Transform back to component format
      return {
        id: newItem.id,
        name: newItem.name,
        category: newItem.category,
        unitPrice: newItem.unit_price,
        unit: newItem.unit,
        supplier: newItem.supplier,
        sku: newItem.sku,
        barcode: newItem.barcode,
        taxCategory: newItem.tax_category,
        markup: newItem.markup_percentage,
        description: newItem.description,
        stockQuantity: newItem.stock_quantity,
        reorderLevel: newItem.reorder_level,
        lastUpdated: newItem.created_at
      };

    } catch (error) {
      console.error('Error creating item from barcode:', error);
      showErrorToast('Failed to create item');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check if device supports barcode scanning
  const isBarcodeSupported = useCallback(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasCamera = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    return isMobile && hasCamera && isSecureContext;
  }, []);

  return {
    searchItemByBarcode,
    createItemFromBarcode,
    isBarcodeSupported,
    isLoading
  };
};