
import { ProductForm } from '@/components/admin/ProductForm';
import { mockProducts, getProductBySlug } from '@/lib/data';
import type { Product } from '@/lib/types';


export default function EditProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);

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
