
"use client";
import Image from "next/image";
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  index?: number; // Opcional para delay de animação
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
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

  const animationDelay = index ? `${index * 100}ms` : '0ms';
  const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://placehold.co/600x400.png';

  return (
    <Card 
      className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-card text-card-foreground animate-fade-in-up group"
      style={{ animationDelay }}
    >
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.slug}`} passHref className="block">
          <div className="aspect-[4/3] relative w-full overflow-hidden rounded-t-lg">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="product photo"
            />
          </div>
        </Link>
        <Button
            onClick={handleToggleFavorite}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-card/70 hover:bg-card text-destructive rounded-full h-9 w-9 transition-all active:scale-90"
            aria-label={currentIsFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            <Heart className={cn("h-5 w-5", currentIsFavorite ? "fill-destructive" : "text-destructive")} />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Link href={`/products/${product.slug}`} passHref>
          <CardTitle className="text-lg font-headline mb-1 hover:text-accent transition-colors">{product.name}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-card-foreground/80 mb-2 line-clamp-2 flex-grow">{product.description}</CardDescription>
        <p className="text-xl font-semibold text-accent mt-auto pt-2">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-xs text-destructive mt-1">Apenas {product.stock} em estoque!</p>
        )}
        {product.stock === 0 && (
           <p className="text-xs text-destructive font-semibold mt-1">Fora de estoque</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border">
        <div className="flex gap-2 w-full">
          <Button
            onClick={handleAddToCart}
            className="flex-grow bg-accent hover:bg-accent/90 text-accent-foreground rounded-md"
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? 'Indisponível' : 'Adicionar'}
          </Button>
          <Link href={`/products/${product.slug}`} passHref className="shrink-0">
            <Button variant="outline" className="border-muted text-muted-foreground hover:bg-muted hover:text-foreground rounded-md" aria-label="Ver detalhes">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
