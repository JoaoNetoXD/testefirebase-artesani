
"use client";

import { useState, useTransition } from 'react';
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

const productFormSchema = z.object({
  productName: z.string().min(3, "Nome do produto é obrigatório."),
  ingredients: z.string().min(5, "Ingredientes são obrigatórios."),
  intendedUses: z.string().min(5, "Usos pretendidos são obrigatórios."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero."),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo.").int("Estoque deve ser um número inteiro."),
  category: z.string().min(1, "Categoria é obrigatória."),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductFormAI() {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

  const ingredients = watch('ingredients');
  const intendedUses = watch('intendedUses');

  const handleGenerateDescription = async () => {
    if (!ingredients || !intendedUses) {
      toast({
        title: "Campos Faltando",
        description: "Por favor, preencha os ingredientes e usos pretendidos para gerar a descrição.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const input: GenerateProductDescriptionInput = { ingredients, intendedUses };
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
    console.log({ ...data, description: generatedDescription });
    // Here you would typically save the product data to your backend
    toast({
      title: "Produto Salvo (Simulado)",
      description: `${data.productName} foi salvo com sucesso.`,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Criar Novo Produto com IA</CardTitle>
        <CardDescription>Preencha os detalhes do produto. Use a IA para gerar uma descrição atraente.</CardDescription>
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

          <Button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !ingredients || !intendedUses} variant="outline">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Gerar Descrição com IA
          </Button>

          {generatedDescription && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="generatedDescription">Descrição Gerada (edite se necessário)</Label>
              <Textarea
                id="generatedDescription"
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={6}
                className="border-primary focus:border-primary"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isGenerating}>
            Salvar Produto
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
