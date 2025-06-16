"use client";
import Image from "next/legacy/image";
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
import { Card, CardContent } from '@/components/ui/card';

interface ProductDetailClientContentProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClientContent({ product, relatedProducts }: ProductDetailClientContentProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(
    (product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/600x600.png'
  );
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    } else if (product) {
      setSelectedImage('https://placehold.co/600x600.png');
    }
  }, [product]);


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
  
  const categoryName = product.category_name || product.category;
  const categorySlug = categoryName?.toLowerCase().replace(/\s+/g, '-') || 'geral';


  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg border border-border">
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
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all border-2",
                    selectedImage === img ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setSelectedImage(img)}
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <Card className="shadow-xl bg-white border-primary/20">
          <CardContent className="p-6 space-y-3">
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-gray-800">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => <Star key={i} className={cn("h-5 w-5", i < 4 ? "fill-current" : "text-gray-300")} />)}
              </div>
              <span className="whitespace-nowrap">(123 avaliações)</span>
              {categoryName && (
                <>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span className="whitespace-nowrap">
                    Categoria: 
                    <Link 
                      href={`/category/${categorySlug}`} 
                      className="text-primary hover:underline ml-1 font-medium"
                    >
                      {categoryName}
                    </Link>
                  </span>
                </>
              )}
            </div>

            <p className="text-3xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>
            
            <p className="text-sm text-gray-600 leading-relaxed pt-1">{product.description}</p>

            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-semibold pt-1">Em estoque ({product.stock} unidades disponíveis)</p>
            ) : (
              <p className="text-sm text-red-500 font-semibold pt-1">Fora de estoque</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <Button
                size="lg"
                className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-sm"
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
                  "w-full sm:flex-1 rounded-md border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                  currentIsFavorite && "bg-primary text-primary-foreground"
                )}
                onClick={handleToggleFavorite}
                aria-label={currentIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={cn("mr-2 h-5 w-5", currentIsFavorite && "fill-current")} /> 
                {currentIsFavorite ? "Favorito" : "Adicionar Favorito"}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary px-0 mt-2">
              <Share2 className="mr-2 h-4 w-4" /> Compartilhar este produto
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for more details */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 bg-muted p-1 rounded-lg">
          <TabsTrigger value="description" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm rounded-md px-2 py-1.5 text-xs sm:text-sm sm:px-3">Descrição Completa</TabsTrigger>
          <TabsTrigger value="ingredients" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm rounded-md px-2 py-1.5 text-xs sm:text-sm sm:px-3">Ingredientes</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm rounded-md px-2 py-1.5 text-xs sm:text-sm sm:px-3">Avaliações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline mb-3 text-card-foreground">Detalhes do Produto</h3>
          <div className="space-y-3 text-card-foreground/80">
            <p className="whitespace-pre-line">{product.description}</p>
            {product.intendedUses && (
                <>
                    <h4 className="text-lg font-semibold mt-4 mb-1 text-card-foreground">Usos Pretendidos:</h4>
                    <p>{product.intendedUses}</p>
                </>
            )}
            <p className="mt-4 text-sm">Consulte sempre um profissional de saúde para orientações específicas.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="ingredients" className="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline mb-3 text-card-foreground">Composição e Ingredientes</h3>
          {product.ingredients ? (
            <ul className="list-disc list-inside space-y-1 text-card-foreground/80">
              {product.ingredients.split(',').map((ing, idx) => <li key={idx}>{ing.trim()}</li>)}
            </ul>
          ) : (
            <p className="text-card-foreground/80">Informação de ingredientes não disponível.</p>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline mb-3 text-card-foreground">Avaliações de Clientes</h3>
          <div className="text-center py-8 text-card-foreground/60">
            <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg">Nenhuma avaliação ainda.</p>
            <p className="text-sm">Seja o primeiro a avaliar este produto!</p>
            <Button variant="outline" className="mt-6">Escrever uma avaliação</Button>
          </div>
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
