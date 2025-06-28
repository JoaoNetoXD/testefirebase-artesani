import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/lib/types';
import { InventoryService } from './inventoryService';

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
        customer:profiles(name, email),
        order_items:order_items(
          *,
          product:products(name, slug)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', 'Failed to fetch all orders.', error);
      return [];
    }
    
    // Enrich data
    const orders = (data || []).map(o => ({
      ...o,
      customer_name: o.customer?.name || 'N/A',
      customer_email: o.customer?.email || 'N/A'
    }));
    
    this.log('info', 'Successfully fetched all orders.', orders);
    return orders;
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
        customer:profiles(name, email),
        order_items:order_items(
          *,
          product:products(name, slug, images)
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
      customer_name: data.customer?.name || 'N/A',
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
          product:products(name, slug, images)
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
    
    try {
      // Criar o pedido primeiro
      const { data: orderRecord, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          total: orderData.total,
          status: orderData.status || 'pending',
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          payment_status: orderData.payment_status,
          payment_intent_id: orderData.payment_intent_id,
          stripe_session_id: orderData.stripe_session_id,
        }])
        .select()
        .single();

      if (orderError) {
        this.log('error', 'Failed to create order.', orderError);
        return null;
      }

      // Criar os itens do pedido
      if (orderData.order_items && orderData.order_items.length > 0) {
        const orderItems = orderData.order_items.map(item => ({
          ...item,
          order_id: orderRecord.id
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          this.log('error', 'Failed to create order items.', itemsError);
          // Limpar o pedido criado se falhar ao criar itens
          await supabase.from('orders').delete().eq('id', orderRecord.id);
          return null;
        }

        // Atualizar o estoque dos produtos
        for (const item of orderData.order_items) {
          const stockUpdated = await InventoryService.adjustStock(item.product_id, -item.quantity);
          if (!stockUpdated) {
            this.log('error', `Failed to update stock for product ${item.product_id}`);
            // Opcional: reverter o pedido se falhar ao atualizar estoque
          }
        }
      }

      this.log('info', 'Order created successfully!', orderRecord);
      return this.getOrderById(orderRecord.id);
    } catch (error) {
      this.log('error', 'Unexpected error creating order.', error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    
    this.log('info', `Updating status for order ID: ${orderId} to ${status}...`);
    
    // Se o pedido está sendo cancelado, restaurar o estoque
    if (status === 'cancelled') {
      const order = await this.getOrderById(orderId);
      if (order && order.order_items) {
        for (const item of order.order_items) {
          const stockRestored = await InventoryService.adjustStock(item.product_id, item.quantity);
          if (!stockRestored) {
            this.log('error', `Failed to restore stock for product ${item.product_id}`);
          }
        }
      }
    }
    
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

  static async updateOrder(orderId: string, updateData: Partial<Order>): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    
    this.log('info', `Updating order ID: ${orderId}...`, updateData);
    
    const { error } = await supabase
      .from('orders')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      this.log('error', `Failed to update order ID: ${orderId}.`, error);
      return false;
    }
    
    this.log('info', `Order updated successfully for ID: ${orderId}.`);
    return true;
  }
}
