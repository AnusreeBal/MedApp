import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistItem {
  id: string;
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
}

export default function WishlistScreen() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const querySnapshot = await getDocs(wishlistRef);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', itemId));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      Alert.alert(
        'Success',
        'Item removed from wishlist',
        [{ text: 'OK', style: 'default' }],
        { userInterfaceStyle: 'light' }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Wishlist</ThemedText>
      </ThemedView>

      {wishlistItems.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#CBD5E1" />
          <ThemedText style={styles.emptyText}>Your wishlist is empty</ThemedText>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={styles.continueButtonText}>
              Continue Shopping
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemCard}
              onPress={() => router.push(`/product/${item.medicineId}`)}
              activeOpacity={0.7}
            >
              <Image
                source={
                  item.imageUrl 
                    ? { uri: item.imageUrl }
                    : require('@/assets/images/medicine-placeholder.png')
                }
                style={styles.itemImage}
              />
              <ThemedView style={styles.itemDetails}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemBrand}>{item.brand}</ThemedText>
                <ThemedText style={styles.itemPrice}>₹{item.price}</ThemedText>
              </ThemedView>
              <TouchableOpacity
                style={styles.wishlistButton}
                onPress={() => removeFromWishlist(item.id)}
              >
                <Ionicons name="heart" size={24} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  listContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  wishlistButton: {
    padding: 8,
    alignSelf: 'center',
  }
});