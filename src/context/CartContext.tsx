
"use client";
import type { CartItem, Product } from '@/lib/types';
import { CartService } from '@/lib/services/cartService';
import { useAuth } from '@/hooks/useAuth';
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Carregar carrinho do banco ou localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Carregar do banco de dados
          const cartItems = await CartService.getCartItems(currentUser.id);
          setCart(cartItems);

          // Migrar dados do localStorage se existirem
          const localCart = localStorage.getItem('artesaniCart');
          if (localCart) {
            const localCartItems = JSON.parse(localCart);
            if (localCartItems.length > 0) {
              await CartService.migrateLocalCart(currentUser.id, localCartItems);
              // Recarregar carrinho após migração
              const updatedCart = await CartService.getCartItems(currentUser.id);
              setCart(updatedCart);
              // Limpar localStorage
              localStorage.removeItem('artesaniCart');
            }
          }
        } catch (error) {
          console.error('Erro ao carregar carrinho:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Usuário não logado - usar localStorage
        const localCart = localStorage.getItem('artesaniCart');
        setCart(localCart ? JSON.parse(localCart) : []);
      }
    };

    loadCart();
  }, [currentUser]);

  // Salvar no localStorage quando não logado
  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      localStorage.setItem('artesaniCart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  const addToCart = async (product: Product) => {
    if (currentUser) {
      setLoading(true);
      try {
        await CartService.addToCart(currentUser.id, product.id, 1);
        const updatedCart = await CartService.getCartItems(currentUser.id);
        setCart(updatedCart);
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Lógica para localStorage (usuário não logado)
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (currentUser) {
      setLoading(true);
      try {
        await CartService.removeFromCart(currentUser.id, productId);
        const updatedCart = await CartService.getCartItems(currentUser.id);
        setCart(updatedCart);
      } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (currentUser) {
      setLoading(true);
      try {
        await CartService.updateQuantity(currentUser.id, productId, quantity);
        const updatedCart = await CartService.getCartItems(currentUser.id);
        setCart(updatedCart);
      } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCart((prevCart) => {
        if (quantity <= 0) {
          return prevCart.filter((item) => item.id !== productId);
        }
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
      });
    }
  };

  const clearCart = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        await CartService.clearCart(currentUser.id);
        setCart([]);
      } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCart([]);
    }
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
