
import Link from 'next/link';
import type { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface CategoryNavigationProps {
  categories: Category[];
  currentCategorySlug?: string;
}

export function CategoryNavigation({ categories, currentCategorySlug }: CategoryNavigationProps) {
  return (
    <nav className="mb-8">
      <h2 className="text-2xl font-headline mb-4 text-center md:text-left">Navegue por Categorias</h2>
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
