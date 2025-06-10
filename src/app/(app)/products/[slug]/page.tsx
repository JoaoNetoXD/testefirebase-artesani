
import { ProductService } from '@/lib/services/productService';
import { ProductDetailClientContent } from '@/components/products/ProductDetailClientContent';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await ProductService.getProductsByCategory(product.category_name || product.category);
  const filteredRelatedProducts = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  return <ProductDetailClientContent product={product} relatedProducts={filteredRelatedProducts} />;
}

// Para geração estática, você pode manter ou remover dependendo da necessidade
export async function generateStaticParams() {
  const products = await ProductService.getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

