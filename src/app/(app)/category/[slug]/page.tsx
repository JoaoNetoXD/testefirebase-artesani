
import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { CategoryService } from '@/lib/services/categoryService';
import { ProductService } from '@/lib/services/productService';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  const categories = await CategoryService.getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Aguardar params antes de usar
  const { slug } = await params;
  
  // Buscar todas as categorias
  const categories = await CategoryService.getAllCategories();
  const currentCategory = categories.find(cat => cat.slug === slug);
  
  if (!currentCategory) {
    notFound();
  }

  // Buscar produtos reais do Supabase por categoria
  const products = await ProductService.getProductsByCategory(currentCategory.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-headline mb-4">{currentCategory.name}</h1>
        {currentCategory.description && (
          <p className="text-lg text-muted-foreground mb-6">{currentCategory.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <CategoryNavigation categories={categories} currentCategorySlug={slug} />
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
                Nenhum produto encontrado nesta categoria.
              </p>
              <Link href="/" className="text-primary hover:underline">
                Voltar à página inicial
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
// REMOVE THE DUPLICATE IMPORTS BELOW
// import Link from 'next/link';
// import { ProductList } from '@/components/products/ProductList';
