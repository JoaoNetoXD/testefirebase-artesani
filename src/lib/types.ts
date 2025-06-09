
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[]; // URLs
  category: string; // Category name
  slug: string;
  ingredients?: string;
  intendedUses?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
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
  shippingAddress: User['address'];
  createdAt: Date;
  updatedAt: Date;
}
