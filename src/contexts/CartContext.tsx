import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem, Product } from '../lib/types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCartItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch cart items');
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const existingItem = items.find(item => item.product_id === product.id);

      if (existingItem) {
        await updateQuantity(product.id, existingItem.quantity + 1);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1
          });

        if (error) throw error;
        toast.success('Added to cart');
        await fetchCartItems();
      }
    } catch (error: any) {
      toast.error('Failed to add item to cart');
      console.error('Error:', error.message);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      toast.success('Removed from cart');
      await fetchCartItems();
    } catch (error: any) {
      toast.error('Failed to remove item from cart');
      console.error('Error:', error.message);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error: any) {
      toast.error('Failed to update quantity');
      console.error('Error:', error.message);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Cart cleared');
      await fetchCartItems();
    } catch (error: any) {
      toast.error('Failed to clear cart');
      console.error('Error:', error.message);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}