import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
}

export const CartContext = createContext<CartContextType>({
  cartCount: 0,
  cartItems: [],
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let unsubscribe: () => void;

    if (user) {
      const cartRef = collection(db, 'users', user.uid, 'cart');
      unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CartItem[];
        setCartItems(items);
        setCartCount(snapshot.docs.length);
      });
    } else {
      setCartItems([]);
      setCartCount(0);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);