
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category } from '@/lib/types';
import { Search, ShoppingCart, User, Heart, Phone, Mail, Info, LogOut, Loader2, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import SideCart from '@/components/cart/SideCart'; // Placeholder for now

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Ainda pode ser usado para o side cart
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { currentUser, logout, loading } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="bg-primary text-primary-foreground/90">
        <div className="container mx-auto px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:+558632218576" className="flex items-center gap-1 hover:text-primary-foreground">
              <Phone size={14} />
              (86) 3221-8576
            </a>
            <a href="mailto:artesani.marketplace@gmail.com" className="flex items-center gap-1 hover:text-primary-foreground">
              <Mail size={14} />
              artesani.marketplace@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-1 mt-1 sm:mt-0">
            <Info size={14} />
            Frete grátis até 3km Teresina-PI
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Logo width={60} height={60} priority />

          <nav className="hidden lg:flex items-center space-x-5 font-medium">
            {mainNavLinks.slice(0, 5).map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-secondary transition-colors pb-1 border-b-2 border-transparent hover:border-secondary">
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex-1 flex justify-end items-center space-x-1.5 md:space-x-3">
            <div className="relative w-full max-w-xs hidden md:block">
              <Input 
                type="search" 
                placeholder="Buscar produtos..." 
                className="bg-card text-card-foreground placeholder:text-card-foreground/60 rounded-full h-10 pl-10 pr-4 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-card-foreground/60" />
            </div>

            {/* User Auth Section Wrapper - Visível em todas as telas */}
            <div className="flex items-center space-x-1.5">
              {loading && (
                <div className="flex items-center space-x-1.5 text-sm p-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="hidden lg:inline">Carregando...</span>
                </div>
              )}
              {!loading && currentUser && (
                <>
                  <Link href="/account" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors p-2 rounded-md hover:bg-primary-foreground/10">
                    <User size={20} />
                    <span className="hidden lg:inline">{currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "Minha Conta"}</span>
                  </Link>
                  {/* Botão de Logout é melhor dentro da página de conta ou menu de perfil */}
                </>
              )}
              {!loading && !currentUser && (
                <Link href="/login" passHref className="flex items-center gap-1.5 hover:text-secondary transition-colors text-sm p-2 rounded-md hover:bg-primary-foreground/10">
                  <User size={20} />
                  <span className="hidden lg:inline">Entrar</span>
                </Link>
              )}
            </div>
            {/* End User Auth Section Wrapper */}

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

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
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
                <SideCart closeSheet={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

          {/* O antigo Sheet de navegação mobile foi removido daqui */}
        </div>
        <div className="md:hidden bg-primary px-4 pb-3">
            <div className="relative w-full">
              <Input 
                type="search" 
                placeholder="Buscar produtos..." 
                className="bg-card text-card-foreground placeholder:text-card-foreground/60 rounded-full h-10 pl-10 pr-4 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-card-foreground/60" />
            </div>
        </div>
      </div>
    </header>
  );
}
