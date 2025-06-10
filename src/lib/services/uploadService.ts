import { supabase } from '@/lib/supabase';

export class UploadService {
  static async uploadProductImage(file: File, productSlug: string): Promise<string | null> {
    console.log('🚀 uploadProductImage iniciado para:', file.name);
    
    if (!supabase) {
      console.error('❌ Supabase não configurado');
      return null;
    }

    try {
      console.log('📁 Processando arquivo:', { name: file.name, size: file.size, type: file.type });
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${productSlug}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      console.log('📁 Caminho do arquivo gerado:', filePath);

      // Upload do arquivo
      console.log('⏳ Iniciando upload para o Supabase...');
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        console.error('❌ Erro no upload para Supabase:', error);
        return null;
      }

      console.log('✅ Upload realizado com sucesso:', data);

      // Obter URL pública
      console.log('🔗 Obtendo URL pública...');
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🌐 URL pública gerada:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Erro geral no upload:', error);
      return null;
    }
  }

  static async uploadMultipleImages(files: File[], productSlug: string): Promise<string[]> {
    console.log('📸 uploadMultipleImages iniciado para', files.length, 'arquivos');
    
    const uploadPromises = files.map((file, index) => {
      console.log(`📁 Criando promise ${index + 1}/${files.length} para:`, file.name);
      return this.uploadProductImage(file, productSlug);
    });
    
    console.log('⏳ Aguardando todos os uploads...');
    const results = await Promise.all(uploadPromises);
    
    console.log('📊 Resultados dos uploads:', results);
    const validUrls = results.filter(url => url !== null) as string[];
    console.log('✅ URLs válidas:', validUrls);
    
    return validUrls;
  }
}

// Procure pela função que gera o nome do arquivo e modifique para:
const generateFileName = (originalName: string, productName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  // Limitar o nome do produto a 20 caracteres e sanitizar
  const sanitizedProductName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 20)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${sanitizedProductName}-${timestamp}.${extension}`;
};