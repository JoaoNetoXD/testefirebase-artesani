import { supabase } from '@/lib/supabase';
import type { Customer } from '@/lib/types';

export class CustomerService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [CustomerService] ${message}`, data || '');
  }

  static async getAllCustomers(): Promise<Customer[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }

    this.log('info', 'Fetching all customers and their order stats...');
    
    // Buscar perfis de usuários
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email, created_at');

    if (profilesError) {
      this.log('error', 'Failed to fetch customer profiles.', profilesError);
      return [];
    }

    // Para cada perfil, buscar estatísticas de pedidos
    const customers = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total, created_at')
          .eq('user_id', profile.id)
          .neq('status', 'cancelled');

        if (ordersError) {
          this.log('error', `Failed to fetch orders for customer ${profile.id}.`, ordersError);
        }

        const totalSpent = (orders || []).reduce((sum, order) => sum + (order.total || 0), 0);
        const orderCount = (orders || []).length;

        return {
          id: profile.id,
          name: profile.name || 'Usuário',
          email: profile.email || '',
          totalSpent,
          orders: orderCount,
          orderCount,
          joined: profile.created_at,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email || 'User')}&background=0D8A6A&color=fff`,
        };
      })
    );
    
    this.log('info', 'Successfully fetched all customer stats.', customers);
    return customers;
  }

  static async getCustomerById(customerId: string): Promise<Customer | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }

    this.log('info', `Fetching details for customer ID: ${customerId}...`);
    
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .eq('id', customerId)
      .single();

    if (profileError) {
      this.log('error', `Failed to fetch customer profile ID: ${customerId}.`, profileError);
      return null;
    }

    // Buscar pedidos do usuário
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      this.log('error', `Failed to fetch orders for customer ID: ${customerId}.`, ordersError);
    }

    const validOrders = (orders || []).filter(order => order.status !== 'cancelled');
    const totalSpent = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    const customer = {
      id: profile.id,
      name: profile.name || 'Usuário',
      email: profile.email || '',
      totalSpent,
      orders: validOrders.length,
      orderCount: validOrders.length,
      joined: profile.created_at,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email || 'User')}&background=0D8A6A&color=fff`,
      recentOrders: (orders || []).slice(0, 5)
    };
    
    this.log('info', `Successfully fetched details for customer ID: ${customerId}.`, customer);
    return customer;
  }
}
