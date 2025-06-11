import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

// O tipo agora reflete que 'id', 'created_at', e 'updated_at' são gerenciados pelo DB
type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'> & { slug?: string };

export class ProductService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [ProductService] ${message}`, data || '');
  }

  // --- Funções de Leitura ---

  static async getAllProducts(): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', 'Failed to fetch all products', error);
      return [];
    }
    
    // Mapear para adicionar category_name
    return (data || []).map(p => ({ ...p, category_name: p.category?.name || 'Sem Categoria' }));
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
     if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      this.log('error', `Failed to fetch product with slug: ${slug}`, error);
      return null;
    }
    
    return data ? { ...data, category_name: data.category?.name || 'Sem Categoria' } : null;
  }
  
  static async getProductById(id: string): Promise<Product | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      this.log('error', `Failed to fetch product with ID: ${id}`, error);
      return null;
    }

    return data ? { ...data, category_name: data.category?.name || 'Sem Categoria' } : null;
  }


  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', `Failed to fetch products for category ID: ${categoryId}`, error);
      return [];
    }
    return (data || []).map(p => ({ ...p, category_name: p.category?.name || 'Sem Categoria' }));
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      this.log('error', 'Product search failed', error);
      return [];
    }
    return (data || []).map(p => ({ ...p, category_name: p.category?.name || 'Sem Categoria' }));
  }

  // --- Funções de Escrita ---

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  static async createProduct(productData: ProductInput): Promise<Product | null> {
    this.log('info', 'Attempting to create a new product...', productData);
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    const slug = productData.slug || this.generateSlug(productData.name);

    const { data, error } = await supabase
      .from('products')
      .insert([{ ...productData, slug, updated_at: new Date().toISOString(), is_active: true }])
      .select()
      .single();

    if (error) {
      this.log('error', 'Failed to create product', {
        message: error.message,
        details: error.details,
        code: error.code
      });
      return null;
    }

    this.log('info', 'Product created successfully!', data);
    return data;
  }

  static async updateProduct(id: string, productData: Partial<ProductInput>): Promise<Product | null> {
    this.log('info', `Attempting to update product ID: ${id}`, productData);
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.log('error', `Failed to update product ID: ${id}`, error);
      return null;
    }

    this.log('info', `Product ID: ${id} updated successfully!`, data);
    return data;
  }
  
  static async deleteProduct(id: string): Promise<boolean> {
    this.log('info', `Attempting to soft-delete product ID: ${id}`);
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }

    // Soft delete mudando o status para 'archived' e 'is_active' para false
    const { error } = await supabase
      .from('products')
      .update({ 
        is_active: false, 
        status: 'archived',
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      this.log('error', `Failed to soft-delete product ID: ${id}`, error);
      return false;
    }

    this.log('info', `Product ID: ${id} soft-deleted successfully.`);
    return true;
  }
}
