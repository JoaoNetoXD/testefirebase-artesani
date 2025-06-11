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
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.log('error', 'Failed to fetch categories.', error);
      return [];
    }

    this.log('info', 'Successfully fetched all categories.', data);
    return data || [];
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
  
  static async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category | null> {
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

  static async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<Category | null> {
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

  static async deleteCategory(id: string): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    
    this.log('info', `Attempting to delete category ID: ${id}...`);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      this.log('error', `Failed to delete category ID: ${id}.`, error);
      return false;
    }
    
    this.log('info', `Category ID: ${id} deleted successfully.`);
    return true;
  }
}
