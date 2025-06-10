import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/types';

export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }

    return data || [];
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      return [];
    }

    return data || [];
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }

    return data;
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return false;
    }

    return true;
  }

  static async getRecentOrders(limit: number = 5): Promise<Order[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      return [];
    }

    return data || [];
  }
}