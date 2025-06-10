
"use client";
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { ProductList } from '@/components/products/ProductList';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductDetailClientContentProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClientContent({ product, relatedProducts }: ProductDetailClientContentProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const currentIsFavorite = isClientMounted && isFavorite(product.id);

  const handleToggleFavorite = () => {
    toggleFavorite(product);
    toast({
      title: currentIsFavorite ? "Removido dos Favoritos" : "Adicionado aos Favoritos",
      description: `${product.name} foi ${currentIsFavorite ? 'removido dos' : 'adicionado aos'} seus favoritos.`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery */}
        <div className="bg-card p-4 rounded-lg shadow-md">
          <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              data-ai-hint="product photography"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-square border rounded-md overflow-hidden cursor-pointer transition-all",
                    selectedImage === img ? "border-primary ring-2 ring-primary" : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setSelectedImage(img)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(img)}
                  aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    data-ai-hint="product thumbnail"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-headline font-bold text-foreground">{product.name}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-5 w-5", i < 4 ? "fill-current" : "")} />)}
            </div>
            <span>(123 avaliações)</span>
            <span>|</span>
            {(product.category || product.category_name) && (
              <span>
                Categoria: 
                <Link 
                  href={`/category/${(product.category || product.category_name)?.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="text-accent hover:underline"
                >
                  {product.category || product.category_name}
                </Link>
              </span>
            )}
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
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "w-full sm:w-auto border-primary text-primary hover:bg-primary/10",
                currentIsFavorite && "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20 hover:text-destructive"
              )}
              onClick={handleToggleFavorite}
              aria-label={currentIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={cn("mr-2 h-5 w-5", currentIsFavorite ? "fill-destructive text-destructive" : "text-destructive")} />
              {currentIsFavorite ? "Remover Favorito" : "Adicionar Favorito"}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </div>

      {/* Tabs for more details */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4 bg-muted">
          <TabsTrigger value="description" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground">Descrição Completa</TabsTrigger>
          <TabsTrigger value="ingredients" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground">Ingredientes</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground">Avaliações</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="p-6 bg-muted rounded-md shadow-lg text-muted-foreground">
          <h3 className="text-xl font-headline mb-2 text-foreground">Detalhes do Produto</h3>
          <p className="whitespace-pre-line">{product.description}\n\nMais informações sobre o uso e benefícios do produto aqui. Consulte sempre um profissional de saúde.</p>
        </TabsContent>
        <TabsContent value="ingredients" className="p-6 bg-muted rounded-md shadow-lg text-muted-foreground">
          <h3 className="text-xl font-headline mb-2 text-foreground">Composição</h3>
          <ul className="list-disc list-inside">
            {product.ingredients?.split(',').map(ing => <li key={ing.trim()}>{ing.trim()}</li>) || <li>Informação não disponível.</li>}
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="p-6 bg-muted rounded-md shadow-lg text-muted-foreground">
          <h3 className="text-xl font-headline mb-2 text-foreground">Avaliações de Clientes</h3>
          <p>Funcionalidade de avaliações a ser implementada.</p>
          {/* Placeholder for reviews */}
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-headline font-semibold mb-6 text-foreground">Produtos Relacionados</h2>
          <ProductList products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
