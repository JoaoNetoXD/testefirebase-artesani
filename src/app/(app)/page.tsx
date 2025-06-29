import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { Button } from "@/components/ui/button";
import { Truck, ClipboardList, Award, ChevronDown } from "lucide-react";
import SafeImage from "@/components/shared/SafeImage";
import Link from 'next/link';
import { ProductService } from '@/lib/services/productService';
import { CategoryService } from '@/lib/services/categoryService';
import type { Product, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let hasError = false;

  try {
    const [productsData, categoriesData] = await Promise.all([
      ProductService.getAllProducts().catch(() => []),
      CategoryService.getAllCategories().catch(() => [])
    ]);
    
    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    hasError = true;
  }

  const benefits = [
    { icon: Award, title: "Qualidade Garantida", description: "Produtos com certificação." },
    { icon: Truck, title: "Entrega Rápida", description: "Receba em todo o Brasil." },
    { icon: ClipboardList, title: "Pedidos Online", description: "Fácil e seguro." },
  ];

  return (
    <div className="text-foreground"> {/* Ensure text color contrasts with dark background */}
      {/* Hero Section */}
      <section className="py-4 md:py-20 overflow-hidden"> {/* Reduced vertical padding for mobile */}
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-8 md:gap-12">
          {/* Text and Image Content */}
          <div className="flex flex-col items-center md:items-start space-y-6 text-center md:text-left animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-headline font-bold tracking-wide -mt-2 sm:-mt-4">
              Sua Saúde em <span className="text-secondary">Boas Mãos</span>
            </h1>

            {/* Product Image - Positioned here for mobile */}
            <div
              className="w-full flex justify-center md:hidden mt-4 animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="relative w-full max-w-md">
                <SafeImage
                  src="/images/products/3produtosincial.png"
                  alt="Produtos Artesani em destaque"
                  width={1600}
                  height={1200}
                  sizes="(max-width: 768px) 110vw, 850px"
                  className="object-contain w-full h-auto drop-shadow-none transform transition-all duration-700 hover:scale-105 scale-110"
                  priority
                  fallbackSrc="https://placehold.co/1600x1200.png"
                />
              </div>
            </div>

            <p className="text-lg md:text-xl text-foreground/80 text-center max-w-prose">
              Produtos manipulados, cosméticos e suplementos de alta qualidade, desenvolvidos especialmente para suas necessidades.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 w-full">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex flex-col items-center text-center p-4 rounded-xl border border-white/10 hover:bg-primary-foreground/5 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${200 + index * 150}ms` }}
                >
                  <benefit.icon className="h-8 w-8 text-secondary mb-2" />
                  <h3 className="font-semibold text-md">{benefit.title}</h3>
                  <p className="text-xs text-foreground/70">{benefit.description}</p>
                </div>
              ))}
            </div>
            <div
              className="w-full flex flex-col items-center justify-center pt-8"
            >
                <CategoryNavigation categories={categories} />
                 <div className="w-full text-center pt-8 animate-bounce">
                    <ChevronDown className="h-8 w-8 text-secondary mx-auto" />
                </div>
            </div>
          </div>

          {/* Right Column: New Product Image - Hidden on mobile */}
          <div
            className="hidden md:flex justify-end mt-0 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl md:rounded-2xl">
              <SafeImage
                src="/images/products/3produtosincial.png"
                alt="Produtos Artesani em destaque"
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 130vw, (max-width: 1024px) 65vw, 850px"
                className="object-contain w-full h-auto drop-shadow-none transform transition-all duration-700 hover:scale-105 animate-pulse-slow scale-100"
                priority
                fallbackSrc="https://placehold.co/1600x1200.png"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary-foreground/5 overflow-hidden"> {/* Added overflow-hidden */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-3">Nossos Produtos</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
             Explore nossas categorias de manipulados, cosméticos e suplementos, todos com a mais alta qualidade e eficácia.
            </p>
          </div>
          
          {hasError ? (
            <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">
                Erro de Configuração
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                As variáveis de ambiente do Supabase não estão configuradas. 
                Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductList products={products.slice(0,4)} /> {/* Animation applied via ProductCard's index prop */}
              <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <Link href="/products" passHref> {/* Link to all products page */}
                     <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-10 py-3 text-base">
                        Ver todos os produtos
                    </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure seus produtos no painel administrativo para visualizá-los aqui.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 container mx-auto px-4 animate-fade-in-up" style={{ animationDelay: '600ms' }} id="contato">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-3">Entre em Contato</h2>
            <p className="text-lg text-foreground/70 mb-8">Dúvidas sobre nossos produtos? Nossa equipe está pronta para ajudar.</p>
            <Link href="/contato" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 py-3 text-base">
                Falar Conosco
              </Button>
            </Link>
        </div>
      </section>
    </div>
  );
}
