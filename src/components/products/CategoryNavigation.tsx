
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
      <h2 className="text-xl font-headline mb-4">Categorias</h2>
      <div className="flex flex-wrap gap-2">
        <Link href="/" passHref>
          <Button variant={!currentCategorySlug ? 'default' : 'outline'} className={!currentCategorySlug ? 'bg-primary text-primary-foreground' : ''}>
            Todas
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} passHref>
            <Button variant={currentCategorySlug === category.slug ? 'default' : 'outline'} className={currentCategorySlug === category.slug ? 'bg-primary text-primary-foreground' : ''}>
              {category.name}
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
