import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export class CategoryService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [CategoryService] ${message}`, data || '');
  }

  static async getAllCategories(): Promise<Category[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }

    this.log('info', 'Fetching all categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('name', { ascending: true });

    if (error) {
      this.log('error', 'Failed to fetch categories.', error);
      return [];
    }

    this.log('info', 'Successfully fetched all categories.', data);
    return (data || []).map(c => ({
        ...c,
        product_count: c.products[0]?.count || 0
    }));
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }

    this.log('info', `Fetching category by ID: ${id}...`);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.log('error', `Failed to fetch category with ID: ${id}.`, error);
      return null;
    }

    this.log('info', `Successfully fetched category ID: ${id}.`, data);
    return data;
  }
  
  static async createCategory(categoryData: Omit<Category, 'id' | 'product_count'>): Promise<Category | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    this.log('info', 'Attempting to create a new category...', categoryData);
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      this.log('error', 'Failed to create category.', error);
      return null;
    }
    
    this.log('info', 'Category created successfully!', data);
    return data;
  }

  static async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id' | 'product_count'>>): Promise<Category | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    this.log('info', `Attempting to update category ID: ${id}...`, categoryData);
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.log('error', `Failed to update category ID: ${id}.`, error);
      return null;
    }
    
    this.log('info', `Category ID: ${id} updated successfully!`, data);
    return data;
  }

  static async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    if (!supabase) {
        this.log('error', 'Supabase client is not initialized.');
        return { success: false, message: 'Cliente Supabase não inicializado.' };
    }

    this.log('info', `Attempting to delete category ID: ${id}...`);

    // 1. Desassociar produtos da categoria
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({ category_id: null })
      .eq('category_id', id);

    if (productUpdateError) {
      this.log('error', `Failed to disassociate products from category ID: ${id}.`, productUpdateError);
      return { success: false, message: 'Falha ao desassociar produtos da categoria.' };
    }

    // 2. Proceder com a exclusão da categoria
    const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (deleteError) {
        this.log('error', `Failed to delete category ID: ${id}.`, deleteError);
        return { success: false, message: `Falha ao excluir a categoria: ${deleteError.message}` };
    }

    this.log('info', `Category ID: ${id} deleted successfully.`);
    return { success: true, message: 'Categoria excluída com sucesso e seus produtos foram desassociados.' };
  }
}
