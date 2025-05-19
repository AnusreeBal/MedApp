import { useState } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function CartScreen() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1 || newQuantity > 5) return;

    setUpdatingQuantity(itemId);
    try {
      const cartItemRef = doc(db, 'users', user.uid, 'cart', itemId);
      await updateDoc(cartItemRef, { quantity: newQuantity });
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'cart', itemId));
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Cart</ThemedText>
      </ThemedView>

      {cartItems.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color="#CBD5E1" />
          <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/(tabs)')}
          >
            <ThemedText style={styles.continueButtonText}>Continue Shopping</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ThemedView style={styles.cartItem}>
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/medicine-placeholder.png')}
                  style={styles.itemImage}
                />
                <ThemedView style={styles.itemDetails}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemPrice}>₹{item.price}</ThemedText>
                  
                  <ThemedView style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updatingQuantity === item.id}
                    >
                      <Ionicons name="remove" size={20} color="#6366F1" />
                    </TouchableOpacity>
                    
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingQuantity === item.id}
                    >
                      <Ionicons name="add" size={20} color="#6366F1" />
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
              </ThemedView>
            )}
          />

          <ThemedView style={styles.footer}>
            <ThemedView style={styles.totalContainer}>
              <ThemedText style={styles.totalText}>Total:</ThemedText>
              <ThemedText style={styles.totalAmount}>₹{calculateTotal()}</ThemedText>
            </ThemedView>

            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => router.push('/checkout')}
            >
              <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </>
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
  cartItem: {
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
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
  },
  removeButton: {
    padding: 8,
    alignSelf: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#059669',
  },
  checkoutButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
});