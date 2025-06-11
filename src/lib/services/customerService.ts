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
    const { data, error } = await supabase.rpc('get_all_customer_stats');

    if (error) {
      this.log('error', 'Failed to fetch customer stats via RPC.', error);
      return [];
    }

    const customers = (data || []).map(c => ({
      id: c.id,
      name: c.full_name || 'Usuário',
      email: c.email,
      totalSpent: c.total_spent || 0,
      orderCount: c.order_count || 0,
      joined: c.joined_at,
      avatar: c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name || c.email)}&background=0D8A6A&color=fff`,
    }));
    
    this.log('info', 'Successfully fetched all customer stats.', customers);
    return customers;
  }

  static async getCustomerById(customerId: string): Promise<Customer | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }

    this.log('info', `Fetching details for customer ID: ${customerId}...`);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        created_at,
        orders (id, total, created_at, status)
      `)
      .eq('id', customerId)
      .single();

    if (error) {
      this.log('error', `Failed to fetch customer ID: ${customerId}.`, error);
      return null;
    }

    const orders = data.orders || [];
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    const customer = {
      id: data.id,
      name: data.full_name || 'Usuário',
      email: data.email,
      totalSpent,
      orderCount: orders.length,
      joined: data.created_at,
      avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || data.email)}&background=0D8A6A&color=fff`,
      // Include recent orders if needed
      recentOrders: orders.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
    };
    
    this.log('info', `Successfully fetched details for customer ID: ${customerId}.`, customer);
    return customer;
  }
}
