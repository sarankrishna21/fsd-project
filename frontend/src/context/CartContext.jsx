import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (book) => {
    setItems(prev => {
      if (prev.find(i => i.id === book.id)) return prev;
      return [...prev, book];
    });
  };

  const removeFromCart = (bookId) => {
    setItems(prev => prev.filter(i => i.id !== bookId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (bookId) => items.some(i => i.id === bookId);

  const total = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
