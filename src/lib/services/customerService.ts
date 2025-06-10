import { supabase } from '@/lib/supabase';
import type { Customer } from '@/lib/types';

export class CustomerService {
  static async getAllCustomers(): Promise<Customer[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        orders (id, total, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }

    // Calcular estatísticas dos clientes
    const customers = data?.map(profile => {
      const orders = profile.orders || [];
      const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const orderCount = orders.length;

      return {
        id: profile.id,
        name: profile.name || 'Nome não informado',
        email: profile.email || '',
        totalSpent,
        orders: orderCount,
        joined: profile.created_at,
        avatar: profile.avatar_url || `https://placehold.co/40x40.png?text=${(profile.name || 'U').charAt(0).toUpperCase()}`
      };
    }) || [];

    return customers;
  }

  static async getCustomerById(customerId: string): Promise<Customer | null> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        orders (id, total, created_at)
      `)
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    const orders = data.orders || [];
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const orderCount = orders.length;

    return {
      id: data.id,
      name: data.name || 'Nome não informado',
      email: data.email || '',
      totalSpent,
      orders: orderCount,
      joined: data.created_at,
      avatar: data.avatar_url || `https://placehold.co/40x40.png?text=${(data.name || 'U').charAt(0).toUpperCase()}`
    };
  }
}