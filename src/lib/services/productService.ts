import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

// ✅ CORREÇÃO: Definição correta do tipo ProductInput
type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category_name'> & {
  slug?: string;
};

export class ProductService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [ProductService] ${message}`, data || '');
  }

  // --- Funções de Leitura ---

  static async getAllProducts(includeArchived = false): Promise<Product[]> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return [];
    }
    let query = supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

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

  static async createProduct(productData: Partial<Product>): Promise<Product | null> {
    this.log('info', 'Attempting to create a new product...', productData);    
    // ✅ Log adicional para debug
    console.log('🔍 [DEBUG] ProductData recebido:', JSON.stringify(productData, null, 2));
    
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    
    const slug = productData.slug || this.generateSlug(productData.name);
    
    // ✅ Remover campos que não existem no banco
    const { category_name, ...dbData } = productData as any;
    
    // ✅ Limpar URLs das imagens - CORREÇÃO MELHORADA
    if (dbData.images && Array.isArray(dbData.images)) {
      dbData.images = dbData.images
        .map((url: string) => {
          if (typeof url === 'string') {
            // Remove backticks, aspas, espaços e quebras de linha mais rigorosamente
            return url.replace(/[`"'\s\r\n\t]/g, '').trim();
          }
          return url;
        })
        .filter(url => url && typeof url === 'string' && url.startsWith('http'));
    }
    
    // ✅ Log dos dados que serão enviados ao banco
    console.log('🔍 [DEBUG] Dados limpos para o banco:', JSON.stringify({ ...dbData, slug }, null, 2));
    
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        ...dbData, 
        slug, 
        updated_at: new Date().toISOString(), 
        is_active: true 
      }])
      .select('*, category:categories(name)')
      .single();
  
    if (error) {
      // ✅ Log detalhado do erro
      console.error('🔍 [DEBUG] Erro completo do Supabase:', error);
      this.log('error', 'Failed to create product', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint
      });
      return null;
    }
  
    this.log('info', 'Product created successfully!', data);
    return data ? { ...data, category_name: data.category?.name || 'Sem Categoria' } : null;
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
  
  static async archiveProduct(id: string): Promise<boolean> {
    this.log('info', `Attempting to soft delete product ID: ${id}`);
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
  
    // Alterado para soft delete: atualiza is_active para false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
  
    if (error) {
      this.log('error', `Failed to soft delete product ID: ${id}`, error);
      return false;
    }
  
    this.log('info', `Product ID: ${id} soft deleted successfully.`);
    return true;
  }

  static async hasOrders(productId: string): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }

    const { data, error } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (error) {
      this.log('error', `Failed to check orders for product ID: ${productId}`, error);
      return false;
    }

    return data && data.length > 0;
  }

  static async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    this.log('info', `Attempting to delete product ID: ${id}`);
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return { success: false, message: 'Supabase client is not initialized.' };
    }

    const hasOrders = await this.hasOrders(id);
    if (hasOrders) {
      const message = `Product ID: ${id} has associated orders and cannot be deleted.`;
      this.log('error', message);
      return { success: false, message: 'Este produto não pode ser excluído pois está associado a pedidos.' };
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      this.log('error', `Failed to delete product ID: ${id}`, error);
      return { success: false, message: 'Erro ao excluir o produto.' };
    }

    this.log('info', `Product ID: ${id} deleted successfully.`);
    return { success: true, message: 'Produto excluído com sucesso.' };
  }
}
