
import { getProductBySlug, mockProducts } from '@/lib/data';
import { ProductDetailClientContent } from '@/components/products/ProductDetailClientContent';
import type { Product } from '@/lib/types';

// Static generation for product pages
export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return <p className="text-center text-destructive py-8">Produto não encontrado.</p>;
  }

  const relatedProducts = mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return <ProductDetailClientContent product={product} relatedProducts={relatedProducts} />;
}

