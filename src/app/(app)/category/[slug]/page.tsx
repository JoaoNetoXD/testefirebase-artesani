
import { ProductList } from '@/components/products/ProductList';
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

export default async function CategoryPage({ params }: { params: Promise<{ slug:string }> }) {
  const { slug } = await params;
  
  const categories = await CategoryService.getAllCategories();
  const currentCategory = categories.find(cat => cat.slug === slug);
  
  if (!currentCategory) {
    notFound();
  }

  const products = await ProductService.getProductsByCategory(currentCategory.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-block bg-primary-foreground/5 rounded-full shadow-md shadow-black/20 animate-pulse-light hover:bg-primary-foreground/10">
            <h1 className="text-4xl font-headline px-8 py-3 text-primary-foreground">{currentCategory.name}</h1>
        </div>
        {currentCategory.description && (
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">{currentCategory.description}</p>
        )}
      </div>

      <main>
        {products.length > 0 ? (
          <>
            <div className="mb-6 text-center md:text-left">
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
  );
}
