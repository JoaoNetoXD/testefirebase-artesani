
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface CategoryNavigationProps {
  categories: Category[];
  currentCategorySlug?: string;
}

export function CategoryNavigation({ categories, currentCategorySlug }: CategoryNavigationProps) {
  return (
    <nav className="mb-8 -mt-12">
      <div className="flex justify-center mb-4">
        <div className="bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 rounded-full text-lg shadow-md shadow-black/20 animate-pulse-light px-6 py-2">
            Navegue por Categorias
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        <Link href="/" passHref>
          <Button 
            variant={!currentCategorySlug ? 'default' : 'outline'} 
            className={!currentCategorySlug 
              ? 'bg-accent text-accent-foreground hover:bg-accent/90 rounded-full' 
              : 'border-muted text-foreground hover:bg-muted hover:text-foreground rounded-full'}
          >
            Todas
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} passHref>
            <Button 
              variant={currentCategorySlug === category.slug ? 'default' : 'outline'} 
              className={currentCategorySlug === category.slug 
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 rounded-full' 
                : 'border-muted text-foreground hover:bg-muted hover:text-foreground rounded-full'}
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
