
"use client";
import type { Product } from '@/lib/types';
import { FavoritesService } from '@/lib/services/favoritesService';
import { useAuth } from '@/hooks/useAuth';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Carregar favoritos do banco ou localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Carregar do banco de dados
          const favoriteItems = await FavoritesService.getFavorites(currentUser.id);
          const favoriteProducts = favoriteItems.map(item => item.product).filter(Boolean) as Product[];
          setFavorites(favoriteProducts);

          // Migrar dados do localStorage se existirem
          const localFavorites = localStorage.getItem('artesaniFavorites');
          if (localFavorites) {
            const localFavoriteItems = JSON.parse(localFavorites);
            if (localFavoriteItems.length > 0) {
              await FavoritesService.migrateLocalFavorites(currentUser.id, localFavoriteItems);
              // Recarregar favoritos após migração
              const updatedFavorites = await FavoritesService.getFavorites(currentUser.id);
              const updatedProducts = updatedFavorites.map(item => item.product).filter(Boolean) as Product[];
              setFavorites(updatedProducts);
              // Limpar localStorage
              localStorage.removeItem('artesaniFavorites');
            }
          }
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Usuário não logado - usar localStorage
        const localFavorites = localStorage.getItem('artesaniFavorites');
        setFavorites(localFavorites ? JSON.parse(localFavorites) : []);
      }
    };

    loadFavorites();
  }, [currentUser]);

  // Salvar no localStorage quando não logado
  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      localStorage.setItem('artesaniFavorites', JSON.stringify(favorites));
    }
  }, [favorites, currentUser]);

  const addToFavorites = async (product: Product) => {
    if (currentUser) {
      setLoading(true);
      try {
        await FavoritesService.addToFavorites(currentUser.id, product.id);
        setFavorites((prevFavorites) => {
          if (!prevFavorites.find(p => p.id === product.id)) {
            return [...prevFavorites, product];
          }
          return prevFavorites;
        });
      } catch (error) {
        console.error('Erro ao adicionar aos favoritos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setFavorites((prevFavorites) => {
        if (!prevFavorites.find(p => p.id === product.id)) {
          return [...prevFavorites, product];
        }
        return prevFavorites;
      });
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (currentUser) {
      setLoading(true);
      try {
        await FavoritesService.removeFromFavorites(currentUser.id, productId);
        setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== productId));
      } catch (error) {
        console.error('Erro ao remover dos favoritos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setFavorites((prevFavorites) => prevFavorites.filter((item) => item.id !== productId));
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some(p => p.id === productId);
  };

  const toggleFavorite = async (product: Product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      toggleFavorite,
      loading
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
