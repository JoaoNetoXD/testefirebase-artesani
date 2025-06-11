
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PackagePlus, Upload, X } from 'lucide-react';
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
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const productFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: z.string().min(3, "O slug deve ter no mínimo 3 caracteres.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido."),
  description: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres."),
  ingredients: z.string().optional(),
  intendedUses: z.string().optional(),
  tags: z.string().optional(),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que R$0,01.").positive(),
  stock: z.coerce.number().min(0, "O estoque não pode ser negativo.").int(),
  category_id: z.string().min(1, "A categoria é obrigatória."),
  images: z.array(z.string().url("URL da imagem inválida.")).min(1, "Pelo menos uma imagem é obrigatória."),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productToEdit?: Product;
}

export function ProductForm({ productToEdit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(productToEdit?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      ingredients: '',
      intendedUses: '',
      tags: '',
      price: 0,
      stock: 0,
      category_id: '',
      images: [],
      status: 'active',
    }
  });
  
  const productNameValue = watch('name');

  const generateSlug = useCallback((name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  }, []);

  useEffect(() => {
    if (productToEdit) {
      const formData = {
        name: productToEdit.name,
        slug: productToEdit.slug,
        description: productToEdit.description,
        ingredients: productToEdit.ingredients || '',
        intendedUses: productToEdit.intendedUses || '',
        tags: productToEdit.tags || '',
        price: productToEdit.price,
        stock: productToEdit.stock,
        category_id: productToEdit.category_id,
        images: productToEdit.images || [],
        status: productToEdit.status || 'active'
      };
      reset(formData);
      setExistingImageUrls(productToEdit.images || []);
    }
  }, [productToEdit, reset]);

  useEffect(() => {
    // Auto-generate slug only for new products
    if (productNameValue && !productToEdit) {
      setValue('slug', generateSlug(productNameValue), { shouldValidate: true });
    }
  }, [productNameValue, setValue, productToEdit, generateSlug]);

  useEffect(() => {
    CategoryService.getAllCategories().then(setCategories);
  }, []);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const removeImage = async (urlToRemove: string, isExisting: boolean) => {
    if (isExisting) {
      // Optimistic UI update
      const newImageUrls = existingImageUrls.filter(url => url !== urlToRemove);
      setExistingImageUrls(newImageUrls);
      setValue('images', newImageUrls, { shouldValidate: true });

      try {
        const success = await UploadService.deleteImage(urlToRemove);
        if (success) {
          toast({ title: "Imagem removida do armazenamento." });
        } else {
          // Revert on failure
          setExistingImageUrls(prev => [...prev, urlToRemove]);
          setValue('images', [...newImageUrls, urlToRemove], { shouldValidate: true });
          toast({ title: "Falha ao remover imagem do armazenamento.", variant: "destructive" });
        }
      } catch (error) {
        setExistingImageUrls(prev => [...prev, urlToRemove]);
        toast({ title: "Erro ao remover imagem.", variant: "destructive" });
      }
    } else {
      // Logic for removing newly selected files (not implemented for brevity)
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setIsUploading(true); // Indicate upload process has started
    
    try {
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await UploadService.uploadMultipleImages(imageFiles, data.slug);
        if (uploadedUrls.length !== imageFiles.length) {
          throw new Error("Falha no upload de algumas imagens. Verifique e tente novamente.");
        }
      }
      
      const finalImageUrls = [...existingImageUrls, ...uploadedUrls];
      
      const productPayload = {
        ...data,
        images: finalImageUrls,
      };

      const result = productToEdit 
        ? await ProductService.updateProduct(productToEdit.id, productPayload)
        : await ProductService.createProduct(productPayload);

      if (!result) throw new Error("Ocorreu um erro ao salvar o produto no banco de dados.");

      toast({
        title: "Sucesso!",
        description: `Produto ${productToEdit ? 'atualizado' : 'criado'} com sucesso.`,
      });
      router.push('/admin/products');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast({
        title: "Erro ao Salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <PackagePlus className="mr-3 h-6 w-6 text-primary" />
          {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo. Campos marcados com * são obrigatórios.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="images">Imagens do Produto *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageSelection}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isUploading ? 'Enviando...' : 'Clique para selecionar ou arraste as imagens'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP (Máx 5MB)</span>
              </label>
            </div>
            {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-4">
                {existingImageUrls.map((url) => (
                  <div key={url} className="relative group">
                    <Image src={url} alt="Imagem existente" width={100} height={100} className="w-full h-24 object-cover rounded-md border" />
                    <button type="button" onClick={() => removeImage(url, true)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Preview for new files would go here */}
              </div>
            )}
            {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input id="slug" {...register('slug')} readOnly={!!productToEdit} />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea id="description" {...register('description')} rows={5} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque *</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
            </div>
          </div>

          {/* More fields here */}

        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (productToEdit ? 'Salvar Alterações' : 'Criar Produto')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
