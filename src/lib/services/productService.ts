import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export class ProductService {
  // Buscar todos os produtos
  static async getAllProducts(): Promise<Product[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data || [];
  }

  // Buscar produto por slug
  static async getProductBySlug(slug: string): Promise<Product | null> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }

    return data;
  }

  // Buscar produtos por categoria
  static async getProductsByCategory(category: string): Promise<Product[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_name', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }

    return data || [];
  }

  // Criar novo produto
  static async createProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return null;
    }

    return data;
  }

  // Atualizar produto
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return null;
    }

    return data;
  }

  // Deletar produto (soft delete)
  static async deleteProduct(id: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return false;
    }

    return true;
  }

  // Buscar produtos com busca por texto
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ingredients.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data || [];
  }
}