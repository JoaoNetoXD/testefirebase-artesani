'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import useDebounce from '@/hooks/useDebounce';
import type { Product, Category } from '@/lib/types';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
  inStock: boolean;
  tags: string[];
}

interface AdvancedSearchProps {
  products: Product[];
  categories: Category[];
  onResultsChange: (results: Product[]) => void;
  placeholder?: string;
}

export function AdvancedSearch({ 
  products, 
  categories, 
  onResultsChange,
  placeholder = "Buscar produtos..." 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    priceRange: [0, 1000],
    sortBy: 'name',
    inStock: false,
    tags: []
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(filters.query, 300);

  // Extract available tags from products
  useEffect(() => {
    const tags = new Set<string>();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tags.add(tag));
      } else if (product.tags && typeof product.tags === 'string') {
        // Handle case where tags is a string (comma-separated)
        product.tags.split(',').map(tag => tag.trim()).forEach(tag => {
          if (tag) tags.add(tag);
        });
      }
    });
    setAvailableTags(Array.from(tags));
  }, [products]);

  // Get price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const maxPrice = Math.max(...prices);
      setFilters(prev => ({ 
        ...prev, 
        priceRange: [0, Math.ceil(maxPrice)] 
      }));
    }
  }, [products]);

  // Filter and sort products
  const filterProducts = useCallback((filters: SearchFilters) => {
    let filtered = [...products];

    // Text search
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description.toLowerCase().includes(query);
        const ingredientsMatch = product.ingredients?.toLowerCase().includes(query);
        
        let tagsMatch = false;
        if (product.tags) {
          if (Array.isArray(product.tags)) {
            tagsMatch = product.tags.some(tag => tag.toLowerCase().includes(query));
          } else if (typeof product.tags === 'string') {
            tagsMatch = product.tags.toLowerCase().includes(query);
          }
        }
        
        return nameMatch || descMatch || ingredientsMatch || tagsMatch;
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category === filters.category ||
        product.category_name === filters.category
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange[0] && 
      product.price <= filters.priceRange[1]
    );

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.tags) return false;
        
        if (Array.isArray(product.tags)) {
          return product.tags.some(tag => filters.tags.includes(tag));
        } else if (typeof product.tags === 'string') {
          const productTagsArray = product.tags.split(',').map(tag => tag.trim());
          return productTagsArray.some(tag => filters.tags.includes(tag));
        }
        
        return false;
      });
    }

    // Sort products
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
    }

    return filtered;
  }, [products, debouncedQuery]);

  // Apply filters when they change
  useEffect(() => {
    const results = filterProducts(filters);
    onResultsChange(results);
  }, [filters, filterProducts, onResultsChange]);

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      priceRange: [0, Math.max(...products.map(p => p.price))],
      sortBy: 'name',
      inStock: false,
      tags: []
    });
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const activeFiltersCount = [
    filters.category,
    filters.inStock,
    filters.tags.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder={placeholder}
          value={filters.query}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
          className="pl-10 pr-12"
          aria-label="Buscar produtos"
        />
        
        {/* Filter Toggle */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              aria-label={`Filtros avançados${activeFiltersCount > 0 ? ` (${activeFiltersCount} ativos)` : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros Avançados</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category-select">Categoria</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label>Faixa de Preço</Label>
                <div className="px-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={Math.max(...products.map(p => p.price))}
                    step={10}
                    className="w-full"
                    aria-label="Faixa de preço"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R$ {filters.priceRange[0]}</span>
                  <span>R$ {filters.priceRange[1]}</span>
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sort-select">Ordenar por</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as SearchFilters['sortBy'] }))}
                >
                  <SelectTrigger id="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                    <SelectItem value="price-asc">Menor Preço</SelectItem>
                    <SelectItem value="price-desc">Maior Preço</SelectItem>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, inStock: !!checked }))}
                />
                <Label htmlFor="in-stock" className="text-sm font-normal">
                  Apenas produtos em estoque
                </Label>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          const isSelected = filters.tags.includes(tag);
                          setFilters(prev => ({
                            ...prev,
                            tags: isSelected
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }));
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                disabled={activeFiltersCount === 0}
              >
                Limpar Filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {(filters.category || filters.inStock || filters.tags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                aria-label={`Remover filtro ${filters.category}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.inStock && (
            <Badge variant="secondary" className="gap-1">
              Em estoque
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setFilters(prev => ({ ...prev, inStock: false }))}
                aria-label="Remover filtro em estoque"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
                aria-label={`Remover filtro ${tag}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 