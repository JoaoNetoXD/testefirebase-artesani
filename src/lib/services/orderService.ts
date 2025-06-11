import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/lib/types';

type OrderInput = Omit<Order, 'id' | 'created_at' | 'order_items'> & {
  order_items: Omit<OrderItem, 'id' | 'order_id'>[];
};

export class OrderService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [OrderService] ${message}`, data || '');
  }

  static async getAllOrders(): Promise<Order[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }

    this.log('info', 'Fetching all orders with items and customer names...');
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles(full_name, email),
        order_items:order_items(
          *,
          product:products(name, sku)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', 'Failed to fetch all orders.', error);
      return [];
    }
    
    // Enrich data
    const orders = data.map(o => ({
      ...o,
      customer_name: o.customer?.full_name || 'N/A',
      customer_email: o.customer?.email || 'N/A'
    }));
    
    this.log('info', 'Successfully fetched all orders.', orders);
    return orders || [];
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    this.log('info', `Fetching order by ID: ${orderId}...`);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:profiles(full_name, email),
        order_items:order_items(
          *,
          product:products(name, sku, images)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      this.log('error', `Failed to fetch order ID: ${orderId}.`, error);
      return null;
    }

    const order = {
      ...data,
      customer_name: data.customer?.full_name || 'N/A',
      customer_email: data.customer?.email || 'N/A'
    };
    
    this.log('info', `Successfully fetched order ID: ${orderId}.`, order);
    return order;
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    
    this.log('info', `Fetching orders for user ID: ${userId}...`);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          product:products(name, sku, images)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', `Failed to fetch orders for user ID: ${userId}.`, error);
      return [];
    }
    
    this.log('info', `Successfully fetched orders for user ID: ${userId}.`, data);
    return data || [];
  }

  static async createOrder(orderData: OrderInput): Promise<Order | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    this.log('info', 'Attempting to create a new order...', orderData);
    const { data, error } = await supabase.rpc('create_order', {
      p_user_id: orderData.user_id,
      p_total: orderData.total,
      p_status: orderData.status,
      p_shipping_address: orderData.shipping_address,
      p_payment_method: orderData.payment_method,
      p_payment_status: orderData.payment_status,
      p_order_items: orderData.order_items
    });

    if (error) {
      this.log('error', 'Failed to create order via RPC.', error);
      return null;
    }
    
    this.log('info', 'Order created successfully!', data);
    // The RPC should return the newly created order, but we might need to fetch it again if not
    return this.getOrderById(data); 
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    
    this.log('info', `Updating status for order ID: ${orderId} to ${status}...`);
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      this.log('error', `Failed to update status for order ID: ${orderId}.`, error);
      return false;
    }
    
    this.log('info', `Status updated successfully for order ID: ${orderId}.`);
    return true;
  }
}
