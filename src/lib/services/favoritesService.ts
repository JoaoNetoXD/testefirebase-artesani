import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export interface FavoriteItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

export class FavoritesService {
  // Buscar favoritos do usuário
  static async getFavorites(userId: string): Promise<FavoriteItem[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }

    return data || [];
  }

  // Adicionar aos favoritos
  static async addToFavorites(userId: string, productId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId
      });

    if (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return false;
    }

    return true;
  }

  // Remover dos favoritos
  static async removeFromFavorites(userId: string, productId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return false;
    }

    return true;
  }

  // Verificar se produto está nos favoritos
  static async isFavorite(userId: string, productId: string): Promise<boolean> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }

    return !!data;
  }

  // Migrar favoritos do localStorage para o banco
  static async migrateLocalFavorites(userId: string, localFavorites: any[]): Promise<boolean> {
    if (!localFavorites.length) return true;

    try {
      for (const item of localFavorites) {
        await this.addToFavorites(userId, item.id);
      }
      return true;
    } catch (error) {
      console.error('Erro ao migrar favoritos locais:', error);
      return false;
    }
  }
}