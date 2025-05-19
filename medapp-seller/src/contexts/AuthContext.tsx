import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface SellerData {
  pharmacyName: string;
  licenseNumber: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  user: User | null;  // Added for backward compatibility
  sellerData: SellerData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verify if user is a seller
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
          
          if (userDoc.data()?.role === 'seller' && sellerDoc.exists()) {
            setCurrentUser(user);
            setSellerData(sellerDoc.data() as SellerData);
            setIsAuthenticated(true);
          } else {
            await auth.signOut();
            setCurrentUser(null);
            setSellerData(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Auth state check error:', error);
          setCurrentUser(null);
          setSellerData(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setSellerData(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
      
      if (userDoc.data()?.role !== 'seller' || !sellerDoc.exists()) {
        await auth.signOut();
        throw new Error('Access denied. Seller account required.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    user: currentUser, // Added for backward compatibility
    sellerData,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
