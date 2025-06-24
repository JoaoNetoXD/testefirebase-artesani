
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, Upload, X, ImagePlus, Trash2 } from 'lucide-react';
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
import Image from "next/legacy/image";
import { useRouter } from 'next/navigation';

const productFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: z.string().min(3, "O slug deve ter no mínimo 3 caracteres.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido. Use apenas letras minúsculas, números e hífens."),
  description: z.string().min(10, "A descrição deve ter no mínimo 10 caracteres."),
  ingredients: z.string().optional(),
  intended_uses: z.string().optional(),
  tags: z.string().optional(),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que R$0,01.").positive("O preço deve ser um número positivo."),
  stock: z.coerce.number().min(0, "O estoque não pode ser negativo.").int("O estoque deve ser um número inteiro."),
  category_id: z.string().uuid("A categoria é obrigatória."),
  images: z.array(z.string().url("URL da imagem inválida.")).optional(),
  is_active: z.boolean().default(true),
})
.refine((data) => {
  // A validação real será feita no componente
  return true;
}, {
  message: "Pelo menos uma imagem é obrigatória.",
  path: ["images"]
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  productToEdit?: Product;
}

export function ProductForm({ productToEdit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isDirty }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productToEdit ? {
        ...productToEdit,
        price: Number(productToEdit.price),
        stock: Number(productToEdit.stock),
        ingredients: productToEdit.ingredients || '',
        intended_uses: productToEdit.intended_uses || '',
        tags: productToEdit.tags || '',
        is_active: productToEdit.is_active,
    } : {
      name: '', slug: '', description: '',
      ingredients: '', intended_uses: '', tags: '',
      price: 0, stock: 0, category_id: undefined,
      images: [], is_active: true,
    }
  });

  const nameValue = watch('name');

  const generateSlug = useCallback((name: string) => {
    return name.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-').replace(/--+/g, '-');
  }, []);

  useEffect(() => {
    if (nameValue && !productToEdit) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, setValue, productToEdit, generateSlug]);
  
  useEffect(() => {
    CategoryService.getAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const totalImages = (watch('images')?.length || 0) + files.length;
      if (totalImages > 5) {
          toast({ title: "Limite de Imagens", description: "Você pode ter no máximo 5 imagens por produto.", variant: "destructive" });
          return;
      }
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = async (urlOrPreview: string, isExisting: boolean) => {
    if (isExisting) {
      const newImageUrls = watch('images').filter(url => url !== urlOrPreview);
      setValue('images', newImageUrls, { shouldValidate: true, shouldDirty: true });
    } else {
      const indexToRemove = previews.indexOf(urlOrPreview);
      if (indexToRemove > -1) {
        setPreviews(p => p.filter((_, i) => i !== indexToRemove));
        setImageFiles(f => f.filter((_, i) => i !== indexToRemove));
      }
    }
  };

  const validateImages = () => {
    const existingImages = watch('images') || [];
    const totalImages = existingImages.length + imageFiles.length;
    return totalImages > 0;
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!validateImages()) {
      toast({
        title: "Erro de validação",
        description: "Pelo menos uma imagem é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        setIsUploading(true);
        uploadedUrls = await UploadService.uploadMultipleImages(imageFiles, data.slug);
        if (uploadedUrls.length !== imageFiles.length) {
          throw new Error("Falha no upload de algumas imagens.");
        }
        setIsUploading(false);
      }
      
      const cleanExistingUrls = (data.images || []).map(url => 
        url.replace(/[`"'\s
	]/g, '').trim()
      ).filter(url => url && url.startsWith('http'));
      
      const cleanUploadedUrls = uploadedUrls.map(url => 
        url.replace(/[`"'\s
	]/g, '').trim()
      ).filter(url => url && url.startsWith('http'));
      
      const finalImageUrls = [...cleanExistingUrls, ...cleanUploadedUrls];

      const productPayload = {
        ...data,
        images: finalImageUrls,
      };

      let result: Product | null;

      if (productToEdit) {
        const originalImages = productToEdit.images || [];
        const imagesToDelete = originalImages.filter(img => !finalImageUrls.includes(img));
        for (const imgUrl of imagesToDelete) {
          await UploadService.deleteImage(imgUrl);
        }
        result = await ProductService.updateProduct(productToEdit.id, productPayload);
      } else {
        result = await ProductService.createProduct(productPayload);
      }
      
      if (!result) throw new Error("Ocorreu um erro ao salvar o produto.");

      toast({
        title: "Sucesso!",
        description: productToEdit ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
      });

      router.push('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-primary-foreground/5 border-primary-foreground/10 text-primary-foreground">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl font-headline flex items-center text-white">
                <Package className="mr-3 h-6 w-6 text-secondary" />
                {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}
                </CardTitle>
                <CardDescription className="text-primary-foreground/60">
                Preencha os detalhes abaixo. Campos marcados com * são obrigatórios.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="images" required>Imagens do Produto</Label>
              <div className="border-2 border-dashed border-primary-foreground/20 rounded-lg p-6 text-center hover:border-secondary transition-colors">
                <input type="file" multiple accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageSelection} className="hidden" id="image-upload" disabled={isSubmitting}/>
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <ImagePlus className="h-10 w-10 text-primary-foreground/40" />
                  <span className="text-sm text-primary-foreground/70">
                    {isUploading ? 'Enviando...' : 'Clique ou arraste para adicionar imagens'}
                  </span>
                  <span className="text-xs text-primary-foreground/50">PNG, JPG, WebP (Máx 5MB, até 5 imagens)</span>
                </label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-4">
                  {watch('images')?.map((url) => (
                    <div key={url} className="relative group aspect-square">
                      <Image src={url} alt="Imagem existente" layout="fill" className="object-cover rounded-md border border-primary-foreground/20" />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(url, true)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {previews.map((previewUrl) => (
                     <div key={previewUrl} className="relative group aspect-square">
                      <Image src={previewUrl} alt="Prévia da nova imagem" layout="fill" className="object-cover rounded-md border-2 border-secondary" />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(previewUrl, false)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
              {errors.images && <p className="text-sm text-destructive mt-2">{errors.images.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name" required>Nome do Produto</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="slug" required>Slug (URL)</Label>
                <Input id="slug" {...register('slug')} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="description" required>Descrição</Label>
                <Textarea id="description" {...register('description')} rows={5} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <Tabs defaultValue="essentials">
              <TabsList className="grid w-full grid-cols-3 bg-primary-foreground/5">
                <TabsTrigger value="essentials">Essencial</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="organization">Organização</TabsTrigger>
              </TabsList>
              <TabsContent value="essentials" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="price" required>Preço (R$)</Label>
                        <Input id="price" type="number" step="0.01" {...register('price')} />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock" required>Estoque</Label>
                        <Input id="stock" type="number" {...register('stock')} />
                        {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                    </div>
                  </div>
              </TabsContent>
               <TabsContent value="details" className="pt-6 space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="ingredients">Composição / Ingredientes</Label>
                      <Textarea id="ingredients" {...register('ingredients')} placeholder="Ex: Colágeno Tipo II, Vitamina C, Magnésio..."/>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="intended_uses">Indicações de Uso</Label>
                      <Textarea id="intended_uses" {...register('intended_uses')} placeholder="Ex: Fortalecimento das articulações, melhora da pele..."/>
                  </div>
              </TabsContent>
              <TabsContent value="organization" className="pt-6 space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="category_id" required>Categoria</Label>
                    <Controller name="category_id" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}/>
                    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input id="tags" {...register('tags')} placeholder="Ex: sem glúten, articulações, beleza" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="is_active">Status do Produto</Label>
                     <Controller name="is_active" control={control} render={({ field }) => (
                        <Select onValueChange={(v) => field.onChange(v === 'true')} value={String(field.value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Ativo (Visível na loja)</SelectItem>
                            <SelectItem value="false">Inativo (Oculto na loja)</SelectItem>
                        </SelectContent>
                        </Select>
                    )}/>
                </div>
              </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="border-t border-primary-foreground/10 pt-6">
          <Button type="submit" size="lg" className="w-full" variant="secondary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (productToEdit ? 'Salvar Alterações' : 'Criar Produto')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
