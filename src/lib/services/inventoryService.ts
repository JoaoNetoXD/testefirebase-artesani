import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export class InventoryService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [InventoryService] ${message}`, data || '');
  }

  static async updateStock(productId: string, newStock: number): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }

    this.log('info', `Updating stock for product ID: ${productId} to ${newStock}...`);
    
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
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

    const products = (data || []).map(p => ({ 
      ...p, 
      category_name: p.category?.name || 'Sem Categoria' 
    }));
    
    this.log('info', 'Successfully fetched low stock products.', products);
    return products;
  }

  static async getInventoryReport(): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }

    this.log('info', 'Generating inventory report...');
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('is_active', true)
      .order('name');

    if (error) {
      this.log('error', 'Failed to generate inventory report.', error);
      return [];
    }
    
    const products = (data || []).map(p => ({ 
      ...p, 
      category_name: p.category?.name || 'Sem Categoria' 
    }));
    
    this.log('info', 'Successfully generated inventory report.', products);
    return products;
  }
  
  static async adjustStock(productId: string, quantityChange: number): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    
    this.log('info', `Adjusting stock for product ID: ${productId} by ${quantityChange}...`);

    // Primeiro buscar o estoque atual
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single();

    if (fetchError) {
      this.log('error', `Failed to fetch current stock for product ID: ${productId}.`, fetchError);
      return false;
    }

    const newStock = Math.max(0, (currentProduct.stock || 0) + quantityChange);
    
    // Atualizar o estoque
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) {
      this.log('error', `Failed to adjust stock for product ID: ${productId}.`, error);
      return false;
    }
    
    this.log('info', `Stock adjusted successfully for product ID: ${productId}. New stock: ${newStock}`);
    return true;
  }
}
