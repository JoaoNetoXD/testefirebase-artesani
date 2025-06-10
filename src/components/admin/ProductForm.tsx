
"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PackagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductService } from '@/lib/services/productService';
import { CategoryService } from '@/lib/services/categoryService';
import { UploadService } from '@/lib/services/uploadService';
import { Upload, X } from 'lucide-react';

const productFormSchema = z.object({
  productName: z.string().min(3, "Nome do produto é obrigatório (mínimo 3 caracteres)."),
  slug: z.string().min(3, "Slug é obrigatório (mínimo 3 caracteres, use hífens para espaços).").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  description: z.string().min(10, "Descrição é obrigatória (mínimo 10 caracteres)."),
  ingredients: z.string().min(5, "Ingredientes são obrigatórios (mínimo 5 caracteres)."),
  intendedUses: z.string().min(5, "Usos pretendidos são obrigatórios (mínimo 5 caracteres)."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero.").positive("Preço deve ser positivo."),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo.").int("Estoque deve ser um número inteiro."),
  category: z.string().min(1, "Categoria é obrigatória."),
  imageUrls: z.string().optional().describe("URLs das imagens, separadas por vírgula."),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productToEdit?: Product;
}

export function ProductForm({ productToEdit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue, control, getValues } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: productToEdit?.name || '',
      slug: productToEdit?.slug || '',
      description: productToEdit?.description || '',
      ingredients: productToEdit?.ingredients || '',
      intendedUses: productToEdit?.intendedUses || '',
      price: productToEdit?.price || 0,
      stock: productToEdit?.stock || 0,
      category: productToEdit?.category_name || '',
      imageUrls: productToEdit?.images?.join(', ') || '',
    }
  });

  const productNameValue = watch('productName');

  useEffect(() => {
    if (productToEdit) {
      reset({
        productName: productToEdit.name,
        slug: productToEdit.slug,
        description: productToEdit.description,
        ingredients: productToEdit.ingredients || '',
        intendedUses: productToEdit.intendedUses || '',
        price: productToEdit.price,
        stock: productToEdit.stock,
        category: productToEdit.category_name, // Usar category_name
        imageUrls: productToEdit.images?.join(', ') || '',
      });
      if (productToEdit.images) {
        setUploadedImages(productToEdit.images);
      }
    }
  }, [productToEdit, reset]);

  useEffect(() => {
    // Only auto-generate slug if productNameValue exists AND
    // (it's a new product (no productToEdit) OR the existing productToEdit.slug is empty)
    if (productNameValue && (!productToEdit || !productToEdit.slug)) {
      const autoSlug = productNameValue
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters except hyphens
        .replace(/--+/g, '-'); // Replace multiple hyphens with a single one
      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [productNameValue, setValue, productToEdit]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      const imagesArray = uploadedImages.length > 0 ? uploadedImages : (data.imageUrls?.split(',').map(url => url.trim()).filter(url => url) || []);
      
      const productData: Partial<Product> = { // Use Partial<Product> para flexibilidade
        name: data.productName,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category_name: data.category, // Salvar como category_name
        ingredients: data.ingredients,
        intended_uses: data.intendedUses,
        images: imagesArray,
      };
      
      let result;
      if (productToEdit) {
        result = await ProductService.updateProduct(productToEdit.id, productData);
        if (result) {
          toast({
            title: "Produto Atualizado!",
            description: `${data.productName} foi atualizado com sucesso.`,
          });
        } else {
          throw new Error('Falha ao atualizar produto');
        }
      } else {
        // For new products, ensure all required fields for DB insertion are present
        const newProductData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'is_active'> & { is_active?: boolean } = {
          name: data.productName,
          slug: data.slug,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category_name: data.category,
          ingredients: data.ingredients,
          intended_uses: data.intendedUses,
          images: imagesArray,
          is_active: true, // Default to active for new products
        };
        result = await ProductService.createProduct(newProductData as any); // any for now due to omit mismatch
        
        if (result) {
          toast({
            title: "Produto Criado!",
            description: `${data.productName} foi criado com sucesso.`,
          });
          reset(); 
          setUploadedImages([]);
        } else {
          throw new Error('Falha ao criar produto');
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: error.message || "Ocorreu um erro ao salvar o produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const slug = watch('slug') || 'temp-product';
      const fileArray = Array.from(files);
      const uploadedUrls = await UploadService.uploadMultipleImages(fileArray, slug);
      
      setUploadedImages(prev => {
        const newImages = [...prev, ...uploadedUrls];
        setValue('imageUrls', newImages.join(', ')); // Update the form field as well
        return newImages;
      });
      
      toast({
        title: "Upload concluído!",
        description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
       // Reset the file input so the same file can be selected again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => {
      const newImages = prev.filter((_, index) => index !== indexToRemove);
      setValue('imageUrls', newImages.join(', '));
      return newImages;
    });
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <PackagePlus className="mr-3 h-6 w-6 text-primary" />
          {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </CardTitle>
        <CardDescription>
          {productToEdit ? 'Modifique os detalhes do produto abaixo.' : 'Preencha os detalhes do produto.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto</Label>
              <Input id="productName" {...register('productName')} placeholder="Ex: Creme Hidratante Avançado" />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug do Produto (URL)</Label>
              <Input id="slug" {...register('slug')} placeholder="Ex: creme-hidratante-avancado" />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto</Label>
            <Textarea 
              id="description" 
              {...register('description')} 
              rows={5}
              placeholder="Descreva o produto em detalhes, incluindo benefícios, modo de uso, etc."
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes</Label>
              <Textarea 
                id="ingredients" 
                {...register('ingredients')} 
                rows={3}
                placeholder="Ex: Água, glicerina, óleo essencial de lavanda..."
              />
              {errors.ingredients && <p className="text-sm text-destructive">{errors.ingredients.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="intendedUses">Usos Pretendidos</Label>
              <Textarea 
                id="intendedUses" 
                {...register('intendedUses')} 
                rows={3}
                placeholder="Ex: Hidratação da pele, uso diário, pele sensível..."
              />
              {errors.intendedUses && <p className="text-sm text-destructive">{errors.intendedUses.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} placeholder="Ex: 59.90" />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input id="stock" type="number" {...register('stock')} placeholder="Ex: 100" />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || productToEdit?.category_name}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Imagens do Produto</Label>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isUploading ? 'Enviando...' : 'Clique para selecionar imagens ou arraste aqui'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: JPG, PNG, WebP (máx. 5MB cada)
                </p>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded border border-border" />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remover imagem"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="imageUrls" className="text-xs text-muted-foreground">Ou insira URLs manualmente (separadas por vírgula)</Label>
              <Textarea 
                id="imageUrls" 
                {...register('imageUrls')} 
                placeholder="https://exemplo.com/imagem1.png, https://exemplo.com/imagem2.png" 
                rows={2}
                value={uploadedImages.join(', ')} // Sincronizar com o estado das imagens enviadas
                onChange={(e) => {
                  setValue('imageUrls', e.target.value); // Atualizar o valor do formulário
                  // Atualizar também o estado local 'uploadedImages' se desejar que a remoção manual de URL reflita no preview
                  setUploadedImages(e.target.value.split(',').map(url => url.trim()).filter(url => url));
                }}
              />
            </div>
          </div>

        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-3" 
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (productToEdit ? 'Salvar Alterações' : 'Adicionar Produto')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
          
