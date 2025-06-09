
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
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

const productFormSchema = z.object({
  productName: z.string().min(3, "Nome do produto é obrigatório."),
  ingredients: z.string().min(5, "Ingredientes são obrigatórios."),
  intendedUses: z.string().min(5, "Usos pretendidos são obrigatórios."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero."),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo.").int("Estoque deve ser um número inteiro."),
  category: z.string().min(1, "Categoria é obrigatória."),
  // A descrição gerada pela IA não faz parte do schema do form principal, pois é gerenciada separadamente
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormAIProps {
  productToEdit?: Product;
}

export function ProductFormAI({ productToEdit }: ProductFormAIProps) {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const ingredientsValue = watch('ingredients');
  const intendedUsesValue = watch('intendedUses');

  useEffect(() => {
    if (productToEdit) {
      reset({
        productName: productToEdit.name,
        ingredients: productToEdit.ingredients || '',
        intendedUses: productToEdit.intendedUses || '',
        price: productToEdit.price,
        stock: productToEdit.stock,
        category: productToEdit.category,
      });
      // Se o produto já tiver uma descrição (que pode ter sido gerada pela IA ou manualmente), pré-preenchemos
      setGeneratedDescription(productToEdit.description || '');
    }
  }, [productToEdit, reset]);

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
    const finalProductData = { 
      ...data, 
      description: generatedDescription, // Inclui a descrição (gerada ou editada)
      id: productToEdit?.id, // Inclui o ID se estiver editando
      slug: productToEdit?.slug // Inclui o slug se estiver editando
    };
    
    if (productToEdit) {
      console.log("Atualizando produto:", finalProductData);
      // Aqui você chamaria a função para ATUALIZAR o produto no backend
      toast({
        title: "Produto Atualizado (Simulado)",
        description: `${data.productName} foi atualizado com sucesso.`,
      });
    } else {
      console.log("Criando novo produto:", finalProductData);
      // Aqui você chamaria a função para CRIAR um novo produto no backend
      toast({
        title: "Produto Criado (Simulado)",
        description: `${data.productName} foi criado com sucesso.`,
      });
    }
    // Em um cenário real, você pode querer redirecionar ou limpar o formulário após o sucesso
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {productToEdit ? 'Editar Produto' : 'Criar Novo Produto com IA'}
        </CardTitle>
        <CardDescription>
          {productToEdit ? 'Modifique os detalhes do produto abaixo.' : 'Preencha os detalhes do produto. Use a IA para gerar uma descrição atraente.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productName">Nome do Produto</Label>
            <Input id="productName" {...register('productName')} />
            {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

           <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" {...register('category')} placeholder="Ex: Medicamentos, Cosméticos"/>
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Ingredientes</Label>
            <Textarea id="ingredients" {...register('ingredients')} placeholder="Liste os principais ingredientes, separados por vírgula." rows={3} />
            {errors.ingredients && <p className="text-sm text-destructive">{errors.ingredients.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedUses">Usos Pretendidos / Benefícios</Label>
            <Textarea id="intendedUses" {...register('intendedUses')} placeholder="Descreva para que o produto serve e seus benefícios." rows={3} />
            {errors.intendedUses && <p className="text-sm text-destructive">{errors.intendedUses.message}</p>}
          </div>

          <Button 
            type="button" 
            onClick={handleGenerateDescription} 
            disabled={isGenerating || !ingredientsValue || !intendedUsesValue} 
            variant="outline"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Gerar/Regenerar Descrição com IA
          </Button>

          {(generatedDescription || productToEdit?.description) && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="generatedDescription">Descrição (edite se necessário)</Label>
              <Textarea
                id="generatedDescription"
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={6}
                className="border-primary focus:border-primary"
                placeholder="A descrição do produto aparecerá aqui..."
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isGenerating}>
            {productToEdit ? 'Salvar Alterações' : 'Salvar Produto'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
