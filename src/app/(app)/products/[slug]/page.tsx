
import { ProductService } from '@/lib/services/productService';
import { ProductDetailClientContent } from '@/components/products/ProductDetailClientContent';
import { notFound } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await ProductService.getProductBySlug(params.slug);

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

