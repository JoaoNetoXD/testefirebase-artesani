
import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { CategoryService } from '@/lib/services/categoryService';
import { ProductService } from '@/lib/services/productService';
import type { Product, Category } from '@/lib/types';

export default async function AllProductsPage() {
  const products: Product[] = await ProductService.getAllProducts();
  const categories: Category[] = await CategoryService.getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-headline mb-4">Todos os Produtos</h1>
        <p className="text-lg text-muted-foreground">
          Explore nossa coleção completa de produtos farmacêuticos e manipulados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          {/* Pass undefined or no currentCategorySlug to CategoryNavigation */}
          {/* so "Todas" will be highlighted by default */}
          <CategoryNavigation categories={categories} />
        </aside>
        
        <main className="lg:col-span-3">
          {products.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                </p>
              </div>
              <ProductList products={products} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                Nenhum produto encontrado no momento.
              </p>
              <p className="text-muted-foreground">
                Volte em breve para ver novos produtos!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
