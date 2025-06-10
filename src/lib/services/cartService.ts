import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export class CartService {
  // Buscar itens do carrinho do usuário
  static async getCartItems(userId: string): Promise<CartItem[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar itens do carrinho:', error);
      return [];
    }

    return data || [];
  }

  // Adicionar item ao carrinho
  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    // Verificar se o item já existe
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Atualizar quantidade
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) {
        console.error('Erro ao atualizar item do carrinho:', error);
        return false;
      }
    } else {
      // Criar novo item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity
        });

      if (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        return false;
      }
    }

    return true;
  }

  // Atualizar quantidade do item
  static async updateQuantity(userId: string, productId: string, quantity: number): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Erro ao atualizar quantidade:', error);
      return false;
    }

    return true;
  }

  // Remover item do carrinho
  static async removeFromCart(userId: string, productId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Erro ao remover item do carrinho:', error);
      return false;
    }

    return true;
  }

  // Limpar carrinho
  static async clearCart(userId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao limpar carrinho:', error);
      return false;
    }

    return true;
  }

  // Migrar carrinho do localStorage para o banco
  static async migrateLocalCart(userId: string, localCartItems: any[]): Promise<boolean> {
    if (!localCartItems.length) return true;

    try {
      for (const item of localCartItems) {
        await this.addToCart(userId, item.id, item.quantity);
      }
      return true;
    } catch (error) {
      console.error('Erro ao migrar carrinho local:', error);
      return false;
    }
  }
}