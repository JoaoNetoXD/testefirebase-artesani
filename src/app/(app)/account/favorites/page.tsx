
import { ProductList } from "@/components/products/ProductList";
import { mockProducts } from "@/lib/data"; // Using mock for now
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  // Mock favorite products, in a real app this would come from user data
  const favoriteProducts = mockProducts.slice(0, 2); 

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meus Favoritos</h1>
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
          <p className="text-muted-foreground">Você ainda não adicionou nenhum produto aos favoritos.</p>
        </div>
        
      ) : (
        <ProductList products={favoriteProducts} />
      )}
    </div>
  );
}
