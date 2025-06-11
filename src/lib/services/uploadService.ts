import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export class UploadService {
  private static log(level: 'info' | 'error', message: string, data?: any) {
    const emoji = level === 'info' ? '✅' : '💥';
    console.log(`${emoji} [UploadService] ${message}`, data || '');
  }

  private static sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50); // Limita o comprimento por segurança
  }

  static async uploadProductImage(file: File, productSlug: string): Promise<string | null> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return null;
    }
    if (!file || !productSlug) {
      this.log('error', 'File or product slug is missing.');
      return null;
    }
    
    const sanitizedSlug = this.sanitizeSlug(productSlug);
    this.log('info', `Starting image upload for slug: ${sanitizedSlug}`, { name: file.name, size: file.size, type: file.type });

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${sanitizedSlug}/${fileName}`;

    this.log('info', `Generated file path: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      this.log('error', 'Supabase upload failed.', uploadError);
      return null;
    }
    this.log('info', 'File uploaded successfully to storage.', uploadData);
    
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      this.log('error', 'Failed to get public URL.', { path: filePath });
      return null;
    }

    this.log('info', 'Public URL retrieved successfully.', { url: urlData.publicUrl });
    return urlData.publicUrl;
  }

  static async uploadMultipleImages(files: File[], productSlug: string): Promise<string[]> {
    if (!files || files.length === 0) {
      this.log('info', 'No files to upload.');
      return [];
    }

    this.log('info', `Starting upload for ${files.length} images for slug: ${productSlug}`);
    
    const uploadPromises = files.map(file => this.uploadProductImage(file, productSlug));
    const results = await Promise.all(uploadPromises);
    const validUrls = results.filter((url): url is string => url !== null);
    
    this.log('info', `Finished uploading. ${validUrls.length}/${files.length} successful.`);
    return validUrls;
  }
  
  static async deleteImage(imageUrl: string): Promise<boolean> {
    if (!supabase) {
      this.log('error', 'Supabase client is not initialized.');
      return false;
    }
    if (!imageUrl) {
      this.log('error', 'Image URL is missing.');
      return false;
    }
    
    // Extrai o caminho do arquivo da URL completa
    const url = new URL(imageUrl);
    const filePath = decodeURIComponent(url.pathname.split('/product-images/')[1]);

    if (!filePath) {
      this.log('error', 'Could not extract file path from URL.', { imageUrl });
      return false;
    }

    this.log('info', `Attempting to delete image from storage: ${filePath}`);
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      this.log('error', 'Failed to delete image from storage.', error);
      return false;
    }

    this.log('info', `Image deleted successfully: ${filePath}`);
    return true;
  }
}
