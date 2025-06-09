
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProductDescription, type GenerateProductDescriptionInput } from '@/ai/flows/generate-product-description';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { mockCategories } from '@/lib/data'; // For category suggestions
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const productFormSchema = z.object({
  productName: z.string().min(3, "Nome do produto é obrigatório (mínimo 3 caracteres)."),
  slug: z.string().min(3, "Slug é obrigatório (mínimo 3 caracteres, use hífens para espaços).").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens."),
  ingredients: z.string().min(5, "Ingredientes são obrigatórios (mínimo 5 caracteres)."),
  intendedUses: z.string().min(5, "Usos pretendidos são obrigatórios (mínimo 5 caracteres)."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero.").positive("Preço deve ser positivo."),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo.").int("Estoque deve ser um número inteiro."),
  category: z.string().min(1, "Categoria é obrigatória."),
  imageUrls: z.string().optional().describe("URLs das imagens, separadas por vírgula."),
  // A descrição gerada pela IA não faz parte do schema do form principal
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormAIProps {
  productToEdit?: Product;
}

export function ProductFormAI({ productToEdit }: ProductFormAIProps) {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue, control } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: productToEdit?.name || '',
      slug: productToEdit?.slug || '',
      ingredients: productToEdit?.ingredients || '',
      intendedUses: productToEdit?.intendedUses || '',
      price: productToEdit?.price || 0,
      stock: productToEdit?.stock || 0,
      category: productToEdit?.category || '',
      imageUrls: productToEdit?.images?.join(', ') || '',
    }
  });

  const ingredientsValue = watch('ingredients');
  const intendedUsesValue = watch('intendedUses');
  const productNameValue = watch('productName');

  useEffect(() => {
    if (productToEdit) {
      reset({
        productName: productToEdit.name,
        slug: productToEdit.slug,
        ingredients: productToEdit.ingredients || '',
        intendedUses: productToEdit.intendedUses || '',
        price: productToEdit.price,
        stock: productToEdit.stock,
        category: productToEdit.category,
        imageUrls: productToEdit.images?.join(', ') || '',
      });
      setGeneratedDescription(productToEdit.description || '');
    }
  }, [productToEdit, reset]);

  // Auto-generate slug from product name (simple version)
  useEffect(() => {
    if (productNameValue && !productToEdit) { // Only auto-generate for new products or if slug is empty
      const autoSlug = productNameValue
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters except hyphens
        .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
      setValue('slug', autoSlug, { shouldValidate: true });
    }
  }, [productNameValue, setValue, productToEdit]);


  const handleGenerateDescription = async () => {
    if (!ingredientsValue || !intendedUsesValue) {
      toast({
        title: "Campos Faltando",
        description: "Por favor, preencha os ingredientes e usos pretendidos para gerar a descrição.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: GenerateProductDescriptionInput = { ingredients: ingredientsValue, intendedUses: intendedUsesValue };
        const result = await generateProductDescription(input);
        setGeneratedDescription(result.description);
        toast({
          title: "Descrição Gerada!",
          description: "A descrição do produto foi gerada com sucesso.",
        });
      } catch (error) {
        console.error("Error generating description:", error);
        toast({
          title: "Erro ao Gerar Descrição",
          description: "Não foi possível gerar a descrição. Tente novamente.",
          variant: "destructive",
        });
        setGeneratedDescription('');
      }
    });
  };

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    // Convert imageUrls string back to array, filter empty strings
    const imagesArray = data.imageUrls?.split(',').map(url => url.trim()).filter(url => url) || [];

    const finalProductData = { 
      ...data, 
      description: generatedDescription,
      images: imagesArray, // Use the processed array
      id: productToEdit?.id || `prod_${Date.now()}`, // Generate ID if new
      slug: data.slug, // Slug is now part of the form
    };
    
    // Remove imageUrls as it's not part of the Product type
    delete (finalProductData as any).imageUrls;
    
    if (productToEdit) {
      console.log("Atualizando produto (simulado):", finalProductData);
      // Backend logic to update product
      toast({
        title: "Produto Atualizado (Simulado)",
        description: `${data.productName} foi atualizado com sucesso.`,
      });
    } else {
      console.log("Criando novo produto (simulado):", finalProductData);
      // Backend logic to create product
      toast({
        title: "Produto Criado (Simulado)",
        description: `${data.productName} foi criado com sucesso.`,
      });
      // reset(); // Optionally reset form after creation
      // setGeneratedDescription('');
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center">
          <Wand2 className="mr-3 h-6 w-6 text-primary" />
          {productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto com IA'}
        </CardTitle>
        <CardDescription>
          {productToEdit ? 'Modifique os detalhes do produto abaixo.' : 'Preencha os detalhes do produto. Use a IA para gerar uma descrição atraente e informativa.'}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                        <SelectItem value="Outra">Outra (Nova)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrls">URLs das Imagens (separadas por vírgula)</Label>
            <Textarea id="imageUrls" {...register('imageUrls')} placeholder="https://exemplo.com/imagem1.png, https://exemplo.com/imagem2.png" rows={2} />
            <p className="text-xs text-muted-foreground flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Use URLs públicas. Uma imagem por URL. Para múltiplas, separe com vírgula. A primeira será a principal.
            </p>
            {errors.imageUrls && <p className="text-sm text-destructive">{errors.imageUrls.message}</p>}
          </div>


          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredientes Principais</Label>
            <Textarea id="ingredients" {...register('ingredients')} placeholder="Liste os principais ingredientes, separados por vírgula ou em linhas. Ex: Ácido Hialurônico, Vitamina C, Extrato de Aloe Vera" rows={3} />
            {errors.ingredients && <p className="text-sm text-destructive">{errors.ingredients.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedUses">Usos Pretendidos / Benefícios</Label>
            <Textarea id="intendedUses" {...register('intendedUses')} placeholder="Descreva para que o produto serve, seus principais benefícios e modo de uso. Ex: Hidratação profunda, combate sinais de envelhecimento, aplicar no rosto limpo duas vezes ao dia." rows={4} />
            {errors.intendedUses && <p className="text-sm text-destructive">{errors.intendedUses.message}</p>}
          </div>

          <Button 
            type="button" 
            onClick={handleGenerateDescription} 
            disabled={isGenerating || !ingredientsValue || !intendedUsesValue} 
            variant="outline"
            className="w-full md:w-auto"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Gerar/Regenerar Descrição com IA
          </Button>

          {(generatedDescription || productToEdit?.description) && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="generatedDescription">Descrição Completa do Produto (edite se necessário)</Label>
              <Textarea
                id="generatedDescription"
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={8}
                className="border-primary focus:border-primary bg-muted/30"
                placeholder="A descrição do produto gerada pela IA aparecerá aqui. Revise e edite conforme necessário."
              />
               <p className="text-xs text-muted-foreground">Esta descrição será exibida na página do produto.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-3" disabled={isGenerating}>
            <Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isGenerating && 'hidden'}`} />
            {productToEdit ? 'Salvar Alterações no Produto' : 'Adicionar Produto ao Catálogo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
