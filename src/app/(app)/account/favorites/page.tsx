
"use client";
import { ProductList } from "@/components/products/ProductList";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { favorites } = useFavorites(); 

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meus Favoritos</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <Heart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
          <p className="text-muted-foreground mb-6">Você ainda não adicionou nenhum produto aos favoritos.</p>
          <Link href="/" passHref>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Explorar Produtos
            </Button>
          </Link>
        </div>
        
      ) : (
        <ProductList products={favorites} />
      )}
    </div>
  );
}
