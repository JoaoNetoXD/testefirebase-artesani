
import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { mockProducts, mockCategories } from '@/lib/data';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

// Static generation for category pages
export async function generateStaticParams() {
  return mockCategories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const currentCategory = mockCategories.find(cat => cat.slug === params.slug);
  const productsInCategory = currentCategory 
    ? mockProducts.filter(p => p.category === currentCategory.name)
    : [];

  if (!currentCategory) {
    return <p className="text-center text-destructive py-8">Categoria não encontrada.</p>;
  }

  return (
    <div>
      <section className="mb-12 text-center py-12 bg-gradient-to-r from-primary to-green-700 rounded-lg shadow-xl">
        <h1 className="text-4xl font-headline font-bold text-primary-foreground mb-4">
          {currentCategory.name}
        </h1>
        <p className="text-lg text-primary-foreground/90">
          Explore nossa seleção de {currentCategory.name.toLowerCase()}.
        </p>
      </section>
      
      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center p-4 bg-card rounded-lg shadow">
            <div className="relative flex-grow w-full md:w-auto">
                <Input type="search" placeholder={`Buscar em ${currentCategory.name}...`} className="text-base pl-10 h-12" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button variant="outline" className="h-12 w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
            </Button>
        </div>
        <CategoryNavigation categories={mockCategories} currentCategorySlug={params.slug} />
      </section>

      <section>
        <h2 className="text-3xl font-headline font-semibold mb-6">Produtos em {currentCategory.name}</h2>
        <ProductList products={productsInCategory} />
      </section>
    </div>
  );
}
