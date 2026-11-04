// src/services/menuService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { MenuItem, MenuCategory } from '../types/menu';
import { initialMenuItems } from '../data/initialMenu';
import { getSupabaseClient } from '../utils/supabase';

export const menuService = {
  /**
   * Fetch menu items for restaurant
   */
  async getMenuItems(restaurantId?: string): Promise<ApiResponse<MenuItem[]>> {
    if (isDemoMode()) {
      return createSuccessResponse(initialMenuItems);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      let query = client.from('menu_items').select('*');
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }
      const { data, error } = await query;

      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }

      const items: MenuItem[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category_id || 'Main Course',
        price: Number(row.price) || 0,
        discountPrice: row.discount_price ? Number(row.discount_price) : undefined,
        description: row.description || '',
        imageUrl: row.image_url || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        isAvailable: Boolean(row.is_available),
        isVeg: Boolean(row.is_veg),
        isBestSeller: Boolean(row.is_bestseller),
        rating: Number(row.rating) || 4.8,
        votes: 120,
        prepTimeMinutes: row.preparation_time || 15,
      }));

      return createSuccessResponse(items);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to fetch menu');
    }
  },

  /**
   * Add new dish to menu
   */
  async addMenuItem(
    restaurantId: string,
    item: Omit<MenuItem, 'id' | 'rating' | 'votes'>
  ): Promise<ApiResponse<MenuItem>> {
    if (isDemoMode()) {
      const newItem: MenuItem = {
        ...item,
        id: 'item-' + Date.now(),
        rating: 5.0,
        votes: 1,
      };
      return createSuccessResponse(newItem);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { data, error } = await client
        .from('menu_items')
        .insert({
          restaurant_id: restaurantId,
          name: item.name.trim(),
          description: item.description,
          price: item.price,
          discount_price: item.discountPrice || null,
          image_url: item.imageUrl,
          is_available: item.isAvailable,
          is_veg: item.isVeg,
          is_bestseller: item.isBestSeller || false,
          preparation_time: item.prepTimeMinutes || 15,
        })
        .select()
        .single();

      if (error || !data) {
        return createErrorResponse('BAD_REQUEST', error?.message || 'Failed to insert menu item');
      }

      const created: MenuItem = {
        id: data.id,
        name: data.name,
        category: data.category_id || item.category,
        price: Number(data.price),
        discountPrice: data.discount_price ? Number(data.discount_price) : undefined,
        description: data.description,
        imageUrl: data.image_url,
        isAvailable: data.is_available,
        isVeg: data.is_veg,
        isBestSeller: data.is_bestseller,
        rating: 5.0,
        votes: 1,
        prepTimeMinutes: data.preparation_time,
      };

      return createSuccessResponse(created);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Error creating menu item');
    }
  },

  /**
   * Update menu item
   */
  async updateMenuItem(
    itemId: string,
    updates: Partial<MenuItem>
  ): Promise<ApiResponse<Partial<MenuItem>>> {
    if (isDemoMode()) {
      return createSuccessResponse(updates);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.discountPrice !== undefined) dbUpdates.discount_price = updates.discountPrice;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
      if (updates.isVeg !== undefined) dbUpdates.is_veg = updates.isVeg;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

      const { error } = await client.from('menu_items').update(dbUpdates).eq('id', itemId);
      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }
      return createSuccessResponse(updates);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Error updating item');
    }
  },

  /**
   * Delete menu item
   */
  async deleteMenuItem(itemId: string): Promise<ApiResponse<boolean>> {
    if (isDemoMode()) {
      return createSuccessResponse(true);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { error } = await client.from('menu_items').delete().eq('id', itemId);
      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }
      return createSuccessResponse(true);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Error deleting item');
    }
  },
};
