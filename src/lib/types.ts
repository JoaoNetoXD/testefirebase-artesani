export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category_id: string;
  slug: string;
  ingredients?: string;
  intended_uses?: string;
  tags?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  // Campo computado do JOIN
  category_name?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  product_count?: number;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: any;
  payment_method?: string;
  payment_status?: string;
  payment_intent_id?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
  products?: Product; // for compatibility with Supabase join
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  orderCount: number;
  joined: string;
  avatar?: string;
  recentOrders?: Order[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  newCustomers: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Novos tipos para Stripe
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  paymentStatus: string;
}
