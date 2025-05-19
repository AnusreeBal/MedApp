import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AddToCartSheetProps {
  medicine: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onClose: () => void;
}

export function AddToCartSheet({ 
  medicine, 
  quantity, 
  onQuantityChange, 
  onClose 
}: AddToCartSheetProps) {
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add items to cart');
      return;
    }

    try {
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

      if (medicine.imageUrl) {
        cartItem.imageUrl = medicine.imageUrl;
      }

      await addDoc(collection(db, 'users', user.uid, 'cart'), cartItem);
      onClose();
      Alert.alert('Success', 'Added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  return (
    <ThemedView style={styles.overlay}>
      <TouchableOpacity 
        style={styles.backdrop}
        onPress={onClose}
      />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Add to Cart</ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedView style={styles.medicineInfo}>
            <ThemedText style={styles.medicineName}>{medicine.name}</ThemedText>
            <ThemedText style={styles.medicinePrice}>₹{medicine.price}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => quantity > 1 && onQuantityChange(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color="#6366F1" />
            </TouchableOpacity>
            
            <ThemedText style={styles.quantity}>{quantity}</ThemedText>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => quantity < 5 && onQuantityChange(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#6366F1" />
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <ThemedText style={styles.continueText}>
              Continue • ₹{medicine.price * quantity}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  medicineInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    padding: 12,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 24,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});