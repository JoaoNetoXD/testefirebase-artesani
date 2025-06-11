import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    if (!supabase) {
      console.error('Supabase não está configurado');
      return [];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('name', ['Manipulados', 'Cosméticos', 'Suplementos'])
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    return data || [];
  }
}