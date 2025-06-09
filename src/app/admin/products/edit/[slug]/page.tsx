
import { ProductFormAI } from '@/components/admin/ProductFormAI';
import { mockProducts, getProductBySlug } from '@/lib/data'; // Assumindo que getProductBySlug existe
import type { Product } from '@/lib/types';

// Esta função é opcional se você não estiver usando SSG intensamente para esta rota admin
// ou se os slugs dos produtos não forem conhecidos em tempo de build.
// Se for usar, ela ajudaria o Next.js a saber quais slugs existem.
// export async function generateStaticParams() {
//   return mockProducts.map((product) => ({
//     slug: product.slug,
//   }));
// }

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
      <ProductFormAI productToEdit={product} />
    </div>
  );
}
