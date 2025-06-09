"use client";
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-0">
        <Link href={`/products/${product.slug}`} passHref>
          <div className="aspect-video relative w-full overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint="product photo"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/products/${product.slug}`} passHref>
          <CardTitle className="text-lg font-headline mb-1 hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</CardDescription>
        <p className="text-lg font-semibold text-primary">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </p>
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-sm text-destructive mt-1">Apenas {product.stock} em estoque!</p>
        )}
        {product.stock === 0 && (
           <p className="text-sm text-destructive font-semibold mt-1">Fora de estoque</p>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-accent hover:bg-opacity-80 text-accent-foreground"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
}
