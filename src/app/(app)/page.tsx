
import { ProductList } from '@/components/products/ProductList';
import { CategoryNavigation } from '@/components/products/CategoryNavigation';
import { Button } from "@/components/ui/button";
import { Star, Truck, ClipboardList, Award } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { ProductService } from '@/lib/services/productService';
import { CategoryService } from '@/lib/services/categoryService';
import type { Product, Category } from '@/lib/types';

export default async function HomePage() {
  const products: Product[] = await ProductService.getAllProducts();
  const categories: Category[] = await CategoryService.getAllCategories();

  const benefits = [
    { icon: Award, title: "Qualidade Garantida", description: "Produtos com certificação." },
    { icon: Truck, title: "Entrega Rápida", description: "Receba em todo o Brasil." },
    { icon: ClipboardList, title: "Pedidos Online", description: "Fácil e seguro." },
  ];

  return (
    <div className="text-foreground"> {/* Ensure text color contrasts with dark background */}
      {/* Hero Section */}
      <section className="py-12 md:py-20 overflow-hidden"> {/* Added overflow-hidden for animations */}
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-8 md:gap-12">
          {/* Left Column: Text Content */}
          <div className="space-y-6 text-center md:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold">
              Sua Saúde em <span className="text-secondary">Boas Mãos</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80">
              Medicamentos manipulados com qualidade farmacêutica, desenvolvidos especialmente para suas necessidades.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex flex-col items-center md:items-start text-center md:text-left p-3 rounded-lg hover:bg-primary-foreground/5 transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${200 + index * 150}ms` }}
                >
                  <benefit.icon className="h-8 w-8 text-secondary mb-2" />
                  <h3 className="font-semibold text-md">{benefit.title}</h3>
                  <p className="text-xs text-foreground/70">{benefit.description}</p>
                </div>
              ))}
            </div>
            <div
              className="flex flex-col sm:flex-row gap-3 pt-6 justify-center md:justify-start animate-fade-in-up"
              style={{ animationDelay: '700ms' }}
            >
              <Link href="/category/manipulados" passHref>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto rounded-full px-8 py-3 text-base">
                  Ver Catálogo
                </Button>
              </Link>
              <Link href="/sobre-nos" passHref>
                <Button size="lg" variant="outline" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full sm:w-auto rounded-full px-8 py-3 text-base border-secondary hover:border-secondary/90">
                  Sobre Nós
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: New Product Image */}
          <div
            className="flex justify-center md:justify-end mt-8 md:mt-0 animate-fade-in -mx-6 md:mx-0"
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl md:rounded-2xl">
              <Image
                src="/images/products/3produtosincial.png"
                alt="Produtos Artesani em destaque"
                width={1600}
                height={1200}
                sizes="(max-width: 768px) 130vw, (max-width: 1024px) 65vw, 850px"
                className="object-contain w-full h-auto drop-shadow-none transform transition-all duration-700 hover:scale-105 animate-pulse-slow scale-125 md:scale-100"
                data-ai-hint="product lineup pharmacy"
                priority
                style={{
                  filter: 'drop-shadow(0 0 0 transparent)',
                  background: 'transparent',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.8) 85%, transparent 100%), linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12" id="sobre">
        <div className="container mx-auto px-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CategoryNavigation categories={categories} />
        </div>
      </section>

      <section className="py-12 bg-primary-foreground/5 overflow-hidden"> {/* Added overflow-hidden */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-3">Nossos Produtos</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Medicamentos manipulados com a mais alta qualidade e eficácia, desenvolvidos especialmente para suas necessidades de saúde.
            </p>
          </div>
          <ProductList products={products.slice(0,4)} /> {/* Animation applied via ProductCard's index prop */}
          <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <Link href="/products" passHref> {/* Link to all products page */}
                 <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-10 py-3 text-base">
                    Ver todos os produtos
                </Button>
            </Link>
          </div>
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
