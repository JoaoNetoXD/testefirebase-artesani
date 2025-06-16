
"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category } from '@/lib/types';
import { Search, ShoppingCart, User, Heart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
// Alterar esta linha:
// import { Logo } from '@/components/shared/Logo';
// Para:
import Logo from '@/components/shared/Logo';
import SideCart from '@/components/cart/SideCart';

export function Header() {
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    };
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const navigationItems = [
    { href: '/', label: 'Início' },
    { href: '/products', label: 'Produtos' },
    ...categories.map(cat => ({ href: `/category/${cat.slug}`, label: cat.name })),
    { href: '/sobre-nos', label: 'Sobre Nós' },
  ];

  const mainNavLinks = navigationItems;

  const cartItemCount = isMounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const favoriteItemCount = isMounted ? favorites.length : 0;

  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50 rounded-b-xl">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4 md:hidden">
        <Logo width={69} height={69} priority />
        <div className="flex items-center space-x-1.5">
          {loading && (
            <div className="flex items-center space-x-1.5 text-sm p-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!loading && currentUser && (
            <Link href="/account" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors p-2 rounded-md hover:bg-primary-foreground/10">
              <User size={20} />
            </Link>
          )}
          {!loading && !currentUser && (
            <Link href="/login" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors text-sm p-2 rounded-md hover:bg-primary-foreground/10">
              <User size={20} />
            </Link>
          )}
          <Link href="/account/favorites" passHref>
            <Button variant="ghost" size="icon" aria-label="Meus Favoritos" className="relative hover:bg-primary-foreground/10">
              <Heart />
              {isMounted && favoriteItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                  {favoriteItemCount}
                </span>
              )}
            </Button>
          </Link>
          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Carrinho de Compras" className="relative hover:bg-primary-foreground/10">
                <ShoppingCart />
                {isMounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-card text-card-foreground p-0 flex flex-col">
              <SideCart closeSheet={() => setIsCartSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-3 hidden md:flex items-center justify-between gap-4">
        <Logo width={83} height={83} priority />
        <nav className="flex items-center space-x-5 font-medium">
          {mainNavLinks.slice(0, 5).map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-secondary transition-colors pb-1 border-b-2 border-transparent hover:border-secondary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-1.5 md:space-x-3">
          <div className="flex items-center space-x-1.5">
            {loading && (
              <div className="flex items-center space-x-1.5 text-sm p-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="hidden lg:inline">Carregando...</span>
              </div>
            )}
            {!loading && currentUser && (
              <Link href="/account" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors p-2 rounded-md hover:bg-primary-foreground/10">
                <User size={20} />
                <span className="hidden lg:inline">{currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "Minha Conta"}</span>
              </Link>
            )}
            {!loading && !currentUser && (
              <Link href="/login" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors text-sm p-2 rounded-md hover:bg-primary-foreground/10">
                <User size={20} />
                <span className="hidden lg:inline">Entrar</span>
              </Link>
            )}
          </div>
          <Link href="/account/favorites" passHref>
            <Button variant="ghost" size="icon" aria-label="Meus Favoritos" className="relative hover:bg-primary-foreground/10">
              <Heart />
              {isMounted && favoriteItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                  {favoriteItemCount}
                </span>
              )}
            </Button>
          </Link>
          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Carrinho de Compras" className="relative hover:bg-primary-foreground/10">
                <ShoppingCart />
                {isMounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-accent-foreground bg-accent rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-card text-card-foreground p-0 flex flex-col">
              <SideCart closeSheet={() => setIsCartSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="md:hidden bg-primary pb-3">
        <div className="px-4 pt-2 pb-3">
          <div className="relative w-full bg-card rounded-full shadow-md transition-all duration-300 ease-in-out group transform hover:scale-[1.01] hover:shadow-lg focus-within:scale-[1.01] focus-within:shadow-lg">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-card-foreground/60 transition-colors duration-300 group-focus-within:text-accent"
            />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="bg-transparent text-card-foreground placeholder:text-card-foreground/50 rounded-full h-7 pl-10 pr-4 w-full text-sm border-0 focus:ring-0 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            />
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-center justify-center gap-2">
            <Link href="/category/manipulados" passHref className="flex-grow">
              <Button
                variant="ghost"
                size="sm"
                className="flex-grow w-full bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 rounded-full text-xs shadow-md shadow-black/20"
              >
                Manipulados
              </Button>
            </Link>
            <Link href="/category/cosmeticos" passHref className="flex-grow">
              <Button
                variant="ghost"
                size="sm"
                className="flex-grow w-full bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 rounded-full text-xs shadow-md shadow-black/20"
              >
                Cosméticos
              </Button>
            </Link>
            <Link href="/category/suplementos" passHref className="flex-grow">
              <Button
                variant="ghost"
                size="sm"
                className="flex-grow w-full bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 rounded-full text-xs shadow-md shadow-black/20"
              >
                Suplementos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
