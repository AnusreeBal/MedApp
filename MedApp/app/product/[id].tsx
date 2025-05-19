import { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AddToCartSheet } from '@/components/AddToCartSheet';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  sellerId: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState('');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        const medicineDoc = await getDoc(doc(db, 'medicines', id as string));
        if (medicineDoc.exists()) {
          const medicineData = {
            id: medicineDoc.id,
            ...medicineDoc.data()
          } as Medicine;
          setMedicine(medicineData);

          // Fetch seller details
          try {
            const sellerDoc = await getDoc(doc(db, 'sellers', medicineData.sellerId));
            if (sellerDoc.exists()) {
              setSellerName(sellerDoc.data().pharmacyName || 'Unknown Seller');
            }
          } catch (sellerError) {
            console.log('Error fetching seller details:', sellerError);
            setSellerName('Unknown Seller');
          }
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicineDetails();
    }
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && medicine) {
        const wishlistRef = doc(db, 'users', user.uid, 'wishlist', medicine.id);
        const wishlistDoc = await getDoc(wishlistRef);
        setIsInWishlist(wishlistDoc.exists());
      }
    };

    checkWishlistStatus();
  }, [user, medicine]);

  const handleWishlist = async () => {
    if (!user || !medicine) {
      Alert.alert('Error', 'Please login to add to wishlist');
      return;
    }

    const wishlistRef = doc(db, 'users', user.uid, 'wishlist', medicine.id);

    try {
      if (isInWishlist) {
        await deleteDoc(wishlistRef);
        setIsInWishlist(false);
        Alert.alert('Success', 'Removed from wishlist');
      } else {
        // Create wishlist item data with optional imageUrl
        const wishlistData: { 
          medicineId: string;
          name: string;
          brand: string;
          price: number;
          addedAt: string;
          imageUrl?: string;
        } = {
          medicineId: medicine.id,
          name: medicine.name,
          brand: medicine.brand,
          price: medicine.price,
          addedAt: new Date().toISOString()
        };

        // Only add imageUrl if it exists
        if (medicine.imageUrl) {
          wishlistData.imageUrl = medicine.imageUrl;
        }

        await setDoc(wishlistRef, wishlistData);
        setIsInWishlist(true);
        Alert.alert('Success', 'Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add items to cart');
      return;
    }

    if (!medicine || medicine.stock <= 0) {
      Alert.alert('Error', 'Out of stock');
      return;
    }

    setShowAddToCart(true);
  };

  const handleContinue = async () => {
    try {
      if (!user || !medicine) {
        throw new Error('User not logged in or medicine data is not available');
      }

      const cartItem: {
        medicineId: string;
        name: string;
        brand: string;
        price: number;
        quantity: number;
        addedAt: string;
        imageUrl?: string;
      } = {
        medicineId: medicine.id,
        name: medicine.name,
        brand: medicine.brand,
        price: medicine.price,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };

      if (medicine?.imageUrl) {
        cartItem.imageUrl = medicine.imageUrl;
      }

      await addDoc(collection(db, 'users', user.uid, 'cart'), cartItem);
      setShowAddToCart(false);
      setQuantity(1);

      Alert.alert('Success', 'Added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  if (!medicine) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Image 
          source={
            medicine.imageUrl 
              ? { uri: medicine.imageUrl }
              : require('@/assets/images/medicine-placeholder.png')
          }
          style={styles.image}
        />

        <ThemedView style={styles.details}>
          <ThemedText style={styles.name}>{medicine.name}</ThemedText>
          <ThemedText style={styles.brand}>{medicine.brand}</ThemedText>
          <ThemedText style={styles.price}>₹{medicine.price}</ThemedText>
          <ThemedText style={styles.description}>{medicine.description}</ThemedText>
          
          <ThemedView style={[
            styles.stockContainer,
            { 
              backgroundColor: medicine.stock > 0 ? '#F0FDF4' : '#FEF2F2',
              borderColor: medicine.stock > 0 ? '#BBF7D0' : '#FECACA'
            }
          ]}>
            <Ionicons 
              name={medicine.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={medicine.stock > 0 ? '#059669' : '#DC2626'} 
            />
            <ThemedText style={[
              styles.stockStatus,
              { color: medicine.stock > 0 ? '#059669' : '#DC2626' }
            ]}>
              {medicine.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.wishlistButton,
            isInWishlist && styles.wishlistActiveButton
          ]}
          onPress={handleWishlist}
        >
          <Ionicons 
            name={isInWishlist ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist ? "#EF4444" : "#6366F1"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.cartButton,
            medicine.stock === 0 && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={medicine.stock === 0}
        >
          <ThemedText style={styles.cartButtonText}>
            {medicine.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {showAddToCart && medicine && (
        <AddToCartSheet
          medicine={medicine}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onContinue={handleContinue}
          onClose={() => {
            setShowAddToCart(false);
            setQuantity(1);
          }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 100,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  details: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  brand: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  sellerName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  stockStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  wishlistButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    marginRight: 12,
  },
  wishlistActiveButton: {
    backgroundColor: '#FEE2E2',
  },
  cartButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
});