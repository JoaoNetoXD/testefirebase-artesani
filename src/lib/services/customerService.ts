import { supabase } from '@/lib/supabase';
import type { Customer } from '@/lib/types';

export class CustomerService {
  static async getAllCustomers(): Promise<Customer[]> {
    if (!supabase) {
      const errorMsg = 'Supabase não está configurado. Verifique as variáveis de ambiente.';
      console.error('Erro ao buscar clientes:', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Primeiro, buscar os profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw new Error(`Erro na consulta de profiles: ${profilesError.message}`);
      }

      // Depois, buscar os pedidos para cada profile
      const customers = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, total, created_at')
            .eq('user_id', profile.id); // Assumindo que a coluna é 'user_id'

          if (ordersError) {
            console.warn(`Erro ao buscar pedidos para ${profile.id}:`, ordersError);
          }

          const userOrders = orders || [];
          const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
          const orderCount = userOrders.length;

          return {
            id: profile.id,
            name: profile.name || 'Nome não informado',
            email: profile.email || '',
            totalSpent,
            orders: orderCount,
            joined: profile.created_at,
            avatar: profile.avatar_url || `https://placehold.co/40x40.png?text=${(profile.name || 'U').charAt(0).toUpperCase()}`
          };
        })
      );

      return customers;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
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