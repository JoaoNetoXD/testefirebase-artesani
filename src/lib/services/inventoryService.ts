import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export class InventoryService {
  static async updateStock(productId: string, newStock: number): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (error) {
      console.error('Erro ao atualizar estoque:', error);
      return false;
    }

    return true;
  }

  static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .lt('stock', threshold)
      .order('stock', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      return [];
    }

    return data || [];
  }

  static async getInventoryReport(): Promise<any> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock, price, category_name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao gerar relatório de inventário:', error);
      return null;
    }

    return data;
  }
}