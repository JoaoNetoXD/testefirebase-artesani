
"use client";
import { ProductForm } from '@/components/admin/ProductForm';
// Remover: import { mockProducts, getProductBySlug } from '@/lib/data';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function EditProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await ProductService.getProductBySlug(params.slug);
        setProduct(productData);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">Produto não encontrado</h1>
        <p className="text-muted-foreground">O produto que você está tentando editar não existe.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Editar Produto</h1>
      <ProductForm productToEdit={product} />
    </div>
  );
}
