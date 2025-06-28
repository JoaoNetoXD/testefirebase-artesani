'use client';

import { useState, useEffect } from 'react';
import { ProductList } from '@/components/products/ProductList';
import { AdvancedSearch } from '@/components/products/AdvancedSearch';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { ProductService } from '@/lib/services/productService';
import { CategoryService } from '@/lib/services/categoryService';
import type { Product, Category } from '@/lib/types';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getAllProducts(),
          CategoryService.getAllCategories()
        ]);
        
        setAllProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearchResults = (results: Product[]) => {
    setFilteredProducts(results);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-12 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div>
        <Breadcrumbs 
          items={[{ label: 'Produtos', href: '/products', isActive: true }]}
        />
      </div>

      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          Nossos Produtos
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore nossa linha completa de produtos manipulados, cosméticos e suplementos
        </p>
      </div>

      {/* Search */}
      <div>
        <AdvancedSearch
          products={allProducts}
          categories={categories}
          onResultsChange={handleSearchResults}
          placeholder="Buscar por nome, descrição, ingredientes..."
        />
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            {filteredProducts.length !== allProducts.length && (
              <span className="ml-1">
                de {allProducts.length} total
              </span>
            )}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <ProductList products={filteredProducts} />
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou usar termos de busca diferentes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
