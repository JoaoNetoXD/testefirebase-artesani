
"use client";
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { ProductList } from '@/components/products/ProductList';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailClientContentProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClientContent({ product, relatedProducts }: ProductDetailClientContentProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery */}
        <div className="bg-card p-4 rounded-lg shadow-md">
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              data-ai-hint="product photography"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div key={index} className="relative aspect-square border rounded-md overflow-hidden cursor-pointer hover:border-primary">
                  <Image src={img} alt={`${product.name} - thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint="product thumbnail" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-headline font-bold">{product.name}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={i < 4 ? "fill-current" : ""} size={20}/>)}
            </div>
            <span>(123 avaliações)</span>
            <span>|</span>
            <span>Categoria: <a href="#" className="text-primary hover:underline">{product.category}</a></span>
          </div>
          <p className="text-3xl font-semibold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed">{product.description}</p>
          
          {product.stock > 0 ? (
             <p className="text-green-600 font-semibold">Em estoque ({product.stock} unidades)</p>
          ) : (
            <p className="text-destructive font-semibold">Fora de estoque</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-accent hover:bg-opacity-90 text-accent-foreground" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Heart className="mr-2 h-5 w-5" /> Adicionar aos Favoritos
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>

      {/* Tabs for more details */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4">
          <TabsTrigger value="description">Descrição Completa</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-6 bg-card rounded-md shadow">
          <h3 className="text-xl font-headline mb-2">Detalhes do Produto</h3>
          <p className="text-foreground/80 whitespace-pre-line">{product.description}\n\nMais informações sobre o uso e benefícios do produto aqui. Consulte sempre um profissional de saúde.</p>
        </TabsContent>
        <TabsContent value="ingredients" className="p-6 bg-card rounded-md shadow">
          <h3 className="text-xl font-headline mb-2">Composição</h3>
          <ul className="list-disc list-inside text-foreground/80">
            {product.ingredients?.split(',').map(ing => <li key={ing.trim()}>{ing.trim()}</li>) || <li>Informação não disponível.</li>}
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="p-6 bg-card rounded-md shadow">
          <h3 className="text-xl font-headline mb-2">Avaliações de Clientes</h3>
          <p className="text-foreground/80">Funcionalidade de avaliações a ser implementada.</p>
          {/* Placeholder for reviews */}
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-semibold mb-6">Produtos Relacionados</h2>
          <ProductList products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
