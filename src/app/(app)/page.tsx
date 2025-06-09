
import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { mockProducts, mockCategories } from '@/lib/data';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function HomePage() {
  // In a real app, products would be fetched based on filters/search
  const products = mockProducts; 
  const categories = mockCategories;

  return (
    <div>
      <section className="mb-12 text-center py-12 bg-gradient-to-r from-primary to-green-700 rounded-lg shadow-xl">
        <h1 className="text-5xl font-headline font-bold text-primary-foreground mb-4">Bem-vindo à Artesani Pharmacy</h1>
        <p className="text-xl text-primary-foreground/90 mb-8">Sua saúde e bem-estar em primeiro lugar, com produtos manipulados de alta qualidade.</p>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-opacity-90">
          Ver Produtos em Destaque
        </Button>
      </section>

      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center p-4 bg-card rounded-lg shadow">
            <div className="relative flex-grow w-full md:w-auto">
                <Input type="search" placeholder="O que você procura?" className="text-base pl-10 h-12" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button variant="outline" className="h-12 w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
            </Button>
        </div>
        <CategoryNavigation categories={categories} />
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-6">Nossos Produtos</h2>
        <ProductList products={products} />
      </section>
    </div>
  );
}
