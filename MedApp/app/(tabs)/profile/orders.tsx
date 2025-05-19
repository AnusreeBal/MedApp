import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Order {
  id: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: any;
}

interface OrderItem {
  medicineId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'orders', orderId), {
                status: 'cancelled',
                updatedAt: new Date()
              });
              // Refresh orders list
              fetchOrders();
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return amount ? amount.toFixed(2) : '0.00';
  };

  const getExpectedDeliveryDate = (createdAt: any) => {
    const orderDate = new Date(createdAt.seconds * 1000);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 5); // Adding 5 days for delivery

    return deliveryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {orders.map((order) => (
          <TouchableOpacity 
            key={order.id}
            style={styles.orderCard}
          >
            <View style={styles.orderHeader}>
              <ThemedText style={styles.orderId}>Order #{order.orderId}</ThemedText>
              <View style={styles.statusContainer}>
                <ThemedText style={styles.statusText}>{order.status}</ThemedText>
              </View>
            </View>

            <View style={styles.medicineList}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.medicineItem}>
                  {item.imageUrl && (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.medicineImage} 
                    />
                  )}
                  <View style={styles.medicineDetails}>
                    <ThemedText style={styles.medicineName}>{item.name}</ThemedText>
                    <ThemedText style={styles.medicineQuantity}>Qty: {item.quantity}</ThemedText>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.orderFooter}>
              <View>
                <ThemedText style={styles.orderDate}>
                  Ordered on {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.deliveryDate}>
                  Expected delivery by {getExpectedDeliveryDate(order.createdAt)}
                </ThemedText>
              </View>
              
              {/* Add cancel button only for pending orders */}
              {order.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelOrder(order.id)}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  content: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  orderDate: {
    fontSize: 14,
    color: '#64748B',
  },
  deliveryDate: {
    fontSize: 14,
    color: '#6366F1',
    marginTop: 4,
    fontWeight: '500'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  medicineList: {
    marginTop: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  medicineImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  medicineDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  medicineQuantity: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  orderFooter: {
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  }
});