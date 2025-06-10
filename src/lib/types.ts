
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category_name: string; // Mudança: usar category_name em vez de category
  slug: string;
  ingredients?: string;
  intendedUses?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: any;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
  customer_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orders: number;
  joined: string;
  avatar?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  description?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  newCustomers: number;
}

export interface CartItem extends Product {
  quantity: number;
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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentType: 'credit_card' | 'pix';
  paymentIntentId?: string; // Stripe Payment Intent ID
  stripeSessionId?: string; // Stripe Checkout Session ID
  shippingAddress: User['address'];
  createdAt: Date;
  updatedAt: Date;
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
