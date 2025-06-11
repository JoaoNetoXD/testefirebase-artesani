import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export class InventoryService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [InventoryService] ${message}`, data || '');
  }

  static async updateStock(productId: string, newStock: number, newStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }

    this.log('info', `Updating stock for product ID: ${productId} to ${newStock}...`);
    
    const updateData: { stock: number; status?: string; updated_at: string } = {
      stock: newStock,
      updated_at: new Date().toISOString(),
    };

    if (newStatus) {
      updateData.status = newStatus;
    }

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId);

    if (error) {
      this.log('error', `Failed to update stock for product ID: ${productId}.`, error);
      return false;
    }

    this.log('info', `Stock updated successfully for product ID: ${productId}.`);
    return true;
  }

  static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    
    this.log('info', `Fetching products with stock less than ${threshold}...`);
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('is_active', true)
      .lt('stock', threshold)
      .order('stock', { ascending: true });

    if (error) {
      this.log('error', 'Failed to fetch low stock products.', error);
      return [];
    }

    const products = (data || []).map(p => ({ ...p, category_name: p.category?.name || 'Sem Categoria' }));
    this.log('info', 'Successfully fetched low stock products.', products);
    return products;
  }

  static async getInventoryReport(): Promise<any[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }

    this.log('info', 'Generating inventory report...');
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock, price, status, category_name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      this.log('error', 'Failed to generate inventory report.', error);
      return [];
    }
    
    this.log('info', 'Successfully generated inventory report.', data);
    return data || [];
  }
  
  static async adjustStock(productId: string, quantityChange: number): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    this.log('info', `Adjusting stock for product ID: ${productId} by ${quantityChange}...`);

    const { data, error } = await supabase.rpc('adjust_stock', {
      product_id: productId,
      quantity_change: quantityChange
    });

    if (error) {
      this.log('error', `RPC Error adjusting stock for product ID: ${productId}.`, error);
      return false;
    }
    
    this.log('info', `Stock adjusted successfully for product ID: ${productId}.`, data);
    return data;
  }
}
